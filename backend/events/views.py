from django.db.models import Count, Q
from rest_framework import generics, status
from rest_framework.permissions import SAFE_METHODS, BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Event, EventRSVP
from .serializers import EventCreateSerializer, EventRSVPSerializer, EventSerializer


class IsEventCreatorOrReadOnly(BasePermission):
	def has_object_permission(self, request, view, obj: Event):
		if request.method in SAFE_METHODS:
			return True
		return getattr(obj, 'creator_id', None) == getattr(request.user, 'id', None)


class EventListCreateView(generics.ListCreateAPIView):
	queryset = (
		Event.objects.select_related('creator')
		.annotate(
			going_count=Count('rsvps', filter=Q(rsvps__status=EventRSVP.Status.GOING)),
		)
		.all()
	)

	def get_serializer_class(self):
		if self.request.method == 'POST':
			return EventCreateSerializer
		return EventSerializer

	def get_serializer_context(self):
		ctx = super().get_serializer_context()
		ctx['request'] = self.request
		return ctx

	def perform_create(self, serializer):
		serializer.save(creator=self.request.user)

	def create(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		event = serializer.save(creator=request.user)

		read_serializer = EventSerializer(event, context=self.get_serializer_context())
		return Response(read_serializer.data, status=status.HTTP_201_CREATED)


class EventRSVPView(APIView):
	def post(self, request, event_id: int):
		try:
			event = Event.objects.get(pk=event_id)
		except Event.DoesNotExist:
			return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

		serializer = EventRSVPSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		status_value = serializer.validated_data['status']

		EventRSVP.objects.update_or_create(
			event=event,
			user=request.user,
			defaults={'status': status_value},
		)

		return Response({'event': event.id, 'status': status_value}, status=status.HTTP_200_OK)

	def delete(self, request, event_id: int):
		EventRSVP.objects.filter(event_id=event_id, user=request.user).delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
	permission_classes = [IsAuthenticated, IsEventCreatorOrReadOnly]
	serializer_class = EventSerializer
	queryset = (
		Event.objects.select_related('creator')
		.annotate(
			going_count=Count('rsvps', filter=Q(rsvps__status=EventRSVP.Status.GOING)),
		)
		.all()
	)

# Create your views here.
