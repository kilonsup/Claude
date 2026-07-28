from django.conf import settings
from django.db import models

from vendors.models import Booking


class Thread(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="thread")
    created_at = models.DateTimeField(auto_now_add=True)

    def participants(self):
        return {self.booking.event.owner_id, self.booking.vendor.user_id}

    def __str__(self):
        return f"Thread: {self.booking}"


class Message(models.Model):
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
