from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class HMSUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Hospital role", {"fields": ("role", "phone_number")}),
    )
    list_display = ("username", "email", "first_name", "last_name", "role", "is_active")
    list_filter = ("role", "is_active")
