from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "ADMIN")


class IsMedicalStaff(BasePermission):
    """Doctors and nurses (clinical staff)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_medical_staff)


class IsAdminOrMedicalStaff(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.role == "ADMIN" or user.is_medical_staff))


class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "DOCTOR")


class ReadOnlyOrAdminOrMedicalStaff(BasePermission):
    """Anyone authenticated can read; only admin/medical staff can write."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return user.role == "ADMIN" or user.is_medical_staff
