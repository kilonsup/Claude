from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import MedicalRecord, Patient
from .serializers import MedicalRecordSerializer, PatientListSerializer, PatientSerializer


class IsStaffForWrite(permissions.BasePermission):
    """Everyone authenticated may read (subject to queryset scoping below);
    only admins/doctors/nurses may create, update, or delete records."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return user.role == "ADMIN" or user.is_medical_staff


class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffForWrite]
    search_fields = ["first_name", "last_name", "phone_number", "email"]

    def get_serializer_class(self):
        if self.action == "list":
            return PatientListSerializer
        return PatientSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Patient.objects.all()
        if user.role == "PATIENT":
            qs = qs.filter(user=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(registered_by=self.request.user)


class MedicalRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaffForWrite]
    serializer_class = MedicalRecordSerializer

    def get_queryset(self):
        user = self.request.user
        qs = MedicalRecord.objects.select_related("patient", "doctor")
        if user.role == "PATIENT":
            qs = qs.filter(patient__user=user)
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        doctor = user if user.role == "DOCTOR" else None
        if user.role not in ("ADMIN", "DOCTOR", "NURSE"):
            raise PermissionDenied("Only clinical staff can add medical records.")
        serializer.save(doctor=doctor or serializer.validated_data.get("doctor"))
