from rest_framework import serializers
from .models import User, UserProfile
from django.contrib.auth.password_validation import validate_password

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    name = serializers.CharField(write_only=True, required=True, help_text="Nom complet")

    class Meta:
        model = User
        fields = ('email', 'password', 'name')

    def create(self, validated_data):
        name = validated_data.pop('name', '')
        # Split name into first and last name simply
        parts = name.strip().split(' ', 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''
        
        # We need a unique username since it's required by AbstractUser
        username = validated_data['email'].split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create(
            username=username,
            email=validated_data['email'],
            first_name=first_name,
            last_name=last_name,
            role=User.Role.CANDIDATE
        )
        user.set_password(validated_data['password'])
        user.save()
        
        # Create empty profile
        UserProfile.objects.create(user=user)
        
        return user

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name

        return token
