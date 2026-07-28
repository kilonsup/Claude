from rest_framework import serializers

from .models import Guest


class GuestSerializer(serializers.ModelSerializer):
    invite_link = serializers.SerializerMethodField()

    class Meta:
        model = Guest
        fields = [
            "id", "event", "full_name", "email", "phone_number", "invite_token",
            "invite_link", "rsvp_status", "plus_ones", "dietary_notes",
            "is_surprise_insider", "responded_at", "created_at",
        ]
        read_only_fields = ["id", "invite_token", "responded_at", "created_at"]

    def get_invite_link(self, obj):
        return f"/rsvp/{obj.invite_token}"


class PublicRsvpSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = ["rsvp_status", "plus_ones", "dietary_notes"]
