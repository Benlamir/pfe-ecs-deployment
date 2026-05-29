from django.core.management.base import BaseCommand
from users.models import User

class Command(BaseCommand):
    help = 'Crée les comptes de test pour le CFC'

    def handle(self, *args, **options):
        users_data = [
            {
                'email': 'admin@cfc.local',
                'username': 'admin_cfc',
                'role': User.Role.SUPER_ADMIN,
                'password': 'password123',
                'is_superuser': True,
                'is_staff': True
            },
            {
                'email': 'coordinateur@cfc.local',
                'username': 'coord_cfc',
                'role': User.Role.COORDINATOR,
                'password': 'password123'
            },
            {
                'email': 'etab@cfc.local',
                'username': 'etab_cfc',
                'role': User.Role.ETABLISSEMENT_ADMIN,
                'password': 'password123'
            },
            {
                'email': 'candidat@cfc.local',
                'username': 'candidat_cfc',
                'role': User.Role.CANDIDATE,
                'password': 'password123'
            }
        ]

        for data in users_data:
            email = data['email']
            if not User.objects.filter(email=email).exists():
                is_superuser = data.pop('is_superuser', False)
                is_staff = data.pop('is_staff', False)
                
                if is_superuser:
                    user = User.objects.create_superuser(**data)
                else:
                    user = User.objects.create_user(**data)
                    
                self.stdout.write(self.style.SUCCESS(f'✅ Utilisateur créé: {email} ({user.role})'))
            else:
                self.stdout.write(self.style.WARNING(f'ℹ️ L\'utilisateur existe déjà: {email}'))

        self.stdout.write(self.style.SUCCESS('🎉 Tous les comptes de test sont prêts!'))
