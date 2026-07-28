from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import GuestViewSet, PublicRsvpView

router = DefaultRouter()
router.register("guests", GuestViewSet, basename="guest")

urlpatterns = [
    path("rsvp/<uuid:token>/", PublicRsvpView.as_view(), name="public-rsvp"),
] + router.urls
