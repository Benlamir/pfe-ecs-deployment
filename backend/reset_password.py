import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cfc_core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

try:
    u = User.objects.get(username='admin')
    u.set_password('password123')
    u.email = 'admin@cfc.com' # Ensure email is correct
    u.save()
    print(f"Password updated for user: {u.username} ({u.email})")
except User.DoesNotExist:
    print("User 'admin' does not exist. Creating...")
    u = User.objects.create_superuser('admin', 'admin@cfc.com', 'password123')
    print("User created.")
