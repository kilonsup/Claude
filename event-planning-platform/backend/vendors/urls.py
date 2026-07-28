from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    BookingViewSet,
    MarketplaceViewSet,
    MyVendorProfileView,
    PortfolioItemViewSet,
    ReviewViewSet,
)

router = DefaultRouter()
router.register("marketplace", MarketplaceViewSet, basename="marketplace")
router.register("portfolio", PortfolioItemViewSet, basename="portfolio")
router.register("reviews", ReviewViewSet, basename="review")
router.register("bookings", BookingViewSet, basename="booking")

urlpatterns = [
    path("me/", MyVendorProfileView.as_view(), name="my-vendor-profile"),
] + router.urls
