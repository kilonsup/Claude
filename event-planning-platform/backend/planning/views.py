from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from events.models import Event

from .models import DEFAULT_CHECKLISTS, PlanningTask
from .serializers import PlanningTaskSerializer


class PlanningTaskViewSet(viewsets.ModelViewSet):
    serializer_class = PlanningTaskSerializer
    search_fields = ["title"]

    def get_queryset(self):
        user = self.request.user
        qs = PlanningTask.objects.select_related("event")
        if user.role != "ADMIN":
            qs = qs.filter(event__owner=user)
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)
        return qs

    def _check_event_owner(self, event):
        if self.request.user.role != "ADMIN" and event.owner != self.request.user:
            raise PermissionDenied("You do not own this event.")

    def perform_create(self, serializer):
        self._check_event_owner(serializer.validated_data["event"])
        serializer.save()

    @action(detail=False, methods=["post"], url_path="seed-defaults")
    def seed_defaults(self, request):
        """Create a starter checklist for an event based on its category."""
        event_id = request.data.get("event")
        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        self._check_event_owner(event)
        titles = DEFAULT_CHECKLISTS.get(event.category, DEFAULT_CHECKLISTS["DEFAULT"])
        existing = set(event.planning_tasks.values_list("title", flat=True))
        created = [
            PlanningTask.objects.create(event=event, title=title, order=i)
            for i, title in enumerate(titles)
            if title not in existing
        ]
        return Response(
            PlanningTaskSerializer(created, many=True).data,
            status=status.HTTP_201_CREATED,
        )
