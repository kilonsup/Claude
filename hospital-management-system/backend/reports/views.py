from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminOrMedicalStaff
from appointments.models import Appointment
from patients.models import Patient
from staff_management.models import Shift, StaffProfile

User = get_user_model()


class OverviewReportView(APIView):
    """High-level KPIs for the hospital's admin/clinical dashboard."""

    permission_classes = [IsAdminOrMedicalStaff]

    def get(self, request):
        today = timezone.localdate()
        week_start = today - timedelta(days=today.weekday())

        appointments = Appointment.objects.all()
        if request.user.role == "DOCTOR":
            appointments = appointments.filter(doctor=request.user)

        by_status = dict(
            appointments.values_list("status").annotate(count=Count("id")).values_list("status", "count")
        )

        data = {
            "total_patients": Patient.objects.count(),
            "total_doctors": User.objects.filter(role="DOCTOR").count(),
            "total_nurses": User.objects.filter(role="NURSE").count(),
            "appointments_today": appointments.filter(scheduled_date=today).count(),
            "appointments_this_week": appointments.filter(scheduled_date__gte=week_start).count(),
            "appointments_by_status": by_status,
            "staff_on_shift_today": Shift.objects.filter(date=today, status=Shift.Status.SCHEDULED).count(),
        }
        return Response(data)


class AppointmentsTrendView(APIView):
    """Appointment volume per day for the last N days (default 14)."""

    permission_classes = [IsAdminOrMedicalStaff]

    def get(self, request):
        days = int(request.query_params.get("days", 14))
        today = timezone.localdate()
        start = today - timedelta(days=days - 1)

        appointments = Appointment.objects.filter(scheduled_date__gte=start)
        if request.user.role == "DOCTOR":
            appointments = appointments.filter(doctor=request.user)

        counts = {
            row["scheduled_date"]: row["count"]
            for row in appointments.values("scheduled_date").annotate(count=Count("id"))
        }
        trend = [
            {"date": (start + timedelta(days=i)).isoformat(), "count": counts.get(start + timedelta(days=i), 0)}
            for i in range(days)
        ]
        return Response(trend)


class DoctorWorkloadView(APIView):
    """Per-doctor appointment load, for staffing/reporting decisions."""

    permission_classes = [IsAdminOrMedicalStaff]

    def get(self, request):
        doctors = User.objects.filter(role="DOCTOR").annotate(
            total=Count("appointments"),
            completed=Count("appointments", filter=Q(appointments__status="COMPLETED")),
            cancelled=Count("appointments", filter=Q(appointments__status="CANCELLED")),
            upcoming=Count("appointments", filter=Q(appointments__status="SCHEDULED")),
        )
        data = [
            {
                "doctor_id": d.id,
                "doctor_name": d.get_full_name() or d.username,
                "total": d.total,
                "completed": d.completed,
                "cancelled": d.cancelled,
                "upcoming": d.upcoming,
            }
            for d in doctors
        ]
        return Response(data)


class StaffAvailabilityView(APIView):
    """Snapshot of which staff are on shift today, for coordination."""

    permission_classes = [IsAdminOrMedicalStaff]

    def get(self, request):
        today = timezone.localdate()
        shifts = Shift.objects.filter(date=today).select_related("staff", "staff__user")
        data = [
            {
                "staff_id": s.staff_id,
                "staff_name": s.staff.user.get_full_name(),
                "department": s.department,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "status": s.status,
            }
            for s in shifts
        ]
        return Response(data)
