from django.utils import timezone
from rest_framework import permissions, viewsets

from .models import Event
from .serializers import EventSerializer, PublicEventSerializer


class EventViewSet(viewsets.ModelViewSet):
    """Events owned by the requesting planner (admins see all)."""

    serializer_class = EventSerializer
    search_fields = ["title", "city", "venue_name", "honoree_name"]

    def get_queryset(self):
        user = self.request.user
        qs = Event.objects.select_related("owner").prefetch_related("planning_tasks", "guests")
        if user.role != "ADMIN":
            qs = qs.filter(owner=user)
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category.upper())
        status_ = self.request.query_params.get("status")
        if status_:
            qs = qs.filter(status=status_.upper())
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class DiscoverEventViewSet(viewsets.ReadOnlyModelViewSet):
    """Public event discovery — no authentication required."""

    serializer_class = PublicEventSerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ["title", "city", "venue_name", "description"]

    def get_queryset(self):
        qs = Event.objects.filter(
            is_public=True,
            status__in=["PLANNING", "CONFIRMED"],
            event_date__gte=timezone.now(),
        ).select_related("owner")
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category.upper())
        city = self.request.query_params.get("city")
        if city:
            qs = qs.filter(city__icontains=city)
        return qs
