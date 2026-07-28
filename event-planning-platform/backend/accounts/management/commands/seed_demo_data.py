import datetime

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from events.models import Event, GalleryItem
from gifts.models import Gift, RegistryItem
from guests.models import Guest
from memories.models import MemoryPost
from messaging.models import Message, Thread
from payments.models import Payment
from planning.models import DEFAULT_CHECKLISTS, PlanningTask
from vendors.models import Booking, PortfolioItem, Review, VendorProfile

User = get_user_model()

DEMO_PASSWORD = "Passw0rd!"


def get_user(username, **defaults):
    user, created = User.objects.get_or_create(username=username, defaults=defaults)
    if created:
        user.set_password(DEMO_PASSWORD)
        user.save()
    return user


class Command(BaseCommand):
    help = "Seeds demo users, events, vendors, bookings, guests, gifts, payments and memories."

    @transaction.atomic
    def handle(self, *args, **options):
        now = timezone.now()

        admin = get_user(
            "admin", email="admin@epp.local", first_name="Ada", last_name="Platform",
            role=User.Role.ADMIN, is_staff=True, is_superuser=True,
        )

        planner = get_user(
            "amara", email="amara@epp.local", first_name="Amara", last_name="Okoye",
            role=User.Role.PLANNER, city="Lagos", phone_number="+2348010000001",
        )
        planner2 = get_user(
            "tunde", email="tunde@epp.local", first_name="Tunde", last_name="Bakare",
            role=User.Role.PLANNER, city="Abuja",
        )

        vendor_specs = [
            ("goldleaf", "GoldLeaf Catering", VendorProfile.Category.CATERING, "Lagos",
             "Premium Nigerian and continental catering for weddings and corporate events.", 250000),
            ("lensline", "LensLine Studios", VendorProfile.Category.PHOTOGRAPHY, "Lagos",
             "Award-winning photography and cinematic event films.", 150000),
            ("djspin", "DJ Spin Entertainment", VendorProfile.Category.MUSIC, "Abuja",
             "High-energy DJ sets, MC services and full sound production.", 100000),
            ("bloomz", "Bloomz Decor", VendorProfile.Category.DECOR, "Lagos",
             "Luxury floral design and full venue transformation.", 200000),
            ("wowmoments", "Wow Moments Co.", VendorProfile.Category.SURPRISE, "Lagos",
             "Surprise proposals, flash mobs and once-in-a-lifetime reveals.", 80000),
        ]
        vendors = {}
        for username, name, cat, city, desc, price in vendor_specs:
            vu = get_user(
                username, email=f"{username}@epp.local",
                first_name=name.split()[0], last_name="Vendor",
                role=User.Role.VENDOR, city=city,
            )
            profile, _ = VendorProfile.objects.get_or_create(
                user=vu,
                defaults=dict(
                    business_name=name, category=cat, city=city,
                    description=desc, starting_price=price,
                ),
            )
            vendors[username] = profile
            if not profile.portfolio.exists():
                PortfolioItem.objects.create(
                    vendor=profile, image_url="https://picsum.photos/seed/" + username + "/800/600",
                    caption=f"Recent work by {name}",
                )

        wedding, created = Event.objects.get_or_create(
            owner=planner, title="Amara & Chidi's Wedding",
            defaults=dict(
                description="A garden wedding celebration with 200 guests.",
                category=Event.Category.WEDDING, status=Event.Status.PLANNING,
                event_date=now + datetime.timedelta(days=60),
                venue_name="The Monarch Event Centre", city="Lagos",
                address="12 Admiralty Way, Lekki", budget=5000000, is_public=True,
            ),
        )
        surprise, s_created = Event.objects.get_or_create(
            owner=planner, title="Mum's Surprise 60th",
            defaults=dict(
                description="Officially a 'small family dinner'…",
                category=Event.Category.SURPRISE, status=Event.Status.PLANNING,
                event_date=now + datetime.timedelta(days=21),
                venue_name="Private Residence", city="Lagos", budget=800000,
                is_surprise=True, honoree_name="Mrs. Ngozi Okoye",
                surprise_brief="Guests arrive by 5pm. Mum thinks it's dinner for four. Lights off until she enters.",
            ),
        )
        gala, _ = Event.objects.get_or_create(
            owner=planner2, title="TechNova Annual Gala",
            defaults=dict(
                description="End-of-year awards night for 300 staff and partners.",
                category=Event.Category.CORPORATE, status=Event.Status.CONFIRMED,
                event_date=now + datetime.timedelta(days=90),
                venue_name="Transcorp Hilton", city="Abuja", budget=12000000, is_public=True,
            ),
        )

        if created:
            for i, title in enumerate(DEFAULT_CHECKLISTS["WEDDING"]):
                PlanningTask.objects.create(
                    event=wedding, title=title, order=i,
                    status="DONE" if i < 4 else "TODO",
                )
        if s_created:
            for i, title in enumerate(DEFAULT_CHECKLISTS["SURPRISE"]):
                PlanningTask.objects.create(
                    event=surprise, title=title, order=i,
                    status="DONE" if i < 2 else "TODO",
                )

        guest_specs = [
            (wedding, "Ifeoma Nwosu", "ifeoma@example.com", "ACCEPTED", 1, True),
            (wedding, "Bola Adewale", "bola@example.com", "PENDING", 0, True),
            (wedding, "Chuka Eze", "chuka@example.com", "DECLINED", 0, True),
            (surprise, "Ngozi Okoye", "ngozi@example.com", "PENDING", 0, False),
            (surprise, "Uncle Emeka", "emeka@example.com", "ACCEPTED", 1, True),
        ]
        for event, name, email, rsvp, plus, insider in guest_specs:
            Guest.objects.get_or_create(
                event=event, email=email,
                defaults=dict(
                    full_name=name, rsvp_status=rsvp, plus_ones=plus,
                    is_surprise_insider=insider,
                ),
            )

        booking, b_created = Booking.objects.get_or_create(
            event=wedding, vendor=vendors["goldleaf"],
            defaults=dict(
                service_description="Full catering for 200 guests",
                scheduled_for=wedding.event_date, amount=1500000,
                status=Booking.Status.CONFIRMED,
            ),
        )
        booking2, b2_created = Booking.objects.get_or_create(
            event=wedding, vendor=vendors["lensline"],
            defaults=dict(
                service_description="Photography + highlight film",
                scheduled_for=wedding.event_date, amount=450000,
                status=Booking.Status.REQUESTED,
            ),
        )
        Booking.objects.get_or_create(
            event=surprise, vendor=vendors["wowmoments"],
            defaults=dict(
                service_description="Reveal choreography and confetti moment",
                scheduled_for=surprise.event_date, amount=120000,
                status=Booking.Status.CONFIRMED,
            ),
        )

        for b in Booking.objects.all():
            Thread.objects.get_or_create(booking=b)
        if b_created:
            thread = booking.thread
            Message.objects.create(thread=thread, sender=planner, body="Hi! Can you handle a strictly vegetarian table of 12?")
            Message.objects.create(thread=thread, sender=vendors["goldleaf"].user, body="Absolutely — we'll prepare a dedicated menu for that table.")

        Review.objects.get_or_create(
            vendor=vendors["goldleaf"], author=planner2,
            defaults=dict(rating=5, comment="Flawless service at our last gala."),
        )
        Review.objects.get_or_create(
            vendor=vendors["djspin"], author=planner,
            defaults=dict(rating=4, comment="Great energy, kept the floor packed."),
        )

        for name, price in [("Stand Mixer", 185000), ("Weekend Getaway Fund", 400000), ("Photo Album", 45000)]:
            RegistryItem.objects.get_or_create(
                event=wedding, name=name, defaults=dict(price=price),
            )
        Gift.objects.get_or_create(
            event=wedding, sender_name="Ifeoma Nwosu",
            defaults=dict(message="Congratulations to you both!", amount=50000),
        )

        Payment.objects.get_or_create(
            event=wedding, booking=booking,
            defaults=dict(
                description="Catering deposit (50%)", amount=750000,
                status="PAID", method="TRANSFER",
                paid_on=now.date() - datetime.timedelta(days=7),
            ),
        )
        Payment.objects.get_or_create(
            event=wedding, description="Venue balance",
            defaults=dict(
                amount=1000000, status="PENDING", method="TRANSFER",
                due_date=now.date() + datetime.timedelta(days=30),
            ),
        )

        past_event, p_created = Event.objects.get_or_create(
            owner=planner, title="Chidi's 35th Birthday",
            defaults=dict(
                description="Rooftop birthday hangout.",
                category=Event.Category.BIRTHDAY, status=Event.Status.COMPLETED,
                event_date=now - datetime.timedelta(days=45),
                venue_name="Sky Lounge", city="Lagos", budget=400000,
            ),
        )
        if p_created:
            MemoryPost.objects.create(
                event=past_event, author=planner,
                image_url="https://picsum.photos/seed/memory1/800/600",
                caption="Golden hour on the rooftop — what a night!",
            )
            MemoryPost.objects.create(
                event=past_event, author=planner,
                image_url="https://picsum.photos/seed/memory2/800/600",
                caption="The cake moment.",
            )

        # Public "Our Work" gallery — placeholder shots until real project
        # photos are uploaded via the Django admin or the gallery API.
        gallery_specs = [
            ("WEDDING", "Garden wedding at The Monarch, Lekki", True),
            ("WEDDING", "Traditional engagement decor in burgundy & gold", False),
            ("ENGAGEMENT", "Rooftop proposal setup with 500 roses", True),
            ("ENGAGEMENT", "She said yes — beachside picnic proposal", False),
            ("SURPRISE", "Surprise 60th birthday reveal moment", True),
            ("SURPRISE", "Flash-mob anniversary surprise, Victoria Island", False),
            ("BIRTHDAY", "Gold-themed 40th birthday dinner", True),
            ("BIRTHDAY", "Kids' superhero party with balloon arch", False),
            ("BABY_SHOWER", "Teddy-bear themed baby shower", False),
            ("CORPORATE", "End-of-year gala for 300 guests", False),
            ("OTHER", "Custom balloon & backdrop installation", False),
        ]
        for i, (cat, caption, featured) in enumerate(gallery_specs):
            GalleryItem.objects.get_or_create(
                category=cat, caption=caption,
                defaults=dict(
                    image_url=f"https://picsum.photos/seed/blacksand{i}/900/700",
                    is_featured=featured, order=i,
                ),
            )

        self.stdout.write(self.style.SUCCESS(
            "Demo data ready. Users (password: %s): admin, amara (planner), tunde (planner), "
            "goldleaf/lensline/djspin/bloomz/wowmoments (vendors)" % DEMO_PASSWORD
        ))
