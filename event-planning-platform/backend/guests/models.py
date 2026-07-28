import uuid

from django.db import models

from events.models import Event


class Guest(models.Model):
    class Rsvp(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        DECLINED = "DECLINED", "Declined"
        MAYBE = "MAYBE", "Maybe"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="guests")
    full_name = models.CharField(max_length=120)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    invite_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    rsvp_status = models.CharField(max_length=10, choices=Rsvp.choices, default=Rsvp.PENDING)
    plus_ones = models.PositiveSmallIntegerField(default=0)
    dietary_notes = models.CharField(max_length=200, blank=True)
    is_surprise_insider = models.BooleanField(
        default=True, help_text="Insiders can see the surprise brief; turn off for the honoree."
    )
    responded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["full_name"]
        unique_together = [("event", "email")]

    def __str__(self):
        return f"{self.full_name} → {self.event.title}"
