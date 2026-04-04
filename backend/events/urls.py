from django.urls import path

from .views import EventDetailView, EventListCreateView, EventRSVPView

urlpatterns = [
    path('', EventListCreateView.as_view(), name='events-list-create'),
    path('<int:pk>/', EventDetailView.as_view(), name='events-detail'),
    path('<int:event_id>/rsvp/', EventRSVPView.as_view(), name='events-rsvp'),
]
