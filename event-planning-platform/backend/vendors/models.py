from django.conf import settings
from django.db import models
from django.db.models import Avg

from events.models import Event


class VendorProfile(models.Model):
    class Category(models.TextChoices):
        VENUE = "VENUE", "Venue"
        CATERING = "CATERING", "Catering"
        CAKE = "CAKE", "Cake & Desserts"
        PHOTOGRAPHY = "PHOTOGRAPHY", "Photography & Video"
        MUSIC = "MUSIC", "Music & DJ"
        DECOR = "DECOR", "Decor & Flowers"
        TRANSPORT = "TRANSPORT", "Transport"
        SURPRISE = "SURPRISE", "Surprise Experiences"
        GIFTS = "GIFTS", "Gifts & Favors"
        PLANNING = "PLANNING", "Full Planning"
        OTHER = "OTHER", "Other"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="vendor_profile")
    business_name = models.CharField(max_length=150)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    description = models.TextField(blank=True)
    city = models.CharField(max_length=80, blank=True)
    starting_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cover_image_url = models.URLField(blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["business_name"]

    @property
    def average_rating(self):
        return self.reviews.aggregate(avg=Avg("rating"))["avg"]

    def __str__(self):
        return self.business_name


class PortfolioItem(models.Model):
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name="portfolio")
    image_url = models.URLField()
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Review(models.Model):
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name="reviews")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="vendor_reviews")
    rating = models.PositiveSmallIntegerField(default=5)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = [("vendor", "author")]


class Booking(models.Model):
    class Status(models.TextChoices):
        REQUESTED = "REQUESTED", "Requested"
        CONFIRMED = "CONFIRMED", "Confirmed"
        DECLINED = "DECLINED", "Declined"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="bookings")
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name="bookings")
    service_description = models.CharField(max_length=255)
    scheduled_for = models.DateTimeField(null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.REQUESTED)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.vendor.business_name} for {self.event.title} [{self.status}]"
