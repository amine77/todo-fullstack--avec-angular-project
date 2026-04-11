/**
 * app.ts (AppComponent)
 *
 * Composant racine de l'application Angular.
 *
 * Rôle : Servir de point de montage pour le Router Angular.
 * Ce composant est minimal par design — toute la logique métier
 * est déléguée aux composants de features (login, tasks).
 *
 * <router-outlet> est la directive Angular qui rend le composant
 * correspondant à l'URL courante :
 *   /login  → LoginComponent
 *   /tasks  → TaskListComponent
 *
 * Le sélecteur <app-root> correspond à la balise dans index.html.
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  // Composant standalone : pas besoin de NgModule
  standalone: true,
  imports: [
    // RouterOutlet est nécessaire pour que <router-outlet> fonctionne
    RouterOutlet,
  ],
  // Template minimal : toute la navigation est gérée par le Router
  template: `<router-outlet />`,
})
export class App {
  // Ce composant n'a intentionnellement aucune logique.
  // Il sert uniquement de "coquille" pour le router-outlet.
}
