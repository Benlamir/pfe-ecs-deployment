from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, EstablishmentViewSet, EnrollmentViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'establishments', EstablishmentViewSet)
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
]
