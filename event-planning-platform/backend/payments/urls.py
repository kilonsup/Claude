from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import BudgetSummaryView, PaymentViewSet

router = DefaultRouter()
router.register("payments", PaymentViewSet, basename="payment")

urlpatterns = [
    path("events/<int:event_id>/budget/", BudgetSummaryView.as_view(), name="budget-summary"),
] + router.urls
