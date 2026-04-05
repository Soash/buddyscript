import json

from django.db import transaction
from django.db.models import Q, Max
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.pagination import PageNumberPagination

from .models import Post, Comment, PostLike, CommentLike, PostImage
from .serializers import (
    PostSerializer,
    CommentSerializer,
    UserPublicSerializer,
    PostReactorSerializer,
    CommentReactorSerializer,
)
from django.db.models import Q
from .permissions import IsPostAuthor, IsCommentAuthor


class PostPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    pagination_class = PostPagination

    def get_permissions(self):
        # Only the post author can update/delete; other actions like like/likers
        # should remain available to authenticated users.
        if self.action in {'update', 'partial_update', 'destroy'}:
            return [IsAuthenticated(), IsPostAuthor()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Post.objects.filter(
            Q(visibility='public') | Q(visibility='private', author=user)
        ).select_related('author').prefetch_related(
            'comments', 'comments__author', 'likes', 'likes__user', 'images'
        ).order_by('-created_at')

        author_id = self.request.query_params.get('author')
        if author_id is not None:
            qs = qs.filter(author_id=author_id)

        q = (self.request.query_params.get('q') or '').strip()
        if q:
            if len(q) < 2:
                return qs.none()

            terms = [t for t in q.split() if t]
            q_filter = Q()
            for term in terms:
                q_filter |= (
                    Q(content__istartswith=term)
                    | Q(images__caption__istartswith=term)
                    | Q(author__first_name__istartswith=term)
                    | Q(author__last_name__istartswith=term)
                    | Q(author__email__istartswith=term)
                )

            qs = qs.filter(q_filter).distinct()
        
        return qs

    def create(self, request, *args, **kwargs):
        content = (request.data.get('content') or '').strip()
        visibility = request.data.get('visibility') or 'public'
        uploaded_images = request.FILES.getlist('images')
        legacy_image = request.FILES.get('image')

        if not content and not uploaded_images and not legacy_image:
            return Response(
                {'detail': 'A post must include text content or at least one image.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data={'content': content, 'visibility': visibility})
        serializer.is_valid(raise_exception=True)
        post = serializer.save(author=request.user)

        captions = request.data.getlist('image_captions') if hasattr(request.data, 'getlist') else []

        if uploaded_images:
            for idx, image_file in enumerate(uploaded_images):
                caption = captions[idx] if idx < len(captions) else ''
                PostImage.objects.create(post=post, image=image_file, caption=caption, position=idx)
        elif legacy_image:
            post.image = legacy_image
            post.save(update_fields=['image'])

        out = self.get_serializer(post)
        headers = self.get_success_headers(out.data)
        return Response(out.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        post = self.get_object()

        raw_content = request.data.get('content', None)
        raw_visibility = request.data.get('visibility', None)

        # For PATCH: only update fields that are present.
        if raw_content is not None or not partial:
            post.content = (raw_content or '').strip()

        if raw_visibility is not None or not partial:
            visibility = (raw_visibility or '').strip().lower()
            allowed = {c[0] for c in Post.VISIBILITY_CHOICES}
            if visibility not in allowed:
                raise ValidationError({'visibility': 'Invalid visibility value.'})
            post.visibility = visibility

        # Images
        delete_ids_raw = []
        if hasattr(request.data, 'getlist'):
            delete_ids_raw = request.data.getlist('images_to_delete')
        else:
            maybe = request.data.get('images_to_delete')
            if maybe:
                delete_ids_raw = [maybe]

        delete_ids = []
        for item in delete_ids_raw:
            if item is None:
                continue
            if isinstance(item, str) and ',' in item:
                parts = [p.strip() for p in item.split(',') if p.strip()]
                delete_ids.extend(parts)
            else:
                delete_ids.append(item)

        delete_ids = [int(x) for x in delete_ids if str(x).strip().isdigit()]

        existing_captions = {}
        existing_captions_raw = request.data.get('existing_image_captions')
        if existing_captions_raw:
            try:
                parsed = json.loads(existing_captions_raw)
                if isinstance(parsed, dict):
                    existing_captions = parsed
            except Exception:
                raise ValidationError({'existing_image_captions': 'Must be a JSON object mapping image_id -> caption.'})

        # Normalize keys to ints.
        captions_by_id = {}
        for k, v in (existing_captions or {}).items():
            try:
                image_id = int(k)
            except Exception:
                continue
            captions_by_id[image_id] = (v or '')

        uploaded_images = request.FILES.getlist('images')
        new_captions = request.data.getlist('image_captions') if hasattr(request.data, 'getlist') else []

        clear_legacy_image_raw = request.data.get('clear_legacy_image')
        clear_legacy_image = str(clear_legacy_image_raw).strip().lower() in {'1', 'true', 't', 'yes', 'y', 'on'}

        with transaction.atomic():
            if clear_legacy_image and post.image:
                post.image = None
            post.save()

            if delete_ids:
                PostImage.objects.filter(post=post, id__in=delete_ids).delete()

            for image_id, caption in captions_by_id.items():
                PostImage.objects.filter(post=post, id=image_id).update(caption=caption)

            if uploaded_images:
                start_pos = (PostImage.objects.filter(post=post).aggregate(m=Max('position')).get('m') or -1) + 1
                for idx, image_file in enumerate(uploaded_images):
                    caption = new_captions[idx] if idx < len(new_captions) else ''
                    PostImage.objects.create(post=post, image=image_file, caption=caption, position=start_pos + idx)

            # Enforce: post must have content or at least one image (legacy or PostImage).
            has_any_image = bool(post.image) or PostImage.objects.filter(post=post).exists()
            if not post.content and not has_any_image:
                raise ValidationError({'detail': 'A post must include text content or at least one image.'})

            # Normalize positions after add/remove.
            images = list(PostImage.objects.filter(post=post).order_by('position', 'id'))
            for idx, img in enumerate(images):
                if img.position != idx:
                    img.position = idx
                    img.save(update_fields=['position'])

        # Serialize a fully-prefetched instance (keeps response consistent with list view).
        refreshed = self.get_queryset().filter(pk=post.pk).first() or post
        serializer = self.get_serializer(refreshed)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()

        if post.visibility != 'public' and post.author_id != request.user.id:
            return Response({'detail': 'Only public posts can be liked.'}, status=status.HTTP_403_FORBIDDEN)

        reaction_type = (request.data.get('type') or 'like').strip().lower()
        allowed = {c[0] for c in PostLike.REACTION_CHOICES}
        if reaction_type not in allowed:
            return Response({'detail': 'Invalid reaction type.'}, status=status.HTTP_400_BAD_REQUEST)

        existing = PostLike.objects.filter(user=request.user, post=post).first()
        if existing:
            if existing.reaction_type == reaction_type:
                existing.delete()
                status_text = 'unliked'
                current_reaction = None
            else:
                existing.reaction_type = reaction_type
                existing.save(update_fields=['reaction_type'])
                status_text = 'updated'
                current_reaction = reaction_type
        else:
            PostLike.objects.create(user=request.user, post=post, reaction_type=reaction_type)
            status_text = 'liked'
            current_reaction = reaction_type

        # Keep counters consistent even if signals are async/laggy.
        likes_count = PostLike.objects.filter(post=post).count()
        if post.likes_count != likes_count:
            post.likes_count = likes_count
            post.save(update_fields=['likes_count'])

        latest = PostLike.objects.filter(post=post).select_related('user').order_by('-created_at')[:5]
        latest_data = PostReactorSerializer(latest, many=True, context={'request': request}).data

        return Response(
            {
                'status': status_text,
                'reaction_type': current_reaction,
                'likes_count': likes_count,
                'latest_reactors': latest_data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['get'])
    def reactors(self, request, pk=None):
        post = self.get_object()

        if post.visibility != 'public':
            return Response({'detail': 'Only public post reactions can be viewed.'}, status=status.HTTP_403_FORBIDDEN)

        qs = PostLike.objects.filter(post=post).select_related('user').order_by('-created_at')
        data = PostReactorSerializer(qs, many=True, context={'request': request}).data
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def likers(self, request, pk=None):
        post = self.get_object()

        if post.visibility != 'public':
            return Response({'detail': 'Only public post likes can be viewed.'}, status=status.HTTP_403_FORBIDDEN)

        users = [like.user for like in post.likes.select_related('user').order_by('-created_at')]
        data = UserPublicSerializer(users, many=True, context={'request': request}).data
        return Response(data, status=status.HTTP_200_OK)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in {'update', 'partial_update', 'destroy'}:
            return [IsAuthenticated(), IsCommentAuthor()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        return (
            Comment.objects.select_related('author', 'post')
            .prefetch_related('likes', 'likes__user')
            .filter(Q(post__visibility='public') | Q(post__visibility='private', post__author=user))
            .order_by('created_at')
        )

    def perform_create(self, serializer):
        post = serializer.validated_data.get('post')
        if not post:
            raise ValidationError({'post': 'Post is required.'})

        if post.visibility != 'public' and post.author_id != self.request.user.id:
            raise ValidationError({'post': 'You cannot comment on a private post you cannot access.'})

        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comment = self.get_object()

        reaction_type = (request.data.get('type') or 'like').strip().lower()
        allowed = {c[0] for c in CommentLike.REACTION_CHOICES}
        if reaction_type not in allowed:
            return Response({'detail': 'Invalid reaction type.'}, status=status.HTTP_400_BAD_REQUEST)

        existing = CommentLike.objects.filter(user=request.user, comment=comment).first()
        if existing:
            if existing.reaction_type == reaction_type:
                existing.delete()
                status_text = 'unliked'
                current_reaction = None
            else:
                existing.reaction_type = reaction_type
                existing.save(update_fields=['reaction_type'])
                status_text = 'updated'
                current_reaction = reaction_type
        else:
            CommentLike.objects.create(user=request.user, comment=comment, reaction_type=reaction_type)
            status_text = 'liked'
            current_reaction = reaction_type

        likes_count = CommentLike.objects.filter(comment=comment).count()
        if comment.likes_count != likes_count:
            comment.likes_count = likes_count
            comment.save(update_fields=['likes_count'])

        return Response(
            {
                'status': status_text,
                'reaction_type': current_reaction,
                'likes_count': likes_count,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['get'])
    def reactors(self, request, pk=None):
        comment = self.get_object()
        qs = CommentLike.objects.filter(comment=comment).select_related('user').order_by('-created_at')
        data = CommentReactorSerializer(qs, many=True, context={'request': request}).data
        return Response(data, status=status.HTTP_200_OK)
