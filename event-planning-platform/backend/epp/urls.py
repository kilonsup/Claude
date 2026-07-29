from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import LoginView

# Every API route, defined once without the "/api" prefix.
api_urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("accounts/", include("accounts.urls")),
    path("events/", include("events.urls")),
    path("vendors/", include("vendors.urls")),
    path("", include("guests.urls")),
    path("", include("gifts.urls")),
    path("", include("payments.urls")),
    path("", include("planning.urls")),
    path("messaging/", include("messaging.urls")),
    path("", include("memories.urls")),
    path("reports/", include("reports.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(api_urlpatterns)),
    # Mounted again at the root so the API still resolves when the hosting
    # platform routes a path-prefixed service and strips "/api" before
    # forwarding the request (Vercel Services does this).
    path("", include(api_urlpatterns)),
]
