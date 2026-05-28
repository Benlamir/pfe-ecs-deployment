# Utiliser l'image Nginx officielle basée sur Alpine Linux (légère et sécurisée)
FROM nginx:alpine

# Changer le port de Nginx pour écouter sur le port 8000 (comme Django)
RUN sed -i 's/80/8000/g' /etc/nginx/conf.d/default.conf

# Créer un dossier et fichier pour que la route /health/ renvoie un code 200 OK
RUN mkdir -p /usr/share/nginx/html/health
RUN echo "OK" > /usr/share/nginx/html/health/index.html

# Copier notre fichier HTML principal
COPY index.html /usr/share/nginx/html/index.html

# Exposer le port 8000 pour le trafic web
EXPOSE 8000

# Démarrer Nginx en premier plan
CMD ["nginx", "-g", "daemon off;"]
