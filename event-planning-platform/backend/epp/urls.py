from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import LoginView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/accounts/", include("accounts.urls")),
    path("api/events/", include("events.urls")),
    path("api/vendors/", include("vendors.urls")),
    path("api/", include("guests.urls")),
    path("api/", include("gifts.urls")),
    path("api/", include("payments.urls")),
    path("api/", include("planning.urls")),
    path("api/messaging/", include("messaging.urls")),
    path("api/", include("memories.urls")),
    path("api/reports/", include("reports.urls")),
]
