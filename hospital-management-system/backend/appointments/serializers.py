from rest_framework import serializers

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    doctor_name = serializers.CharField(source="doctor.get_full_name", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id", "patient", "patient_name", "doctor", "doctor_name",
            "scheduled_date", "scheduled_time", "reason", "status", "notes",
            "created_by", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def validate(self, attrs):
        doctor = attrs.get("doctor", getattr(self.instance, "doctor", None))
        date = attrs.get("scheduled_date", getattr(self.instance, "scheduled_date", None))
        time = attrs.get("scheduled_time", getattr(self.instance, "scheduled_time", None))
        status = attrs.get("status", getattr(self.instance, "status", Appointment.Status.SCHEDULED))

        if status in (Appointment.Status.SCHEDULED, Appointment.Status.RESCHEDULED):
            clash = Appointment.objects.filter(
                doctor=doctor,
                scheduled_date=date,
                scheduled_time=time,
                status__in=[Appointment.Status.SCHEDULED, Appointment.Status.RESCHEDULED],
            )
            if self.instance:
                clash = clash.exclude(pk=self.instance.pk)
            if clash.exists():
                raise serializers.ValidationError(
                    "This doctor already has an appointment booked at that date and time."
                )
        return attrs
