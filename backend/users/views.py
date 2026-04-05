from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q
from django.db.models import BooleanField, IntegerField, OuterRef, Subquery, Exists, Value

from .models import Follow, FriendRequest, Friendship
from .serializers import RegisterSerializer, UserSerializer, FriendRequestSerializer, DirectoryUserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class OptionalPageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        # Backwards compatible: only paginate when explicitly requested.
        if 'page' not in request.query_params and 'page_size' not in request.query_params:
            return None
        return super().paginate_queryset(queryset, request, view=view)

class RegisterView(generics.CreateAPIView):
    queryset = RegisterSerializer.Meta.model.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_object(self):
        return self.request.user

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)


class UsersDirectoryView(generics.ListAPIView):
    serializer_class = DirectoryUserSerializer
    permission_classes = (IsAuthenticated,)
    pagination_class = OptionalPageNumberPagination

    def get_queryset(self):
        me = self.request.user
        qs = User.objects.exclude(id=me.id)

        q = (self.request.query_params.get('q') or '').strip()
        if q:
            if len(q) < 2:
                return qs.none()

            terms = [t for t in q.split() if t]
            q_filter = Q()
            for term in terms:
                q_filter |= (
                    Q(first_name__istartswith=term)
                    | Q(last_name__istartswith=term)
                    | Q(email__istartswith=term)
                    | Q(role__istartswith=term)
                    | Q(bio__istartswith=term)
                )

            qs = qs.filter(q_filter)

        friendship_exists = Friendship.objects.filter(
            Q(user1=me, user2=OuterRef('pk')) | Q(user2=me, user1=OuterRef('pk'))
        )
        outgoing_request_id = Subquery(
            FriendRequest.objects.filter(sender=me, receiver=OuterRef('pk')).values('id')[:1]
        )
        incoming_request_id = Subquery(
            FriendRequest.objects.filter(sender=OuterRef('pk'), receiver=me).values('id')[:1]
        )
        follow_exists = Follow.objects.filter(follower=me, following=OuterRef('pk'))

        qs = qs.annotate(
            is_friend=Exists(friendship_exists),
            is_following=Exists(follow_exists),
            outgoing_request_id=outgoing_request_id,
            incoming_request_id=incoming_request_id,
        )

        return qs.order_by('first_name', 'last_name', 'id')


class SuggestedUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        me = self.request.user

        friend_ids_1 = Friendship.objects.filter(user1=me).values_list('user2_id', flat=True)
        friend_ids_2 = Friendship.objects.filter(user2=me).values_list('user1_id', flat=True)
        following_ids = Follow.objects.filter(follower=me).values_list('following_id', flat=True)
        outgoing_request_ids = FriendRequest.objects.filter(sender=me).values_list('receiver_id', flat=True)

        exclude_ids = set([me.id])
        exclude_ids.update(list(friend_ids_1))
        exclude_ids.update(list(friend_ids_2))
        exclude_ids.update(list(following_ids))
        exclude_ids.update(list(outgoing_request_ids))

        return User.objects.exclude(id__in=exclude_ids).order_by('?')[:3]


class YouMightLikeView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        me = request.user

        exclude_param = request.query_params.get('exclude_id')
        exclude_id = None
        if exclude_param is not None:
            try:
                exclude_id = int(exclude_param)
            except (TypeError, ValueError):
                exclude_id = None

        friend_ids_1 = Friendship.objects.filter(user1=me).values_list('user2_id', flat=True)
        friend_ids_2 = Friendship.objects.filter(user2=me).values_list('user1_id', flat=True)
        following_ids = Follow.objects.filter(follower=me).values_list('following_id', flat=True)
        outgoing_request_ids = FriendRequest.objects.filter(sender=me).values_list('receiver_id', flat=True)

        exclude_ids = set([me.id])
        exclude_ids.update(list(friend_ids_1))
        exclude_ids.update(list(friend_ids_2))
        exclude_ids.update(list(following_ids))
        exclude_ids.update(list(outgoing_request_ids))
        if exclude_id is not None:
            exclude_ids.add(exclude_id)

        user = User.objects.exclude(id__in=exclude_ids).order_by('?').first()
        if not user:
            return Response(None, status=status.HTTP_200_OK)

        data = UserSerializer(user, context={'request': request}).data
        return Response(data, status=status.HTTP_200_OK)


