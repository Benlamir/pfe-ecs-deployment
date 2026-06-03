#!/bin/bash
set -e

echo "Application des migrations de base de données..."
python manage.py migrate --noinput

echo "Création des utilisateurs initiaux..."
python manage.py seed_users

echo "Démarrage du serveur Gunicorn..."
exec gunicorn --bind 0.0.0.0:8000 cfc_core.wsgi:application
