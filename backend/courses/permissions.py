from rest_framework import permissions
from users.models import User

class IsCoordinator(permissions.BasePermission):
    """
    Permission permettant uniquement aux Coordinateurs de modifier.
    Read-only pour les autres.
    """
    def has_permission(self, request, view):
        # Pour les méthodes de lecture (GET) ou l'authentification
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Lecture autorisée pour tous
        if request.method in permissions.SAFE_METHODS:
            return True

        # Écriture autorisée uniquement si l'utilisateur est le coordinateur du cours
        # OU si c'est un Super Admin
        return obj.coordinator == request.user or request.user.is_superuser

class IsEstablishmentManager(permissions.BasePermission):
    """
    Permission pour les Managers d'Etablissement.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # L'objet peut être un Establishment ou un Course (via establishment)
        if hasattr(obj, 'manager'):
            return obj.manager == request.user or request.user.is_superuser
        if hasattr(obj, 'establishment'):
            return obj.establishment.manager == request.user or request.user.is_superuser
        return False

class IsCoordinatorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow coordinators of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the coordinator of the course.
        return obj.coordinator == request.user or request.user.is_superuser
