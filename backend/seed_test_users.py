import os
import django

# Configuration de l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cfc_core.settings')
django.setup()

from users.models import User, UserProfile

def create_user(email, username, first_name, last_name, password, role, is_superuser=False):
    user = User.objects.filter(username=username).first() or User.objects.filter(email=email).first()
    
    if user:
        print(f"L'utilisateur {email} ou {username} existe déjà, mise à jour du rôle et mot de passe...")
        user.email = email
        user.username = username
        user.first_name = first_name
        user.last_name = last_name
        user.role = role
        user.is_superuser = is_superuser
        user.is_staff = is_superuser
    else:
        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role,
            is_superuser=is_superuser,
            is_staff=is_superuser
        )
        
    user.set_password(password)
    user.save()
    
    UserProfile.objects.get_or_create(user=user)
    print(f"✅ Utilisateur prêt : {email} (Rôle: {role})")

print("Création des comptes de test en cours...")

# 1. Super Admin
create_user(
    email="admin@cfc.local",
    username="admin",
    first_name="Super",
    last_name="Admin",
    password="password123",
    role=User.Role.SUPER_ADMIN,
    is_superuser=True
)

# 2. Coordinateur
create_user(
    email="coordinateur@cfc.local",
    username="coordinateur",
    first_name="Jean",
    last_name="Coordinateur",
    password="password123",
    role=User.Role.COORDINATOR
)

# 3. Admin Établissement
create_user(
    email="etab@cfc.local",
    username="etablissement",
    first_name="Admin",
    last_name="Etablissement",
    password="password123",
    role=User.Role.ETABLISSEMENT_ADMIN
)

# 4. Candidat
create_user(
    email="candidat@cfc.local",
    username="candidat",
    first_name="Mohamed",
    last_name="Candidat",
    password="password123",
    role=User.Role.CANDIDATE
)

print("Terminé ! Vous pouvez désormais vous connecter.")
