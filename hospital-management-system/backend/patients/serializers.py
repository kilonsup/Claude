from rest_framework import serializers

from .models import MedicalRecord, Patient


class MedicalRecordSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.get_full_name", read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            "id", "patient", "doctor", "doctor_name", "visit_date",
            "diagnosis", "treatment_plan", "prescription", "notes",
        ]
        read_only_fields = ["id", "visit_date", "doctor_name"]


class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    medical_records = MedicalRecordSerializer(many=True, read_only=True)
    registered_by_name = serializers.CharField(source="registered_by.get_full_name", read_only=True)

    class Meta:
        model = Patient
        fields = [
            "id", "user", "first_name", "last_name", "full_name",
            "date_of_birth", "gender", "phone_number", "email", "address",
            "blood_group", "allergies", "emergency_contact_name",
            "emergency_contact_phone", "registered_by", "registered_by_name",
            "created_at", "updated_at", "medical_records",
        ]
        read_only_fields = ["id", "registered_by", "created_at", "updated_at"]


class PatientListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Patient
        fields = [
            "id", "full_name", "gender", "date_of_birth", "phone_number",
            "email", "blood_group", "created_at",
        ]
