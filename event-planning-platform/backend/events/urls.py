from rest_framework.routers import DefaultRouter

from .views import DiscoverEventViewSet, EventViewSet

router = DefaultRouter()
router.register("discover", DiscoverEventViewSet, basename="discover")
router.register("", EventViewSet, basename="event")

urlpatterns = router.urls
