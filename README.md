# Todo App - Fullstack Architecture Hexagonale

🚀 **Projet de gestion de tâches (Todo List) moderne et complet**, construit avec les meilleures pratiques de l'architecture logicielle.

## 🌟 Fonctionnalités

*   🔐 **Authentification JWT** : Chaque utilisateur dispose de son propre espace de tâches.
*   ✅ **Gestion des tâches** : Création, lecture, inversion du statut (cocher/décocher) et **suppression** de vos tâches !
*   ⚡ **Performance** : Mise en cache agressive des listes de tâches via **Redis**.
*   📝 **Audit Log Temps Réel** : Toute l'activité de votre Todo-List est tracée de manière asynchrone par un **Broker Apache Kafka** sans ralentir l'API principale.
*   🎨 **Interface Utilisateur** : Design ultra-moderne (Glassmorphism, dégradés) utilisant **React** et **Bootstrap 5**.

## 🏗️ Architecture

Le backend applique les principes de l'**Architecture Hexagonale (Ports & Adapters)** :
*   `domain` : Contient le cœur du métier (`Task`, `TaskService`) sans dépendance aux frameworks externes. Utilise les **Records Java 21**.
*   `infrastructure` : Contient tous les adaptateurs (API REST, Base Postgres, Redis, Spring Security JWT et le **Moteur Kafka KRaft**).

## 🐳 Comment lancer le projet en local

C'est extrêmement simple grâce à Docker. L'environnement complet se déploiera en une seule commande !

1. Ouvrez un terminal à la racine du projet.
2. Lancez l'infrastructure complète :
```bash
docker-compose up --build -d
```
3. L'application est prête ! Ouvrez votre navigateur sur **http://localhost:3001**
4. Connectez-vous avec n'importe quel pseudo pour démarrer.

*Pour éteindre l'application proprement : `docker-compose down`*

## 🧪 Tests

Lancer les tests (Qualité, JUnit et Cucumber) :
```bash
cd todo-backend
mvn test
```

## 🔌 API Reference (Postman/Curl)

*   `POST /api/auth/login` : Envoyer `{"username": "votre_pseudo"}` pour récupérer un Token.
*   `GET /api/tasks` : Lister les tâches (Nécessite Header `Authorization: Bearer <token>`).
*   `POST /api/tasks` : Créer une tâche.
*   `PUT /api/tasks/{id}/toggle` : Cocher/décocher une tâche.
*   `DELETE /api/tasks/{id}` : Supprimer une tâche.