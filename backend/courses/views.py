from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from .models import Course, Establishment, Enrollment
from .serializers import CourseSerializer, EstablishmentSerializer, EnrollmentSerializer
from .permissions import IsCoordinatorOrReadOnly

class EstablishmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing establishments.
    """
    queryset = Establishment.objects.all().order_by('name')
    serializer_class = EstablishmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing courses.
    """
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCoordinatorOrReadOnly]

    def perform_create(self, serializer):
        # Assign current user as coordinator automatically on creation
        serializer.save(coordinator=self.request.user)

class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing enrollments.
    - Candidates can Create (POST) an enrollment for themselves.
    - Candidates can List (GET) only their own enrollments.
    - Coordinators can List (GET) all enrollments for their courses.
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Enrollment.objects.all()
        
        # Le candidat ne voit que ses candidatures
        # Le coordinateur voit aussi les candidatures aux cours qu'il gère
        return Enrollment.objects.filter(
            models.Q(candidate=user) | 
            models.Q(course__coordinator=user)
        ).distinct()

    def create(self, request, *args, **kwargs):
        print("REQUEST DATA:", request.data)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("VALIDATION ERRORS:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        from rest_framework import serializers 
        # Vérifier si le candidat a déjà une inscription pour ce cours
        course = serializer.validated_data['course']
        if Enrollment.objects.filter(course=course, candidate=self.request.user).exists():
            raise serializers.ValidationError({"course": "Vous êtes déjà inscrit à ce cours."})
            
        # Assigner automatiquement le candidat connecté et forcer le statut initial pour ignorer les tentatives directes
        serializer.save(candidate=self.request.user, status=Enrollment.Status.SUBMITTED, rejection_reason='')
        
    def perform_update(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        user = self.request.user
        instance = self.get_object()
        
        # Check if 'status' or 'rejection_reason' is being updated by a non-coordinator
        updating_restricted_fields = 'status' in serializer.validated_data or 'rejection_reason' in serializer.validated_data
        
        if updating_restricted_fields:
            # Only superusers or the course coordinator can change the status
            if not (user.is_superuser or instance.course.coordinator == user):
                raise PermissionDenied("Vous n'êtes pas autorisé à modifier le statut de cette candidature.")
                
        serializer.save()
