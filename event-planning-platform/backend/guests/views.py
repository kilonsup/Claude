from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import Event
from gifts.models import RegistryItem
from gifts.serializers import RegistryItemSerializer

from .models import Guest
from .serializers import GuestSerializer, PublicRsvpSerializer


class GuestViewSet(viewsets.ModelViewSet):
    """Guest list management, scoped to events the requester owns."""

    serializer_class = GuestSerializer
    search_fields = ["full_name", "email"]

    def get_queryset(self):
        user = self.request.user
        qs = Guest.objects.select_related("event", "event__owner")
        if user.role != "ADMIN":
            qs = qs.filter(event__owner=user)
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)
        return qs

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]
        if self.request.user.role != "ADMIN" and event.owner != self.request.user:
            raise PermissionDenied("You do not own this event.")
        serializer.save()


class PublicRsvpView(APIView):
    """Frictionless guest experience: view invite and respond with no account."""

    permission_classes = [permissions.AllowAny]

    def get_guest(self, token):
        return get_object_or_404(Guest.objects.select_related("event", "event__owner"), invite_token=token)

    def get(self, request, token):
        guest = self.get_guest(token)
        event = guest.event
        payload = {
            "guest": {
                "full_name": guest.full_name,
                "rsvp_status": guest.rsvp_status,
                "plus_ones": guest.plus_ones,
                "dietary_notes": guest.dietary_notes,
            },
            "event": {
                "title": event.title,
                "description": event.description,
                "category": event.category,
                "event_date": event.event_date,
                "venue_name": event.venue_name,
                "address": event.address,
                "city": event.city,
                "cover_image_url": event.cover_image_url,
                "host_name": event.owner.get_full_name() or event.owner.username,
                "is_surprise": event.is_surprise,
            },
            "registry": RegistryItemSerializer(
                RegistryItem.objects.filter(event=event), many=True
            ).data,
        }
        if event.is_surprise and guest.is_surprise_insider:
            payload["event"]["honoree_name"] = event.honoree_name
            payload["event"]["surprise_brief"] = event.surprise_brief
        return Response(payload)

    def post(self, request, token):
        guest = self.get_guest(token)
        serializer = PublicRsvpSerializer(guest, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(responded_at=timezone.now())
        return Response({"detail": "RSVP recorded.", **serializer.data})
