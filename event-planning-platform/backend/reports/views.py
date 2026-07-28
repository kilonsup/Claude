from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from events.models import Event
from gifts.models import Gift
from guests.models import Guest
from memories.models import MemoryPost
from messaging.models import Message
from payments.models import Payment
from planning.models import PlanningTask
from vendors.models import Booking, VendorProfile

User = get_user_model()


class DashboardView(APIView):
    """Role-aware dashboard statistics."""

    def get(self, request):
        user = request.user
        if user.role == "VENDOR":
            return Response(self.vendor_stats(user))
        if user.role == "ADMIN":
            return Response(self.admin_stats())
        return Response(self.planner_stats(user))

    def planner_stats(self, user):
        events = Event.objects.filter(owner=user)
        upcoming = events.filter(event_date__gte=timezone.now()).exclude(status="CANCELLED")
        tasks = PlanningTask.objects.filter(event__owner=user)
        total_tasks = tasks.count()
        done_tasks = tasks.filter(status="DONE").count()
        return {
            "role": "PLANNER",
            "total_events": events.count(),
            "upcoming_events": upcoming.count(),
            "next_event": self._next_event(upcoming),
            "guests_invited": Guest.objects.filter(event__owner=user).count(),
            "guests_accepted": Guest.objects.filter(event__owner=user, rsvp_status="ACCEPTED").count(),
            "tasks_total": total_tasks,
            "tasks_done": done_tasks,
            "tasks_percent": round(done_tasks * 100 / total_tasks) if total_tasks else 0,
            "bookings_confirmed": Booking.objects.filter(event__owner=user, status="CONFIRMED").count(),
            "bookings_requested": Booking.objects.filter(event__owner=user, status="REQUESTED").count(),
            "total_paid": Payment.objects.filter(event__owner=user, status="PAID").aggregate(s=Sum("amount"))["s"] or 0,
            "gifts_received": Gift.objects.filter(event__owner=user).count(),
            "unread_messages": Message.objects.filter(
                thread__booking__event__owner=user, is_read=False
            ).exclude(sender=user).count(),
        }

    def vendor_stats(self, user):
        profile = getattr(user, "vendor_profile", None)
        bookings = Booking.objects.filter(vendor__user=user)
        return {
            "role": "VENDOR",
            "has_profile": profile is not None,
            "business_name": profile.business_name if profile else None,
            "average_rating": profile.average_rating if profile else None,
            "review_count": profile.reviews.count() if profile else 0,
            "bookings_requested": bookings.filter(status="REQUESTED").count(),
            "bookings_confirmed": bookings.filter(status="CONFIRMED").count(),
            "bookings_completed": bookings.filter(status="COMPLETED").count(),
            "revenue_confirmed": bookings.filter(status__in=["CONFIRMED", "COMPLETED"]).aggregate(s=Sum("amount"))["s"] or 0,
            "unread_messages": Message.objects.filter(
                thread__booking__vendor__user=user, is_read=False
            ).exclude(sender=user).count(),
        }

    def admin_stats(self):
        return {
            "role": "ADMIN",
            "total_users": User.objects.count(),
            "planners": User.objects.filter(role="PLANNER").count(),
            "vendors": User.objects.filter(role="VENDOR").count(),
            "total_events": Event.objects.count(),
            "public_events": Event.objects.filter(is_public=True).count(),
            "surprise_events": Event.objects.filter(is_surprise=True).count(),
            "total_bookings": Booking.objects.count(),
            "bookings_by_status": dict(
                Booking.objects.values_list("status").annotate(c=Count("id"))
            ),
            "total_payments": Payment.objects.filter(status="PAID").aggregate(s=Sum("amount"))["s"] or 0,
            "vendor_profiles": VendorProfile.objects.count(),
            "memories_shared": MemoryPost.objects.count(),
        }

    @staticmethod
    def _next_event(upcoming):
        ev = upcoming.order_by("event_date").first()
        if not ev:
            return None
        return {
            "id": ev.id,
            "title": ev.title,
            "event_date": ev.event_date,
            "days_until": ev.days_until,
            "city": ev.city,
        }
