/**
 * auth.guard.ts
 *
 * Route Guard Angular (CanActivateFn — API fonctionnelle Angular 15+).
 *
 * Rôle : Protéger les routes privées (ex: /tasks) des utilisateurs non authentifiés.
 *
 * Fonctionnement :
 *  1. Vérifie la présence d'un token JWT dans localStorage
 *  2. Token présent  → autorise la navigation (retourne true)
 *  3. Token absent   → redirige vers /login via Router (retourne UrlTree)
 *
 * Utilisation dans app.routes.ts :
 *  {
 *    path: 'tasks',
 *    component: TaskListComponent,
 *    canActivate: [authGuard]   ← application du guard
 *  }
 *
 * Note : Le guard ne valide PAS la signature du token côté client
 * (ce serait inutile car le secret HMAC est côté serveur).
 * La validation réelle se fait par Spring Security à chaque requête API.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  // Vérification simple de la présence du token dans localStorage
  const token = localStorage.getItem('token');

  if (token) {
    // Utilisateur authentifié → on autorise l'accès à la route
    return true;
  }

  // Utilisateur non authentifié → redirection vers la page de login.
  // On retourne un UrlTree pour que Angular gère la redirection proprement
  // (annule la navigation courante et en démarre une nouvelle vers /login).
  return router.createUrlTree(['/login']);
};
