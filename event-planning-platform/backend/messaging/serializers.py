from rest_framework import serializers

from .models import Message, Thread


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "thread", "sender", "sender_name", "body", "is_read", "created_at"]
        read_only_fields = ["id", "sender", "is_read", "created_at"]

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username


class ThreadSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="booking.event.title", read_only=True)
    vendor_name = serializers.CharField(source="booking.vendor.business_name", read_only=True)
    planner_name = serializers.SerializerMethodField()
    booking_status = serializers.CharField(source="booking.status", read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = [
            "id", "booking", "event_title", "vendor_name", "planner_name",
            "booking_status", "last_message", "unread_count", "created_at",
        ]

    def get_planner_name(self, obj):
        owner = obj.booking.event.owner
        return owner.get_full_name() or owner.username

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return MessageSerializer(msg).data if msg else None

    def get_unread_count(self, obj):
        user = self.context["request"].user
        return obj.messages.exclude(sender=user).filter(is_read=False).count()
