from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with a role used throughout the system for RBAC.

    Roles map directly to the user types identified in the project scope:
    hospital administrator, doctor, nurse, and patient.
    """

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Administrator"
        DOCTOR = "DOCTOR", "Doctor"
        NURSE = "NURSE", "Nurse"
        PATIENT = "PATIENT", "Patient"

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.PATIENT)
    phone_number = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_medical_staff(self):
        return self.role in (self.Role.DOCTOR, self.Role.NURSE)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
