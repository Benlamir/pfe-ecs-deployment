from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.serializers import ModelSerializer, CharField
from django.contrib.auth.password_validation import validate_password

from users.models import User, UserProfile
from courses.models import Establishment, SystemConfig
from courses.serializers import EstablishmentSerializer
from rest_framework.views import APIView

class SuperAdminEstablishmentViewSet(viewsets.ModelViewSet):
    """
    Super Admin endpoint for establishments.
    """
    queryset = Establishment.objects.all().order_by('name')
    serializer_class = EstablishmentSerializer
    permission_classes = [permissions.IsAdminUser]


class SuperAdminUserSerializer(ModelSerializer):
    password = CharField(write_only=True, required=False, validators=[validate_password])
    name = CharField(write_only=True, required=False)
    establishment_id = CharField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'name', 'role', 'password', 'is_active', 'establishment_id']
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        name = validated_data.pop('name', '')
        establishment_id = validated_data.pop('establishment_id', None)
        
        if name:
            parts = name.strip().split(' ', 1)
            validated_data['first_name'] = parts[0]
            validated_data['last_name'] = parts[1] if len(parts) > 1 else ''

        username_base = validated_data['email'].split('@')[0]
        username = username_base
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{username_base}{counter}"
            counter += 1
            
        validated_data['username'] = username
        
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        
        # Create empty profile
        UserProfile.objects.create(user=user)

        if establishment_id:
            try:
                estab = Establishment.objects.get(id=establishment_id)
                estab.manager = user
                estab.save()
            except Establishment.DoesNotExist:
                pass

        return user


class SuperAdminUserViewSet(viewsets.ModelViewSet):
    """
    Super Admin endpoint for users.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = SuperAdminUserSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_destroy(self, instance):
        # Soft delete by deactivating
        instance.is_active = False
        instance.save()

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('password')
        if not new_password:
            return Response({"error": "Nouveau mot de passe requis."}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        return Response({"status": "Mot de passe réinitialisé."})


class SystemConfigSerializer(ModelSerializer):
    class Meta:
        model = SystemConfig
        fields = ['academic_year', 'is_maintenance_mode']


class SystemConfigView(APIView):
    """
    Super Admin endpoint for Global System Configuration.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        config = SystemConfig.get_solo()
        serializer = SystemConfigSerializer(config)
        return Response(serializer.data)

    def patch(self, request):
        config = SystemConfig.get_solo()
        serializer = SystemConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
