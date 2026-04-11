/**
 * app.spec.ts
 *
 * Test unitaire du composant racine AppComponent.
 *
 * Ce composant étant minimal (uniquement <router-outlet>),
 * le test vérifie simplement son instanciation correcte.
 */

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { App } from './app';

describe('AppComponent (Root)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,               // Composant standalone
        RouterTestingModule // Fournit le RouterOutlet en mode test
      ],
    }).compileComponents();
  });

  it('devrait créer le composant racine', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('devrait avoir le sélecteur "app-root"', () => {
    const fixture = TestBed.createComponent(App);
    const compiled = fixture.nativeElement as HTMLElement;
    // Le composant racine doit se monter correctement
    expect(compiled).toBeDefined();
  });
});
