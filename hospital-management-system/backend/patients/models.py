from django.conf import settings
from django.db import models


class Patient(models.Model):
    """A patient's core demographic/medical-history record.

    `user` is optional: front-desk/nursing staff can register a patient
    without granting them a portal login, or link one later so the patient
    can view their own records (per the project's access-control model).
    """

    class Gender(models.TextChoices):
        MALE = "M", "Male"
        FEMALE = "F", "Female"
        OTHER = "O", "Other"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="patient_profile",
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=Gender.choices, default=Gender.OTHER)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    allergies = models.TextField(blank=True, help_text="Known allergies, comma-separated")
    emergency_contact_name = models.CharField(max_length=150, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    registered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="patients_registered",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class MedicalRecord(models.Model):
    """A single visit/treatment entry in a patient's medical history."""

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="medical_records")
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="medical_records_authored",
        limit_choices_to={"role": "DOCTOR"},
    )
    visit_date = models.DateTimeField(auto_now_add=True)
    diagnosis = models.CharField(max_length=255)
    treatment_plan = models.TextField(blank=True)
    prescription = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-visit_date"]

    def __str__(self):
        return f"{self.patient} - {self.diagnosis} ({self.visit_date:%Y-%m-%d})"
