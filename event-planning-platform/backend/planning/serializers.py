from rest_framework import serializers

from .models import PlanningTask


class PlanningTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanningTask
        fields = ["id", "event", "title", "notes", "due_date", "status", "order", "created_at"]
        read_only_fields = ["id", "created_at"]
