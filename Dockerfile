# Utiliser l'image Nginx officielle basée sur Alpine Linux (légère et sécurisée)
FROM nginx:alpine

# Copier notre fichier HTML dans le dossier par défaut de Nginx
COPY index.html /usr/share/nginx/html/index.html

# Exposer le port 80 pour le trafic web
EXPOSE 80

# Démarrer Nginx en premier plan
CMD ["nginx", "-g", "daemon off;"]
