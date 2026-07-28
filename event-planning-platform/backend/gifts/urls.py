from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import GiftViewSet, PublicGiftView, RegistryItemViewSet

router = DefaultRouter()
router.register("registry", RegistryItemViewSet, basename="registry-item")
router.register("gifts", GiftViewSet, basename="gift")

urlpatterns = [
    path("rsvp/<uuid:token>/gifts/", PublicGiftView.as_view(), name="public-gift"),
] + router.urls
