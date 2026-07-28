from django.conf import settings
from django.db import models

from events.models import Event


class MemoryPost(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="memories")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memory_posts")
    image_url = models.URLField(blank=True)
    caption = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Memory of {self.event.title} by {self.author.username}"
