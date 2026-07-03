from django.contrib import admin

from .models import Shift, StaffProfile


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ("employee_id", "user", "department", "designation", "is_available")
    list_filter = ("department", "is_available")


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ("staff", "date", "start_time", "end_time", "department", "status")
    list_filter = ("status", "department")
