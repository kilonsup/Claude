from rest_framework.routers import DefaultRouter

from .views import ShiftViewSet, StaffProfileViewSet

router = DefaultRouter()
router.register("shifts", ShiftViewSet, basename="shift")
router.register("", StaffProfileViewSet, basename="staff-profile")

urlpatterns = router.urls
