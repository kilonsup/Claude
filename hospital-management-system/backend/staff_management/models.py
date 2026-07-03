from django.conf import settings
from django.db import models


class StaffProfile(models.Model):
    class Department(models.TextChoices):
        GENERAL = "GENERAL", "General Practice"
        PEDIATRICS = "PEDIATRICS", "Pediatrics"
        SURGERY = "SURGERY", "Surgery"
        CARDIOLOGY = "CARDIOLOGY", "Cardiology"
        EMERGENCY = "EMERGENCY", "Emergency"
        NURSING = "NURSING", "Nursing"
        ADMIN = "ADMIN", "Administration"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="staff_profile"
    )
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=20, choices=Department.choices, default=Department.GENERAL)
    specialization = models.CharField(max_length=150, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    date_joined = models.DateField(auto_now_add=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ["employee_id"]

    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name()}"


class Shift(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        COMPLETED = "COMPLETED", "Completed"
        MISSED = "MISSED", "Missed"

    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, related_name="shifts")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    department = models.CharField(max_length=20, choices=StaffProfile.Department.choices)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.SCHEDULED)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.staff} on {self.date} ({self.start_time}-{self.end_time})"
