from django.contrib import admin

from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["title", "owner", "category", "status", "event_date", "city", "is_public", "is_surprise"]
    list_filter = ["category", "status", "is_public", "is_surprise"]
    search_fields = ["title", "city", "owner__username"]
