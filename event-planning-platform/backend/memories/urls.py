from rest_framework.routers import DefaultRouter

from .views import MemoryPostViewSet

router = DefaultRouter()
router.register("memories", MemoryPostViewSet, basename="memory")

urlpatterns = router.urls
