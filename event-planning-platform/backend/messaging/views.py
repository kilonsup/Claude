from django.db.models import Q
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Message, Thread
from .serializers import MessageSerializer, ThreadSerializer


def threads_for(user):
    if user.role == "ADMIN":
        return Thread.objects.all()
    return Thread.objects.filter(
        Q(booking__event__owner=user) | Q(booking__vendor__user=user)
    )


class ThreadViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ThreadSerializer

    def get_queryset(self):
        return (
            threads_for(self.request.user)
            .select_related("booking__event__owner", "booking__vendor__user")
            .prefetch_related("messages")
            .order_by("-created_at")
        )

    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        thread = self.get_object()
        thread.messages.exclude(sender=request.user).filter(is_read=False).update(is_read=True)
        return Response({"detail": "Marked read."})


class MessageViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = MessageSerializer
    pagination_class = None

    def get_queryset(self):
        qs = Message.objects.filter(thread__in=threads_for(self.request.user)).select_related("sender")
        thread_id = self.request.query_params.get("thread")
        if thread_id:
            qs = qs.filter(thread_id=thread_id)
        return qs

    def perform_create(self, serializer):
        thread = serializer.validated_data["thread"]
        if self.request.user.role != "ADMIN" and self.request.user.id not in thread.participants():
            raise PermissionDenied("You are not part of this conversation.")
        serializer.save(sender=self.request.user)