class FollowToggleView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        if request.user.id == pk:
            return Response({'detail': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        rel = Follow.objects.filter(follower=request.user, following=target)
        if rel.exists():
            rel.delete()
            return Response({'status': 'unfollowed'}, status=status.HTTP_200_OK)
        Follow.objects.create(follower=request.user, following=target)
        return Response({'status': 'followed'}, status=status.HTTP_201_CREATED)


class FollowingListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        following_ids = Follow.objects.filter(follower=self.request.user).values_list('following_id', flat=True)
        return User.objects.filter(id__in=following_ids)


class FollowersListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        follower_ids = Follow.objects.filter(following=self.request.user).values_list('follower_id', flat=True)
        return User.objects.filter(id__in=follower_ids)


class FriendsListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        me = self.request.user
        friend_ids_1 = Friendship.objects.filter(user1=me).values_list('user2_id', flat=True)
        friend_ids_2 = Friendship.objects.filter(user2=me).values_list('user1_id', flat=True)
        ids = set(list(friend_ids_1) + list(friend_ids_2))
        return User.objects.filter(id__in=ids)


class SendFriendRequestView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        if request.user.id == pk:
            return Response({'detail': 'You cannot send a friend request to yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if Friendship.are_friends(request.user.id, target.id):
            return Response({'detail': 'You are already friends.'}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent duplicate requests in either direction.
        existing = FriendRequest.objects.filter(
            Q(sender=request.user, receiver=target) | Q(sender=target, receiver=request.user)
        )
        if existing.exists():
            return Response({'detail': 'A friend request already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        fr = FriendRequest.objects.create(sender=request.user, receiver=target)
        data = FriendRequestSerializer(fr, context={'request': request}).data
        return Response(data, status=status.HTTP_201_CREATED)


class IncomingFriendRequestsView(generics.ListAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return FriendRequest.objects.filter(receiver=self.request.user).select_related('sender', 'receiver').order_by('-created_at')


class SentFriendRequestsView(generics.ListAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return FriendRequest.objects.filter(sender=self.request.user).select_related('sender', 'receiver').order_by('-created_at')


class AcceptFriendRequestView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, request_id):
        try:
            fr = FriendRequest.objects.select_related('sender', 'receiver').get(id=request_id)
        except FriendRequest.DoesNotExist:
            return Response({'detail': 'Friend request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if fr.receiver_id != request.user.id:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)

        if not Friendship.are_friends(fr.sender_id, fr.receiver_id):
            Friendship.objects.create(user1_id=fr.sender_id, user2_id=fr.receiver_id)

        fr.delete()
        return Response({'status': 'accepted'}, status=status.HTTP_200_OK)


class DeclineFriendRequestView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, request_id):
        try:
            fr = FriendRequest.objects.get(id=request_id)
        except FriendRequest.DoesNotExist:
            return Response({'detail': 'Friend request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if fr.receiver_id != request.user.id:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)

        fr.delete()
        return Response({'status': 'declined'}, status=status.HTTP_200_OK)


class CancelFriendRequestView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, request_id):
        try:
            fr = FriendRequest.objects.get(id=request_id)
        except FriendRequest.DoesNotExist:
            return Response({'detail': 'Friend request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if fr.sender_id != request.user.id:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)

        fr.delete()
        return Response({'status': 'canceled'}, status=status.HTTP_200_OK)


class UnfriendView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        if request.user.id == pk:
            return Response({'detail': 'Invalid user.'}, status=status.HTTP_400_BAD_REQUEST)

        a, b = (request.user.id, pk) if request.user.id < pk else (pk, request.user.id)
        Friendship.objects.filter(user1_id=a, user2_id=b).delete()
        return Response({'status': 'unfriended'}, status=status.HTTP_200_OK)
