from django.db import models

from events.models import Event


class PlanningTask(models.Model):
    class Status(models.TextChoices):
        TODO = "TODO", "To do"
        IN_PROGRESS = "IN_PROGRESS", "In progress"
        DONE = "DONE", "Done"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="planning_tasks")
    title = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.TODO)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "due_date", "id"]

    def __str__(self):
        return f"{self.title} [{self.status}]"


DEFAULT_CHECKLISTS = {
    "WEDDING": [
        "Set the date and budget", "Book the venue", "Build the guest list",
        "Book caterer and cake", "Book photographer", "Send invitations",
        "Arrange music / DJ", "Plan decor and flowers", "Confirm all vendors",
        "Final headcount to caterer",
    ],
    "BIRTHDAY": [
        "Pick a theme", "Set budget", "Book venue or prep the house",
        "Send invitations", "Order the cake", "Plan games and music",
        "Arrange food and drinks", "Confirm RSVPs",
    ],
    "SURPRISE": [
        "Pick the cover story", "Brief the insiders", "Book the venue secretly",
        "Coordinate arrival times", "Arrange the reveal moment",
        "Plan gifts and keepsakes", "Confirm everyone knows the plan",
    ],
    "CORPORATE": [
        "Define objectives and budget", "Book venue and AV", "Invite attendees",
        "Arrange catering", "Prepare agenda and speakers", "Plan branding and swag",
        "Confirm logistics",
    ],
    "DEFAULT": [
        "Set the date and budget", "Book the venue", "Build the guest list",
        "Send invitations", "Arrange food and drinks", "Confirm vendors",
    ],
}
