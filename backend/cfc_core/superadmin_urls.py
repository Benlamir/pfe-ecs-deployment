from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .superadmin_views import SuperAdminEstablishmentViewSet, SuperAdminUserViewSet, SystemConfigView

router = DefaultRouter()
router.register(r'etablissements', SuperAdminEstablishmentViewSet, basename='superadmin-etablissement')
router.register(r'users', SuperAdminUserViewSet, basename='superadmin-user')

urlpatterns = [
    path('config/system/', SystemConfigView.as_view(), name='system-config'),
    path('', include(router.urls)),
]
