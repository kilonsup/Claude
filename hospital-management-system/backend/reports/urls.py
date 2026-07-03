from django.urls import path

from .views import AppointmentsTrendView, DoctorWorkloadView, OverviewReportView, StaffAvailabilityView

urlpatterns = [
    path("overview/", OverviewReportView.as_view(), name="report-overview"),
    path("appointments-trend/", AppointmentsTrendView.as_view(), name="report-appointments-trend"),
    path("doctor-workload/", DoctorWorkloadView.as_view(), name="report-doctor-workload"),
    path("staff-availability/", StaffAvailabilityView.as_view(), name="report-staff-availability"),
]
