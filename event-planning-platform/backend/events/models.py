from django.conf import settings
from django.db import models
from django.utils import timezone


class Event(models.Model):
    class Category(models.TextChoices):
        WEDDING = "WEDDING", "Wedding"
        BIRTHDAY = "BIRTHDAY", "Birthday"
        CORPORATE = "CORPORATE", "Corporate"
        ANNIVERSARY = "ANNIVERSARY", "Anniversary"
        BABY_SHOWER = "BABY_SHOWER", "Baby Shower"
        GRADUATION = "GRADUATION", "Graduation"
        CONCERT = "CONCERT", "Concert / Show"
        SURPRISE = "SURPRISE", "Surprise Experience"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        PLANNING = "PLANNING", "Planning"
        CONFIRMED = "CONFIRMED", "Confirmed"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="events")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PLANNING)
    event_date = models.DateTimeField()
    venue_name = models.CharField(max_length=200, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=80, blank=True)
    cover_image_url = models.URLField(blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    guest_limit = models.PositiveIntegerField(default=0, help_text="0 = unlimited")
    is_public = models.BooleanField(default=False, help_text="Publicly discoverable on the platform")

    # Surprise mode: details below are hidden from non-insider guests.
    is_surprise = models.BooleanField(default=False)
    honoree_name = models.CharField(max_length=120, blank=True)
    surprise_brief = models.TextField(blank=True, help_text="The secret plan, only visible to insiders")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["event_date"]

    @property
    def days_until(self):
        delta = self.event_date.date() - timezone.localdate()
        return delta.days

    def __str__(self):
        return self.title


class GalleryItem(models.Model):
    """A showcase photo from an executed project, displayed on the public gallery."""

    class Category(models.TextChoices):
        WEDDING = "WEDDING", "Weddings"
        ENGAGEMENT = "ENGAGEMENT", "Engagements"
        SURPRISE = "SURPRISE", "Surprises"
        BIRTHDAY = "BIRTHDAY", "Birthdays"
        BABY_SHOWER = "BABY_SHOWER", "Baby Showers"
        CORPORATE = "CORPORATE", "Corporate"
        OTHER = "OTHER", "Other Creations"

    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    image_url = models.URLField()
    caption = models.CharField(max_length=200, blank=True)
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "order", "-created_at"]

    def __str__(self):
        return f"{self.get_category_display()}: {self.caption or self.image_url}"
