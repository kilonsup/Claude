import datetime

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from appointments.models import Appointment
from patients.models import Patient
from staff_management.models import Shift, StaffProfile

User = get_user_model()

DEMO_PASSWORD = "Passw0rd!"


class Command(BaseCommand):
    help = "Seeds the database with demo users, staff, patients, appointments and shifts."

    @transaction.atomic
    def handle(self, *args, **options):
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults=dict(
                email="admin@hms.local", first_name="Hope", last_name="Adeyemi",
                role=User.Role.ADMIN, is_staff=True, is_superuser=True,
            ),
        )
        if created:
            admin.set_password(DEMO_PASSWORD)
            admin.save()

        doctors = []
        for i, (first, last, spec, dept) in enumerate([
            ("Ada", "Okafor", "General Medicine", StaffProfile.Department.GENERAL),
            ("Musa", "Bello", "Cardiology", StaffProfile.Department.CARDIOLOGY),
        ], start=1):
            user, created = User.objects.get_or_create(
                username=f"dr.{last.lower()}",
                defaults=dict(email=f"{last.lower()}@hms.local", first_name=first, last_name=last, role=User.Role.DOCTOR),
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save()
            profile, _ = StaffProfile.objects.get_or_create(
                user=user,
                defaults=dict(employee_id=f"DOC-{i:03d}", department=dept, specialization=spec, designation="Doctor"),
            )
            doctors.append((user, profile))

        nurse_user, created = User.objects.get_or_create(
            username="nurse.johnson",
            defaults=dict(email="njohnson@hms.local", first_name="Grace", last_name="Johnson", role=User.Role.NURSE),
        )
        if created:
            nurse_user.set_password(DEMO_PASSWORD)
            nurse_user.save()
        nurse_profile, _ = StaffProfile.objects.get_or_create(
            user=nurse_user,
            defaults=dict(employee_id="NUR-001", department=StaffProfile.Department.NURSING, designation="Staff Nurse"),
        )

        patients = []
        for i, (first, last, dob, gender, blood) in enumerate([
            ("Chinedu", "Obi", "1990-04-12", Patient.Gender.MALE, "O+"),
            ("Ngozi", "Eze", "1985-09-03", Patient.Gender.FEMALE, "A+"),
            ("Ibrahim", "Sule", "2001-01-20", Patient.Gender.MALE, "B+"),
        ], start=1):
            patient_user = None
            if i == 1:
                patient_user, created = User.objects.get_or_create(
                    username="patient.chinedu",
                    defaults=dict(email="chinedu@example.com", first_name=first, last_name=last, role=User.Role.PATIENT),
                )
                if created:
                    patient_user.set_password(DEMO_PASSWORD)
                    patient_user.save()
            patient, _ = Patient.objects.get_or_create(
                first_name=first, last_name=last,
                defaults=dict(
                    date_of_birth=dob, gender=gender, blood_group=blood,
                    phone_number=f"080000000{i}", email=f"{first.lower()}@example.com",
                    address="Abuja, Nigeria", registered_by=admin, user=patient_user,
                ),
            )
            patients.append(patient)

        today = datetime.date.today()
        Appointment.objects.get_or_create(
            patient=patients[0], doctor=doctors[0][0],
            scheduled_date=today + datetime.timedelta(days=1), scheduled_time=datetime.time(9, 30),
            defaults=dict(reason="Routine checkup", created_by=admin),
        )
        Appointment.objects.get_or_create(
            patient=patients[1], doctor=doctors[1][0],
            scheduled_date=today + datetime.timedelta(days=2), scheduled_time=datetime.time(11, 0),
            defaults=dict(reason="Follow-up on hypertension", created_by=admin),
        )
        Appointment.objects.get_or_create(
            patient=patients[2], doctor=doctors[0][0],
            scheduled_date=today, scheduled_time=datetime.time(14, 0),
            defaults=dict(reason="Fever and cough", created_by=admin),
        )

        for doctor_user, profile in doctors:
            Shift.objects.get_or_create(
                staff=profile, date=today,
                defaults=dict(start_time=datetime.time(8, 0), end_time=datetime.time(16, 0), department=profile.department),
            )
        Shift.objects.get_or_create(
            staff=nurse_profile, date=today,
            defaults=dict(start_time=datetime.time(7, 0), end_time=datetime.time(15, 0), department=nurse_profile.department),
        )

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
        self.stdout.write("Login credentials (password for all: %s):" % DEMO_PASSWORD)
        self.stdout.write("  admin            -> admin")
        self.stdout.write("  dr.okafor        -> doctor")
        self.stdout.write("  dr.bello         -> doctor")
        self.stdout.write("  nurse.johnson    -> nurse")
        self.stdout.write("  patient.chinedu  -> patient")
