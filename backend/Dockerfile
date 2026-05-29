# 1. Image de base officielle Python (Légère et sécurisée)
# Utilisation de "slim" pour réduire la taille (Debian minimal)
FROM python:3.11-slim

# 2. Variables d'environnement pour optimiser Python dans Docker
# Empêche Python de créer des fichiers .pyc (inutiles dans un conteneur)
ENV PYTHONDONTWRITEBYTECODE=1
# Force les logs à s'afficher en direct dans le terminal (Crucial pour le debug)
ENV PYTHONUNBUFFERED=1

# 3. Répertoire de travail dans le conteneur
WORKDIR /app

# 4. Installation des dépendances système (Pour Postgres)
# libpq-dev est nécessaire pour que psycopg2 puisse compiler
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 5. Gestion des dépendances Python (Mise en cache)
# On copie d'abord le requirements.txt seul
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# 6. Copie du code source
COPY . /app/

# 7. Commande de démarrage (Mode Production AWS via Gunicorn)
# On n'utilise plus runserver en production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "cfc_core.wsgi:application"]
