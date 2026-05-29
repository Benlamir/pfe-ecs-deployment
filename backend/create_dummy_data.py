from courses.models import Course, Establishment
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

# Try to find an existing admin/manager
u = User.objects.filter(role='SUPER_ADMIN').first()
if not u:
    u = User.objects.filter(is_superuser=True).first()

if not u:
    # Create if really nobody exists
    # Make sure username 'admin' is not taken by a non-superuser
    if User.objects.filter(username='admin').exists():
         u = User.objects.get(username='admin')
    else:
         u = User.objects.create_superuser('admin', 'admin@cfc.com', 'password123', role='SUPER_ADMIN')
         print("Created new superuser 'admin'")
else:
    print(f"Using existing user: {u.email} ({u.username})")

# Create Establishment using this user
e, _ = Establishment.objects.get_or_create(name='Polytech', code='POLY', defaults={'manager': u})

# Create Course
now = timezone.now().date()
c, created = Course.objects.get_or_create(
    title='Data Science & IA',
    defaults={
        'description': 'Une formation complète pour maîtriser la Data Science et\'Intelligence Artificielle. Vous apprendrez Python, Machine Learning, et Deep Learning.',
        'establishment': e,
        'coordinator': u,
        'status': 'PUBLISHED',
        'start_date': now + timedelta(days=10),
        'end_date': now + timedelta(days=90),
        'registration_open_date': now - timedelta(days=5),
        'registration_close_date': now + timedelta(days=5),
        'capacity': 20
    }
)
print(f"Course '{c.title}' ID: {c.id}")
