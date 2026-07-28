from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    booking_label = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id", "event", "booking", "booking_label", "description", "amount",
            "method", "status", "reference", "due_date", "paid_on", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_booking_label(self, obj):
        return obj.booking.vendor.business_name if obj.booking else None
