from rest_framework import serializers

from .models import Event


class EventSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    days_until = serializers.IntegerField(read_only=True)
    progress = serializers.SerializerMethodField()
    guest_stats = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id", "owner", "owner_name", "title", "description", "category", "status",
            "event_date", "venue_name", "address", "city", "cover_image_url",
            "budget", "guest_limit", "is_public", "is_surprise", "honoree_name",
            "surprise_brief", "days_until", "progress", "guest_stats",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]

    def get_owner_name(self, obj):
        return obj.owner.get_full_name() or obj.owner.username

    def get_progress(self, obj):
        tasks = obj.planning_tasks.all()
        total = len(tasks)
        if not total:
            return {"total": 0, "done": 0, "percent": 0}
        done = sum(1 for t in tasks if t.status == "DONE")
        return {"total": total, "done": done, "percent": round(done * 100 / total)}

    def get_guest_stats(self, obj):
        guests = obj.guests.all()
        return {
            "invited": len(guests),
            "accepted": sum(1 for g in guests if g.rsvp_status == "ACCEPTED"),
            "declined": sum(1 for g in guests if g.rsvp_status == "DECLINED"),
            "pending": sum(1 for g in guests if g.rsvp_status == "PENDING"),
        }


class PublicEventSerializer(serializers.ModelSerializer):
    """Discovery listing: never exposes surprise details or budget."""

    owner_name = serializers.SerializerMethodField()
    days_until = serializers.IntegerField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id", "title", "description", "category", "event_date",
            "venue_name", "city", "cover_image_url", "owner_name", "days_until",
        ]

    def get_owner_name(self, obj):
        return obj.owner.get_full_name() or obj.owner.username
