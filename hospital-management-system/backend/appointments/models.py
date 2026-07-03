from django.conf import settings
from django.db import models

from patients.models import Patient


class Appointment(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"
        RESCHEDULED = "RESCHEDULED", "Rescheduled"

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments")
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="appointments",
        limit_choices_to={"role": "DOCTOR"},
    )
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    reason = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.SCHEDULED)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="appointments_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["scheduled_date", "scheduled_time"]

    def __str__(self):
        return f"{self.patient} with Dr. {self.doctor.get_full_name()} on {self.scheduled_date} {self.scheduled_time}"
