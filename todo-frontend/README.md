# Todo Frontend — Angular 20

Interface utilisateur de l'application **Todo List Fullstack**, construite avec **Angular 20** (Standalone Components, Signals, Router).

---

## 🧱 Stack technique

| Outil | Rôle |
|---|---|
| **Angular 20** | Framework frontend (Standalone Components) |
| **Angular Router** | Navigation SPA (`/login`, `/tasks`) |
| **Angular Signals** | Gestion d'état réactive (`signal()`, `computed()`) |
| **Reactive Forms** | Formulaire de connexion avec validation |
| **HttpClient + Intercepteur JWT** | Requêtes HTTP authentifiées automatiquement |
| **Bootstrap 5** | Système de grille et composants UI (via CDN) |
| **Bootstrap Icons** | Icônes (via CDN) |
| **Karma + Jasmine** | Tests unitaires |

---

## 📁 Structure du projet

```
src/
├── index.html                          # Point d'entrée HTML (Bootstrap 5 CDN)
├── styles.css                          # Styles globaux (premium-card, task-item…)
├── main.ts                             # Bootstrap Angular via appConfig
└── app/
    ├── app.ts                          # Root component (<router-outlet>)
    ├── app.config.ts                   # Providers : HttpClient + JWT interceptor + Router
    ├── app.routes.ts                   # Routes /login, /tasks (lazy), AuthGuard, wildcard
    ├── core/
    │   ├── services/
    │   │   ├── task.service.ts         # Service HTTP : login, getTasks, CRUD tâches
    │   │   └── task.service.spec.ts    # 11 tests unitaires
    │   ├── interceptors/
    │   │   └── auth.interceptor.ts     # Ajout automatique du header Authorization: Bearer
    │   └── guards/
    │       ├── auth.guard.ts           # CanActivateFn : vérifie le JWT avant /tasks
    │       └── auth.guard.spec.ts      # 4 tests unitaires
    └── features/
        ├── login/
        │   ├── login.component.ts      # Formulaire connexion, loading state, erreur
        │   └── login.component.spec.ts # 14 tests unitaires
        └── tasks/
            ├── task-list.component.ts  # Liste CRUD, Angular Signals, logout
            └── task-list.component.spec.ts # 22 tests unitaires
```

---

## 🔑 Concepts Angular 20 utilisés

### Standalone Components
Tous les composants sont standalone — aucun `NgModule` n'est nécessaire.
Les dépendances sont déclarées directement dans les `imports: []` de chaque composant.

### Angular Signals
```typescript
// Déclaration d'un signal réactif
tasks = signal<Task[]>([]);

// Computed signal (recalculé automatiquement si tasks() change)
completedCount = computed(() => this.tasks().filter(t => t.completed).length);

// Mise à jour → déclenche le re-render du template
this.tasks.set(data);
```

### Nouvelle syntaxe de template (Angular 17+)
```html
@if (isLoading()) { <spinner /> }
@for (task of tasks(); track task.id) { <task-item /> }
```

### Intercepteur HTTP fonctionnel
```typescript
// Attache le JWT à toutes les requêtes sortantes
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

### Lazy Loading des routes
```typescript
{ path: 'tasks', loadComponent: () => import('./features/tasks/task-list.component') }
```

---

## 🚀 Lancer en développement

### Pré-requis
- Node.js ≥ 20
- Angular CLI : `npm install -g @angular/cli`
- Backend Spring Boot en cours d'exécution sur `http://localhost:8080`

### Démarrage
```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement (hot reload)
npm start
# → http://localhost:4200
```

---

## 🏗️ Build de production

```bash
npm run build
# Artefacts dans : dist/todo-frontend/browser/
```

---

## 🧪 Tests unitaires

```bash
# Lancer tous les tests (Karma + Jasmine, mode CI)
ng test --watch=false --browsers=ChromeHeadless
```

### Couverture des tests (61 tests)

| Fichier | Tests | Cas couverts |
|---|---|---|
| `task.service.spec.ts` | 11 | login ✓/✗, getTasks (liste/vide/403), createTask, toggleTask, deleteTask |
| `auth.guard.spec.ts` | 4 | Token présent, absent, vide, redirection /login |
| `login.component.spec.ts` | 14 | Rendu, validation, login ✓/✗, redirection si déjà connecté |
| `task-list.component.spec.ts` | 22 | ngOnInit, état vide, CRUD, logout, erreurs 401/403/500 |
| `app.spec.ts` | 2 | Instanciation du root component |

---

## 🎭 Tests E2E (Cypress)

Les tests de bout en bout sont implémentés avec **Cypress**. Les appels API de l'application vers le backend sont "mockés" (simulés via `cy.intercept`), ce qui permet d'exécuter ces scénarios de test rapidement, sans avoir besoin de démarrer le backend Java ou d'initialiser la base de données.

```bash
# Ouvrir l'interface UI de Cypress (mode interactif)
npm run e2e

# Lancer les tests en mode headless (sans interface graphique, idéal CI)
npx cypress run
```

### Scénarios couverts :
- `auth.cy.ts` : Vérification du flux d'authentification complet, incluant la gestion des erreurs de connexion, la création du JWT local, et la protection des URLs par le Router.
- `tasks.cy.ts` : Parcours utilisateur complet pour la gestion des tâches (CRUD complet), interaction fluide, et bouton de déconnexion.

---

## 🐳 Déploiement Docker

Le frontend est conteneurisé avec un build multi-stages :

```dockerfile
# Stage 1 : Build Angular (Node.js 20)
FROM node:20-alpine AS build
# → npm install + ng build → dist/todo-frontend/browser/

# Stage 2 : Servir avec Nginx (ultra-léger)
FROM nginx:stable-alpine
# → Configuration Nginx avec HTML5 routing fallback
```

**Configuration Nginx** (`nginx.conf`) : gère le HTML5 routing Angular via `try_files $uri /index.html`, évitant les erreurs 404 lors des rechargements de page sur `/tasks` ou `/login`.

```bash
# Build et démarrage via docker-compose (depuis la racine du projet)
docker-compose up --build -d
# → Frontend disponible sur http://localhost:3001
```

---

## 🔀 Navigation et flux d'authentification

```
/  ──────────────────────────→  /tasks
                                    │
                              [authGuard]
                                    │
                          JWT présent ?
                           ┌────────┴────────┐
                          OUI               NON
                           │                 │
                      TaskListComponent  /login
                                          │
                                    LoginComponent
                                          │
                               POST /api/auth/login
                                          │
                                   token → localStorage
                                          │
                                     navigate /tasks
```

---

## 🔌 API consommée (Backend Spring Boot)

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | Retourne un JWT |
| `GET` | `/api/tasks` | ✅ JWT | Liste toutes les tâches |
| `POST` | `/api/tasks` | ✅ JWT | Crée une tâche (body: text/plain) |
| `PUT` | `/api/tasks/{id}/toggle` | ✅ JWT | Bascule completed/non-completed |
| `DELETE` | `/api/tasks/{id}` | ✅ JWT | Supprime une tâche |

> Le header `Authorization: Bearer <token>` est ajouté **automatiquement** par `authInterceptor` sur toutes les requêtes (sauf `/auth/login`).
