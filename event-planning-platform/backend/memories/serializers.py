from rest_framework import serializers

from .models import MemoryPost


class MemoryPostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = MemoryPost
        fields = ["id", "event", "author", "author_name", "image_url", "caption", "created_at"]
        read_only_fields = ["id", "author", "created_at"]

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username
