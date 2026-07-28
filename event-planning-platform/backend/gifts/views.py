from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from guests.models import Guest

from .models import Gift, RegistryItem
from .serializers import GiftSerializer, RegistryItemSerializer


class OwnedByEventMixin:
    def get_base_queryset(self, model):
        user = self.request.user
        qs = model.objects.select_related("event")
        if user.role != "ADMIN":
            qs = qs.filter(event__owner=user)
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)
        return qs

    def check_owner(self, event):
        if self.request.user.role != "ADMIN" and event.owner != self.request.user:
            raise PermissionDenied("You do not own this event.")


class RegistryItemViewSet(OwnedByEventMixin, viewsets.ModelViewSet):
    serializer_class = RegistryItemSerializer

    def get_queryset(self):
        return self.get_base_queryset(RegistryItem)

    def perform_create(self, serializer):
        self.check_owner(serializer.validated_data["event"])
        serializer.save()


class GiftViewSet(OwnedByEventMixin, viewsets.ModelViewSet):
    serializer_class = GiftSerializer

    def get_queryset(self):
        return self.get_base_queryset(Gift)

    def perform_create(self, serializer):
        self.check_owner(serializer.validated_data["event"])
        serializer.save()


class PublicGiftView(APIView):
    """Guests send gifts / claim registry items through their invite link."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, token):
        guest = get_object_or_404(Guest.objects.select_related("event"), invite_token=token)
        event = guest.event
        item = None
        item_id = request.data.get("registry_item")
        if item_id:
            item = get_object_or_404(RegistryItem, pk=item_id, event=event)
            if item.is_claimed:
                return Response(
                    {"detail": "This item has already been claimed."},
                    status=status.HTTP_409_CONFLICT,
                )
            item.is_claimed = True
            item.claimed_by_name = guest.full_name
            item.save(update_fields=["is_claimed", "claimed_by_name"])
        gift = Gift.objects.create(
            event=event,
            registry_item=item,
            sender_name=guest.full_name,
            message=request.data.get("message", ""),
            amount=request.data.get("amount") or 0,
        )
        return Response(GiftSerializer(gift).data, status=status.HTTP_201_CREATED)
