from rest_framework import serializers

from .models import Event, EventRSVP


class EventSerializer(serializers.ModelSerializer):
    creator_name = serializers.SerializerMethodField()
    my_rsvp_status = serializers.SerializerMethodField()
    going_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'creator',
            'creator_name',
            'name',
            'starts_at',
            'location',
            'details',
            'created_at',
            'my_rsvp_status',
            'going_count',
        ]
        read_only_fields = ['id', 'creator', 'creator_name', 'created_at', 'my_rsvp_status', 'going_count']

    def get_creator_name(self, obj: Event) -> str:
        user = obj.creator
        first = getattr(user, 'first_name', '') or ''
        last = getattr(user, 'last_name', '') or ''
        full = f"{first} {last}".strip()
        return full or getattr(user, 'email', '') or 'User'

    def get_my_rsvp_status(self, obj: Event):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return None

        rsvp = (
            EventRSVP.objects.filter(event=obj, user=request.user)
            .only('status')
            .first()
        )
        return rsvp.status if rsvp else None

    def get_going_count(self, obj: Event) -> int:
        annotated_value = getattr(obj, 'going_count', None)
        if annotated_value is not None:
            return int(annotated_value)

        return EventRSVP.objects.filter(event=obj, status=EventRSVP.Status.GOING).count()


class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['name', 'starts_at', 'location', 'details']


class EventRSVPSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRSVP
        fields = ['status']

    def validate_status(self, value: str) -> str:
        valid = {choice[0] for choice in EventRSVP.Status.choices}
        if value not in valid:
            raise serializers.ValidationError('Invalid RSVP status')
        return value
