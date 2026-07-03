from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("patient", "doctor", "scheduled_date", "scheduled_time", "status")
    list_filter = ("status", "doctor")
