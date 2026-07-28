from django.contrib import admin

from .models import Booking, PortfolioItem, Review, VendorProfile


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ["business_name", "user", "category", "city", "starting_price", "is_published"]
    list_filter = ["category", "is_published"]
    search_fields = ["business_name", "city"]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["vendor", "event", "status", "amount", "scheduled_for"]
    list_filter = ["status"]


admin.site.register(PortfolioItem)
admin.site.register(Review)
