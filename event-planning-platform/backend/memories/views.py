from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied

from .models import MemoryPost
from .serializers import MemoryPostSerializer


class MemoryPostViewSet(viewsets.ModelViewSet):
    """Post-event memory wall for an event's owner and contributors."""

    serializer_class = MemoryPostSerializer

    def get_queryset(self):
        user = self.request.user
        qs = MemoryPost.objects.select_related("author", "event")
        if user.role != "ADMIN":
            qs = qs.filter(event__owner=user) | qs.filter(author=user)
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)
        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role != "ADMIN" and instance.author != user and instance.event.owner != user:
            raise PermissionDenied("You cannot delete this memory.")
        instance.delete()
