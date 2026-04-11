/**
 * app.config.ts
 *
 * Configuration globale de l'application Angular (remplace AppModule).
 *
 * Providers configurés :
 *
 *  1. provideBrowserGlobalErrorListeners()
 *     → Capture les erreurs non gérées dans la console du navigateur.
 *
 *  2. provideZoneChangeDetection({ eventCoalescing: true })
 *     → Active la détection de changement basée sur Zone.js.
 *     eventCoalescing regroupe les micro-tasks pour réduire les cycles
 *     de détection inutiles → gain de performance.
 *
 *  3. provideRouter(routes)
 *     → Configure le Router Angular avec les routes définies dans app.routes.ts.
 *     withComponentInputBinding() permet de passer les paramètres de route
 *     comme inputs de composant (@Input() directement).
 *
 *  4. provideHttpClient(withInterceptors([authInterceptor]))
 *     → Configure HttpClient avec l'intercepteur JWT fonctionnel.
 *     Chaque requête HTTP sortante sera automatiquement enrichie
 *     du header Authorization: Bearer <token>.
 */

import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Gestion globale des erreurs navigateur
    provideBrowserGlobalErrorListeners(),

    // Zone.js avec coalescence des événements pour optimiser les performances
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router Angular avec support des route inputs
    provideRouter(routes, withComponentInputBinding()),

    // HttpClient avec intercepteur JWT automatique
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
  ],
};
