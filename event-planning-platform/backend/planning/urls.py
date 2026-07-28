from rest_framework.routers import DefaultRouter

from .views import PlanningTaskViewSet

router = DefaultRouter()
router.register("tasks", PlanningTaskViewSet, basename="planning-task")

urlpatterns = router.urls
