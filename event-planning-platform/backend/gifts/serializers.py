from rest_framework import serializers

from .models import Gift, RegistryItem


class RegistryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistryItem
        fields = [
            "id", "event", "name", "description", "price", "product_url",
            "image_url", "is_claimed", "claimed_by_name", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class GiftSerializer(serializers.ModelSerializer):
    registry_item_name = serializers.CharField(source="registry_item.name", read_only=True)

    class Meta:
        model = Gift
        fields = [
            "id", "event", "registry_item", "registry_item_name", "sender_name",
            "message", "amount", "is_delivered", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
