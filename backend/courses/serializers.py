import os
from rest_framework import serializers
from .models import Course, Establishment, Enrollment

class EstablishmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Establishment
        fields = ['id', 'name', 'code', 'logo', 'description', 'address', 'website', 'manager', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class CourseSerializer(serializers.ModelSerializer):
    # Vue détaillée de l'établissement (lecture seule)
    establishment_details = EstablishmentSerializer(source='establishment', read_only=True)
    
    # Champ calculé pour savoir si ouvert
    is_open = serializers.BooleanField(source='is_open_for_registration', read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 
            'title', 
            'description', 
            'establishment', 
            'establishment_details',
            'coordinator', 
            'status', 
            'start_date', 
            'end_date',
            'registration_open_date', 
            'registration_close_date', 
            'capacity',
            'is_open',
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class EnrollmentSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_details', 'candidate', 'status', 'application_date', 'rejection_reason', 'documents', 'cv_file', 'diplome_file']
        read_only_fields = ['id', 'candidate', 'application_date']
        # 'candidate' est read-only car il sera rempli automatiquement avec l'user connecté

    def _validate_file(self, value, max_size_mb, allowed_extensions):
        if not value:
            return value
            
        if value.size > max_size_mb * 1024 * 1024:
            raise serializers.ValidationError(f"La taille du fichier ne doit pas dépasser {max_size_mb} MB.")
            
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(f"Format de fichier non supporté. Formats acceptés : {', '.join(allowed_extensions)}")
            
        return value

    def validate_cv_file(self, value):
        return self._validate_file(value, max_size_mb=5, allowed_extensions=['.pdf', '.doc', '.docx'])
        
    def validate_diplome_file(self, value):
        return self._validate_file(value, max_size_mb=5, allowed_extensions=['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'])
