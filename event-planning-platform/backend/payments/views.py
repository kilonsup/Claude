from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import Event

from .models import Payment
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    search_fields = ["description", "reference"]

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.select_related("event", "booking__vendor")
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


class BudgetSummaryView(APIView):
    """Budget health for one event: budget vs committed vs paid."""

    def get(self, request, event_id):
        event = get_object_or_404(Event, pk=event_id)
        if request.user.role != "ADMIN" and event.owner != request.user:
            raise PermissionDenied("You do not own this event.")
        payments = event.payments.all()
        paid = payments.filter(status="PAID").aggregate(s=Sum("amount"))["s"] or 0
        pending = payments.filter(status="PENDING").aggregate(s=Sum("amount"))["s"] or 0
        bookings_committed = (
            event.bookings.filter(status__in=["CONFIRMED", "COMPLETED"]).aggregate(s=Sum("amount"))["s"] or 0
        )
        gifts_received = event.gifts.aggregate(s=Sum("amount"))["s"] or 0
        return Response({
            "budget": event.budget,
            "paid": paid,
            "pending": pending,
            "committed_bookings": bookings_committed,
            "gifts_received": gifts_received,
            "remaining": event.budget - paid - pending,
        })
