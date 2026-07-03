from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import LoginView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/accounts/", include("accounts.urls")),
    path("api/patients/", include("patients.urls")),
    path("api/appointments/", include("appointments.urls")),
    path("api/staff/", include("staff_management.urls")),
    path("api/reports/", include("reports.urls")),
]
