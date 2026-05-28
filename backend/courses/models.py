from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import uuid

class Establishment(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    logo = models.ImageField(upload_to='establishments/logos/', null=True, blank=True)
    description = models.TextField(blank=True)
    address = models.TextField(blank=True)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Manager (Admin Etablissement)
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_establishments'
    )

    def __str__(self):
        return f"{self.name} ({self.code})"

class Course(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Brouillon')
        PUBLISHED = 'PUBLISHED', _('Publié')
        ARCHIVED = 'ARCHIVED', _('Archivé')

    title = models.CharField(max_length=200)
    description = models.TextField()
    establishment = models.ForeignKey(
        Establishment,
        on_delete=models.CASCADE,
        related_name='courses',
        null=True,     # Nullable for now to ease migration/testing
        blank=True
    )
    coordinator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='coordinated_courses'
    )
    
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.DRAFT
    )
    
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    registration_open_date = models.DateField(null=True, blank=True)
    registration_close_date = models.DateField(null=True, blank=True)
    
    capacity = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_open_for_registration(self):
        """
        [Règle Métier]
        Retourne VRAI si :
        status == PUBLISHED
        ET date du jour entre open_date et close_date
        """
        if self.status != self.Status.PUBLISHED:
            return False
            
        today = timezone.now().date()
        
        if self.registration_open_date and today < self.registration_open_date:
            return False
            
        if self.registration_close_date and today > self.registration_close_date:
            return False
            
        return True

    def __str__(self):
        return self.title

class Enrollment(models.Model):
    class Status(models.TextChoices):
        PRE_ENROLLED = 'PRE_ENROLLED', _('Pré-inscrit')
        SUBMITTED = 'SUBMITTED', _('Soumis')
        UNDER_REVIEW = 'UNDER_REVIEW', _('En cours de revue')
        ACCEPTED = 'ACCEPTED', _('Accepté')
        REJECTED = 'REJECTED', _('Rejeté')
        FINALIZED = 'FINALIZED', _('Finalisé')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED
    )
    
    cv_file = models.FileField(
        upload_to='enrollments/cvs/',
        null=True,
        blank=True,
        help_text="CV ou Dossier de candidature"
    )
    
    diplome_file = models.FileField(
        upload_to='enrollments/diplomes/',
        null=True,
        blank=True,
        help_text="Copie du dernier diplôme obtenu"
    )
    
    application_date = models.DateTimeField(auto_now_add=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Pour stocker des JSON (documents, réponses formulaire...)
    # Nécessite PostgreSQL idéalement, mais OK pour dev
    documents = models.JSONField(default=dict, blank=True)

    class Meta:
        # Un candidat ne peut s'inscrire qu'une seule fois par cours
        unique_together = ('course', 'candidate')
        ordering = ['-application_date']

    def __str__(self):
        return f"{self.candidate} -> {self.course} ({self.status})"

class SystemConfig(models.Model):
    """
    Singleton model for global system configuration.
    """
    academic_year = models.CharField(max_length=20, default="2025-2026", help_text="Ex: 2025-2026")
    is_maintenance_mode = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Configuration Système"
        verbose_name_plural = "Configuration Système"
        
    @classmethod
    def get_solo(cls):
        obj, created = cls.objects.get_or_create(id=1)
        return obj

    def __str__(self):
        return "Configuration Globale"
