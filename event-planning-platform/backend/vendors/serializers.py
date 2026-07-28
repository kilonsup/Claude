from rest_framework import serializers

from .models import Booking, PortfolioItem, Review, VendorProfile


class PortfolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioItem
        fields = ["id", "vendor", "image_url", "caption", "created_at"]
        read_only_fields = ["id", "created_at"]


class ReviewSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ["id", "vendor", "author", "author_name", "rating", "comment", "created_at"]
        read_only_fields = ["id", "author", "created_at"]

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


class VendorProfileSerializer(serializers.ModelSerializer):
    portfolio = PortfolioItemSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = VendorProfile
        fields = [
            "id", "user", "business_name", "category", "description", "city",
            "starting_price", "cover_image_url", "is_published", "average_rating",
            "review_count", "portfolio", "reviews", "created_at",
        ]
        read_only_fields = ["id", "user", "created_at"]

    def get_review_count(self, obj):
        return obj.reviews.count()


class VendorListSerializer(serializers.ModelSerializer):
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = VendorProfile
        fields = [
            "id", "business_name", "category", "description", "city",
            "starting_price", "cover_image_url", "average_rating", "review_count",
        ]

    def get_review_count(self, obj):
        return obj.reviews.count()


class BookingSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    vendor_name = serializers.CharField(source="vendor.business_name", read_only=True)
    vendor_category = serializers.CharField(source="vendor.category", read_only=True)
    planner_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id", "event", "event_title", "vendor", "vendor_name", "vendor_category",
            "planner_name", "service_description", "scheduled_for", "amount",
            "status", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_planner_name(self, obj):
        owner = obj.event.owner
        return owner.get_full_name() or owner.username
