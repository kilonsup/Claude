from rest_framework.routers import DefaultRouter

from .views import MedicalRecordViewSet, PatientViewSet

router = DefaultRouter()
router.register("records", MedicalRecordViewSet, basename="medical-record")
router.register("", PatientViewSet, basename="patient")

urlpatterns = router.urls
