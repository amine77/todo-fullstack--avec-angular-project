# Todo App — Fullstack Architecture Hexagonale

🚀 **Projet de gestion de tâches (Todo List) moderne et complet**, construit avec les meilleures pratiques de l'architecture logicielle.

---

## 🌟 Fonctionnalités

- 🔐 **Authentification JWT** : Chaque utilisateur dispose de son propre espace de tâches sécurisé.
- ✅ **Gestion des tâches** : Création, lecture, inversion du statut (cocher/décocher) et suppression.
- ⚡ **Performance** : Mise en cache des listes de tâches via **Redis**.
- 📝 **Audit Log asynchrone** : Toute l'activité est tracée via **Apache Kafka** sans impacter l'API.
- 🎨 **Interface moderne** : Design premium (glassmorphism, dégradés) avec **Angular 20** et **Bootstrap 5**.

---

## 🏗️ Architecture

```
todo-fullstack--avec-angular-project/
├── todo-frontend/        # SPA Angular 20 (port 3001 en Docker)
└── todo-backend/         # API REST Spring Boot — Architecture Hexagonale (port 8080)
```

### Backend — Architecture Hexagonale (Ports & Adapters)

```
todo-backend/src/main/java/com/example/todo/
├── domain/
│   ├── model/            # Task, TaskEvent (Records Java 21, sans dépendances externes)
│   ├── ports/            # Interfaces : TaskRepository, AuditPublisher
│   └── service/          # TaskService (logique métier pure)
└── infrastructure/
    ├── adapters/
    │   ├── messaging/    # KafkaAuditConsumer, KafkaAuditPublisher
    │   ├── persistence/  # PostgresTaskRepository, TaskEntity (JPA)
    │   └── web/          # TaskController (REST), AuthController
    └── config/           # Spring Security JWT, Redis, Kafka
```

### Frontend — Angular 20 Standalone

```
todo-frontend/src/app/
├── core/
│   ├── services/         # TaskService (HttpClient)
│   ├── interceptors/     # authInterceptor (JWT automatique)
│   └── guards/           # authGuard (protection de /tasks)
└── features/
    ├── login/            # LoginComponent (Reactive Form)
    └── tasks/            # TaskListComponent (Signals + CRUD)
```

---

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| **Frontend** | Angular 20 · Bootstrap 5 · Angular Signals · Karma/Jasmine |
| **Backend** | Spring Boot 3 · Spring Security JWT · Architecture Hexagonale |
| **Base de données** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Message Broker** | Apache Kafka 3.7 (mode KRaft, sans Zookeeper) |
| **Conteneurisation** | Docker · Docker Compose · Nginx |

---

## 🐳 Lancer le projet en local (Docker)

> **Pré-requis** : Docker Desktop installé et en cours d'exécution.

```bash
# Depuis la racine du projet
docker-compose up --build -d
```

| Service | URL |
|---|---|
| 🎨 Frontend Angular | http://localhost:3001 |
| ⚙️ API Backend | http://localhost:8080 |
| 🐘 PostgreSQL | localhost:5432 |
| 🔴 Redis | localhost:6379 |
| 📨 Kafka | localhost:9092 |

**Connexion** : entrez n'importe quel pseudo dans le formulaire de login.

```bash
# Arrêter proprement tous les services
docker-compose down
```

---

## 💻 Développement local (sans Docker)

### Backend

```bash
cd todo-backend

# Pré-requis : Java 21, Maven 3.9+
# Démarrer d'abord PostgreSQL, Redis et Kafka (via Docker ou en local)

mvn spring-boot:run
# → API disponible sur http://localhost:8080
```

### Frontend

```bash
cd todo-frontend

# Pré-requis : Node.js ≥ 20, Angular CLI
npm install
npm start
# → App disponible sur http://localhost:4200
```

---

## 🧪 Tests

### Frontend — Tests Unitaires (Karma/Jasmine)

```bash
cd todo-frontend
ng test --watch=false --browsers=ChromeHeadless
# → Tests unitaires des composants, services et guards
```

### Frontend — Tests E2E (Cypress)

```bash
cd todo-frontend
npm run e2e
# → Lance les scénarios de bout en bout (mocking du backend inclus)
```

### Backend (JUnit 5 + Cucumber BDD)

```bash
cd todo-backend
mvn test
# → Tests unitaires JUnit + scénarios d'intégration Cucumber (BDD)
```

---

## 🔌 API Reference

### Authentification

```http
POST /api/auth/login
Content-Type: application/json

{ "username": "votre_pseudo" }
```
→ Retourne `{ "token": "eyJ..." }`

### Tâches (requiert `Authorization: Bearer <token>`)

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Liste toutes les tâches |
| `POST` | `/api/tasks` | Crée une tâche (body: `text/plain`) |
| `PUT` | `/api/tasks/{id}/toggle` | Bascule completed/non-completed |
| `DELETE` | `/api/tasks/{id}` | Supprime une tâche |

---

## 🔗 Dépôt GitHub

[https://github.com/amine77/todo-fullstack--avec-angular-project](https://github.com/amine77/todo-fullstack--avec-angular-project)

---

## 🚀 CI / CD & Déploiement (Render.com)

Le projet intègre un pipeline complet avec **GitHub Actions** (`.github/workflows/ci-cd.yml`) permettant :
1. De lancer l'intégralité des tests à chaque `push` :
   - Pipeline **Backend** (Maven, JUnit, Cucumber BDD + infrastructure Kafka/Redis via Docker).
   - Pipeline **Frontend** (Angular, Jasmine, Cypress).
2. De construire automatiquement les images **Docker** locales.
3. De les publier sur **GitHub Container Registry (GHCR)**.
4. De déclencher automatiquement le redéploiement sur **Render.com**.

### Configuration dans GitHub
Pour activer le déploiement continu vers Render.com, configurez les **Secrets** suivants dans les paramètres de votre dépôt GitHub (`Settings > Secrets and variables > Actions`) :

- `RENDER_DEPLOY_HOOK_BACKEND` : L'URL de votre Web Hook de déploiement Render (Service Web Backend).
- `RENDER_DEPLOY_HOOK_FRONTEND` : L'URL de votre Web Hook de déploiement Render (Service Web Frontend).

> [!TIP]
> Sur **Render.com**, créez deux "Web Services" utilisant la source "Docker" et connectés à votre Container Registry GitHub pour récupérer `ghcr.io/votre_depot/todo-backend:latest` et `todo-frontend:latest`. Récupérez ensuite le lien du "Deploy Hook" fourni par Render.