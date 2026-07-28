from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsVendor

from .models import Booking, PortfolioItem, Review, VendorProfile
from .serializers import (
    BookingSerializer,
    PortfolioItemSerializer,
    ReviewSerializer,
    VendorListSerializer,
    VendorProfileSerializer,
)


class MarketplaceViewSet(viewsets.ReadOnlyModelViewSet):
    """Public vendor marketplace: browse and view published vendors."""

    permission_classes = [permissions.AllowAny]
    search_fields = ["business_name", "description", "city"]

    def get_queryset(self):
        qs = VendorProfile.objects.filter(is_published=True).prefetch_related("portfolio", "reviews")
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category.upper())
        city = self.request.query_params.get("city")
        if city:
            qs = qs.filter(city__icontains=city)
        return qs

    def get_serializer_class(self):
        return VendorProfileSerializer if self.action == "retrieve" else VendorListSerializer


class MyVendorProfileView(APIView):
    """Vendor's own profile: fetch, create or update in place."""

    permission_classes = [IsVendor]

    def get(self, request):
        profile = getattr(request.user, "vendor_profile", None)
        if not profile:
            return Response({"detail": "No profile yet."}, status=status.HTTP_404_NOT_FOUND)
        return Response(VendorProfileSerializer(profile).data)

    def put(self, request):
        profile = getattr(request.user, "vendor_profile", None)
        serializer = VendorProfileSerializer(profile, data=request.data, partial=profile is not None)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_200_OK if profile else status.HTTP_201_CREATED)


class PortfolioItemViewSet(viewsets.ModelViewSet):
    serializer_class = PortfolioItemSerializer
    permission_classes = [IsVendor]

    def get_queryset(self):
        return PortfolioItem.objects.filter(vendor__user=self.request.user)

    def perform_create(self, serializer):
        profile = getattr(self.request.user, "vendor_profile", None)
        if not profile:
            raise ValidationError("Create your vendor profile first.")
        serializer.save(vendor=profile)


class ReviewViewSet(viewsets.ModelViewSet):
    """Planners review vendors they have completed bookings with."""

    serializer_class = ReviewSerializer

    def get_queryset(self):
        qs = Review.objects.select_related("author", "vendor")
        vendor_id = self.request.query_params.get("vendor")
        if vendor_id:
            qs = qs.filter(vendor_id=vendor_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise PermissionDenied("You can only edit your own review.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user and self.request.user.role != "ADMIN":
            raise PermissionDenied("You can only delete your own review.")
        instance.delete()


VENDOR_TRANSITIONS = {"CONFIRMED", "DECLINED", "COMPLETED"}
PLANNER_TRANSITIONS = {"CANCELLED"}


class BookingViewSet(viewsets.ModelViewSet):
    """Bookings visible to the planner who owns the event and the booked vendor."""

    serializer_class = BookingSerializer
    search_fields = ["service_description", "event__title", "vendor__business_name"]

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related("event", "event__owner", "vendor", "vendor__user")
        if user.role == "ADMIN":
            pass
        elif user.role == "VENDOR":
            qs = qs.filter(vendor__user=user)
        else:
            qs = qs.filter(event__owner=user)
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)
        status_ = self.request.query_params.get("status")
        if status_:
            qs = qs.filter(status=status_.upper())
        return qs

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]
        if event.owner != self.request.user:
            raise PermissionDenied("You can only book vendors for your own events.")
        booking = serializer.save(status=Booking.Status.REQUESTED)
        # Open a message thread as soon as a booking exists.
        from messaging.models import Thread

        Thread.objects.get_or_create(booking=booking)

    @action(detail=True, methods=["post"], url_path="set-status")
    def set_status(self, request, pk=None):
        booking = self.get_object()
        new_status = str(request.data.get("status", "")).upper()
        user = request.user
        allowed = (
            VENDOR_TRANSITIONS if user.role == "VENDOR"
            else PLANNER_TRANSITIONS if user.role == "PLANNER"
            else VENDOR_TRANSITIONS | PLANNER_TRANSITIONS
        )
        if new_status not in allowed:
            raise PermissionDenied(f"Your role cannot set status to {new_status or '(empty)'}.")
        booking.status = new_status
        booking.save(update_fields=["status", "updated_at"])
        return Response(BookingSerializer(booking).data)
