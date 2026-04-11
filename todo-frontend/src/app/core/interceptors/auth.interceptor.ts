/**
 * auth.interceptor.ts
 *
 * Intercepteur HTTP fonctionnel (Angular 15+ / withInterceptors).
 *
 * Rôle : Attacher automatiquement le Token JWT stocké dans localStorage
 * à l'en-tête Authorization de CHAQUE requête HTTP sortante.
 *
 * Fonctionnement :
 *  1. Lit le token dans localStorage à chaque requête
 *  2. Si token présent → clone la requête avec le header Authorization: Bearer <token>
 *  3. Si token absent → laisse passer la requête sans modification (ex: /auth/login)
 *
 * Ce pattern "functional interceptor" (HttpInterceptorFn) est la
 * méthode recommandée depuis Angular 15+ pour les apps standalone.
 */

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Lecture du token JWT depuis le stockage local du navigateur
  const token = localStorage.getItem('token');

  // Si aucun token → on passe la requête intacte (nécessaire pour /auth/login)
  if (!token) {
    return next(req);
  }

  // Clone de la requête avec l'en-tête Authorization ajouté.
  // Les requêtes HttpRequest sont immuables — on doit obligatoirement cloner.
  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest);
};
