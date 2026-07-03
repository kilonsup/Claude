from rest_framework import permissions, viewsets

from accounts.permissions import IsAdmin

from .models import Shift, StaffProfile
from .serializers import ShiftSerializer, StaffProfileSerializer


class ReadAllWriteAdminOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == "ADMIN"


class StaffProfileViewSet(viewsets.ModelViewSet):
    queryset = StaffProfile.objects.select_related("user").all()
    serializer_class = StaffProfileSerializer
    permission_classes = [ReadAllWriteAdminOnly]
    search_fields = ["employee_id", "user__first_name", "user__last_name", "specialization"]

    def get_queryset(self):
        qs = super().get_queryset()
        department = self.request.query_params.get("department")
        if department:
            qs = qs.filter(department=department.upper())
        return qs


class ShiftViewSet(viewsets.ModelViewSet):
    serializer_class = ShiftSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    def get_queryset(self):
        user = self.request.user
        qs = Shift.objects.select_related("staff", "staff__user")
        if user.role in ("DOCTOR", "NURSE"):
            qs = qs.filter(staff__user=user)
        date_param = self.request.query_params.get("date")
        if date_param:
            qs = qs.filter(date=date_param)
        staff_param = self.request.query_params.get("staff")
        if staff_param:
            qs = qs.filter(staff_id=staff_param)
        return qs
