/**
 * app.routes.ts
 *
 * Définition centralisée de toutes les routes de l'application.
 *
 * Structure de navigation :
 *
 *  /              → redirige vers /tasks (route par défaut)
 *  /login         → LoginComponent     (accès public — aucun guard)
 *  /tasks         → TaskListComponent  (route privée — authGuard requis)
 *  **             → redirige vers /login (toute URL inconnue = non authentifié)
 *
 * Le lazy loading n'est pas utilisé ici car l'application est simple,
 * mais pourrait être ajouté (loadComponent) si la taille augmente.
 */

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Redirection racine ──────────────────────────────────────────
  // Un utilisateur arrivant sur "/" est redirigé vers "/tasks".
  // authGuard s'occupera de le renvoyer vers "/login" si non connecté.
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },

  // ── Page de connexion (publique) ────────────────────────────────
  // Lazy-loaded pour optimiser le bundle initial.
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  // ── Liste des tâches (privée, protégée par authGuard) ──────────
  // authGuard vérifie la présence du JWT avant d'activer la route.
  // Si absent → redirection automatique vers /login.
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/task-list.component').then(
        (m) => m.TaskListComponent
      ),
    canActivate: [authGuard],
  },

  // ── Wildcard : toute URL inconnue → login ───────────────────────
  // Évite les pages 404 et redirige vers le flux d'authentification.
  {
    path: '**',
    redirectTo: 'login',
  },
];
