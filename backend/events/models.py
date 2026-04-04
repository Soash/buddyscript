from django.conf import settings
from django.db import models


class Event(models.Model):
	creator = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='created_events',
	)
	name = models.CharField(max_length=200)
	starts_at = models.DateTimeField()
	location = models.CharField(max_length=255, blank=True)
	details = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-starts_at', '-created_at']

	def __str__(self) -> str:
		return self.name


class EventRSVP(models.Model):
	class Status(models.TextChoices):
		INTERESTED = 'interested', 'Interested'
		GOING = 'going', 'Going'

	event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='rsvps')
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='event_rsvps')
	status = models.CharField(max_length=20, choices=Status.choices)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('event', 'user')

	def __str__(self) -> str:
		return f"{self.user_id}:{self.event_id}:{self.status}"

# Create your models here.
