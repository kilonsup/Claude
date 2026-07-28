from django.db import models

from events.models import Event


class RegistryItem(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="registry_items")
    name = models.CharField(max_length=150)
    description = models.CharField(max_length=255, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    product_url = models.URLField(blank=True)
    image_url = models.URLField(blank=True)
    is_claimed = models.BooleanField(default=False)
    claimed_by_name = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["is_claimed", "name"]

    def __str__(self):
        return f"{self.name} ({self.event.title})"


class Gift(models.Model):
    """A gift sent to an event — cash or a registry item, with a message."""

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="gifts")
    registry_item = models.ForeignKey(
        RegistryItem, on_delete=models.SET_NULL, null=True, blank=True, related_name="gifts"
    )
    sender_name = models.CharField(max_length=120)
    message = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_delivered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
