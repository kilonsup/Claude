from rest_framework.routers import DefaultRouter

from .views import DiscoverEventViewSet, EventViewSet, GalleryViewSet

router = DefaultRouter()
router.register("discover", DiscoverEventViewSet, basename="discover")
router.register("gallery", GalleryViewSet, basename="gallery")
router.register("", EventViewSet, basename="event")

urlpatterns = router.urls
