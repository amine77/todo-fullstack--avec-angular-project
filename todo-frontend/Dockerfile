# ─────────────────────────────────────────────────────────────────
# Dockerfile — Frontend Angular 20
#
# Build multi-stages :
#   Stage 1 (build)  : Compile l'application Angular avec Node.js
#   Stage 2 (serve)  : Sert les fichiers statiques via Nginx
#
# Pré-requis : .dockerignore doit exclure node_modules/ et dist/
# ─────────────────────────────────────────────────────────────────

# ── Stage 1 : Build Angular ──────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances en premier (optimisation cache Docker).
# Angular CLI génère des dépendances avec des versions fixes (~),
# npm install est plus robuste que npm ci dans un environnement conteneurisé.
COPY package*.json ./

# Installation des dépendances
RUN npm install --legacy-peer-deps

# Copier tout le code source Angular
# (node_modules et dist sont exclus par .dockerignore)
COPY . .

# Build de production Angular.
# ng build produit les fichiers dans dist/todo-frontend/browser/
RUN npm run build

# ── Stage 2 : Servir avec Nginx ───────────────────────────────────
FROM nginx:stable-alpine

# Copier les fichiers du build Angular vers le dossier servi par Nginx.
# IMPORTANT : Angular CLI place le build dans dist/<nom-projet>/browser/
COPY --from=build /app/dist/todo-frontend/browser /usr/share/nginx/html

# Copier la configuration Nginx pour le HTML5 routing Angular
# (évite les 404 au rechargement des routes /tasks, /login, etc.)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]