from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with a role used throughout the platform for RBAC."""

    class Role(models.TextChoices):
        PLANNER = "PLANNER", "Event Planner / Host"
        VENDOR = "VENDOR", "Vendor"
        ADMIN = "ADMIN", "Administrator"

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.PLANNER)
    phone_number = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=80, blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
