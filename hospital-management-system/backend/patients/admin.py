from django.contrib import admin

from .models import MedicalRecord, Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("full_name", "gender", "phone_number", "created_at")
    search_fields = ("first_name", "last_name", "phone_number", "email")


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ("patient", "doctor", "diagnosis", "visit_date")
    list_filter = ("doctor",)
