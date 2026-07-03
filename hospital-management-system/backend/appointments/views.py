from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from patients.models import Patient

from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ("ADMIN", "NURSE"):
            return True
        if user.role == "DOCTOR":
            return obj.doctor_id == user.id
        if user.role == "PATIENT":
            return obj.patient.user_id == user.id
        return False


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [AppointmentPermission]

    def get_queryset(self):
        user = self.request.user
        qs = Appointment.objects.select_related("patient", "doctor")
        if user.role == "DOCTOR":
            qs = qs.filter(doctor=user)
        elif user.role == "PATIENT":
            qs = qs.filter(patient__user=user)
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param.upper())
        date_param = self.request.query_params.get("date")
        if date_param:
            qs = qs.filter(scheduled_date=date_param)
        doctor_param = self.request.query_params.get("doctor")
        if doctor_param:
            qs = qs.filter(doctor_id=doctor_param)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "PATIENT":
            try:
                patient = Patient.objects.get(user=user)
            except Patient.DoesNotExist:
                raise PermissionDenied("No patient record is linked to your account yet.")
            if serializer.validated_data.get("patient") and serializer.validated_data["patient"].id != patient.id:
                raise PermissionDenied("Patients may only book appointments for themselves.")
            serializer.save(patient=patient, created_by=user)
        else:
            serializer.save(created_by=user)
