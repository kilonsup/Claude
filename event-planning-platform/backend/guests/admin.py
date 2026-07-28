from django.contrib import admin

from .models import Guest


@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = ["full_name", "event", "email", "rsvp_status", "plus_ones", "is_surprise_insider"]
    list_filter = ["rsvp_status", "is_surprise_insider"]
    search_fields = ["full_name", "email", "event__title"]
