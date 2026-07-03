from rest_framework import serializers

from .models import Shift, StaffProfile


class StaffProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)

    class Meta:
        model = StaffProfile
        fields = [
            "id", "user", "full_name", "role", "email", "phone_number",
            "employee_id", "department", "specialization", "designation",
            "date_joined", "is_available",
        ]
        read_only_fields = ["id", "date_joined"]


class ShiftSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source="staff.user.get_full_name", read_only=True)

    class Meta:
        model = Shift
        fields = [
            "id", "staff", "staff_name", "date", "start_time", "end_time",
            "department", "status", "notes", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
