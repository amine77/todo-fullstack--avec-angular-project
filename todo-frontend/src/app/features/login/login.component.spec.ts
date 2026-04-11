/**
 * login.component.spec.ts
 *
 * Tests unitaires du composant LoginComponent avec Karma/Jasmine.
 *
 * Cas testés :
 *  ✓ Rendu du formulaire (titre, champ username, bouton)
 *  ✓ Bouton désactivé quand le formulaire est invalide (champ vide)
 *  ✓ Bouton activé quand le formulaire est valide
 *  ✓ Login réussi → stockage du token → navigation vers /tasks
 *  ✓ Login échoué → affichage du message d'erreur
 *  ✓ Redirection vers /tasks si déjà connecté (token présent)
 *  ✓ Validation isFieldInvalid() → invalid & touched
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';

import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { LoginComponent } from './login.component';
import { TaskService } from '../../core/services/task.service';

// ── Mock du TaskService (pas de vrai appel HTTP) ─────────────────────
class MockTaskService {
  login = jasmine.createSpy('login');
}

// ── Composant factice pour la route /tasks en test ───────────────────
@Component({ standalone: true, template: '<p>Tasks Page</p>' })
class FakeTasksComponent {}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockTaskService: MockTaskService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,        // Composant standalone → importé directement
        ReactiveFormsModule,
      ],
      providers: [
        { provide: TaskService, useClass: MockTaskService },
        // Définir les routes de test (login + tasks stub) pour que navigate fonctionne
        provideRouter([
          { path: 'login', component: LoginComponent },
          { path: 'tasks', component: FakeTasksComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockTaskService = TestBed.inject(TaskService) as unknown as MockTaskService;
    router = TestBed.inject(Router);

    localStorage.removeItem('token');
    fixture.detectChanges(); // Déclenche ngOnInit
  });

  afterEach(() => {
    localStorage.removeItem('token');
  });

  // ── Rendu initial ────────────────────────────────────────────────────
  describe('Rendu', () => {
    it('devrait créer le composant', () => {
      expect(component).toBeTruthy();
    });

    it('devrait afficher le titre "Connexion"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('h1')?.textContent).toContain('Connexion');
    });

    it('devrait afficher un champ username', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('#username') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.type).toBe('text');
    });

    it('devrait afficher le bouton de connexion', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const btn = compiled.querySelector('#login-submit-btn') as HTMLButtonElement;
      expect(btn).toBeTruthy();
      expect(btn.textContent).toContain('Se connecter');
    });
  });

  // ── Validation du formulaire ─────────────────────────────────────────
  describe('Validation', () => {
    it('devrait avoir le bouton désactivé quand le champ username est vide', () => {
      // Par défaut, le formulaire est invalide (champ vide)
      const btn = fixture.nativeElement.querySelector('#login-submit-btn') as HTMLButtonElement;
      expect(btn.disabled).toBeTrue();
    });

    it('devrait activer le bouton quand un username valide est saisi', () => {
      // Remplir le champ avec un username valide (>= 2 caractères)
      component.loginForm.get('username')!.setValue('alice');
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('#login-submit-btn') as HTMLButtonElement;
      expect(btn.disabled).toBeFalse();
    });

    it('devrait garder le bouton désactivé si username fait 1 seul caractère (minLength)', () => {
      component.loginForm.get('username')!.setValue('a');
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('#login-submit-btn') as HTMLButtonElement;
      expect(btn.disabled).toBeTrue();
    });
  });

  // ── Login réussi ─────────────────────────────────────────────────────
  describe('Login réussi', () => {
    it('devrait stocker le token dans localStorage après un login réussi', fakeAsync(() => {
      // ARRANGE : mock retourne un token
      mockTaskService.login.and.returnValue(of({ token: 'jwt.token.test' }));
      component.loginForm.get('username')!.setValue('alice');

      // ACT
      component.onSubmit();
      tick(); // Résout les Observables synchrones

      // ASSERT
      expect(localStorage.getItem('token')).toBe('jwt.token.test');
    }));

    it('devrait naviguer vers /tasks après un login réussi', fakeAsync(() => {
      mockTaskService.login.and.returnValue(of({ token: 'jwt.token.test' }));
      spyOn(router, 'navigate');
      component.loginForm.get('username')!.setValue('alice');

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    }));

    it('devrait appeler TaskService.login avec le bon username', fakeAsync(() => {
      mockTaskService.login.and.returnValue(of({ token: 'abc' }));
      component.loginForm.get('username')!.setValue('bob');

      component.onSubmit();
      tick();

      expect(mockTaskService.login).toHaveBeenCalledWith('bob', 'password_ignore');
    }));
  });

  // ── Login échoué ─────────────────────────────────────────────────────
  describe('Login échoué', () => {
    it('devrait afficher un message d\'erreur si le login échoue', fakeAsync(() => {
      // ARRANGE : mock retourne une erreur 401
      const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
      mockTaskService.login.and.returnValue(throwError(() => error));
      component.loginForm.get('username')!.setValue('wronguser');

      // ACT
      component.onSubmit();
      tick();
      fixture.detectChanges();

      // ASSERT
      const errorEl = fixture.nativeElement.querySelector('#login-error-message');
      expect(errorEl).toBeTruthy();
      expect(errorEl.textContent).toContain('Identifiant invalide');
    }));

    it('devrait réactiver le bouton (isLoading = false) après un échec', fakeAsync(() => {
      const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
      mockTaskService.login.and.returnValue(throwError(() => error));
      component.loginForm.get('username')!.setValue('wronguser');

      component.onSubmit();
      tick();
      fixture.detectChanges();

      expect(component.isLoading).toBeFalse();
    }));

    it('ne devrait PAS stocker de token en cas d\'échec', fakeAsync(() => {
      const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
      mockTaskService.login.and.returnValue(throwError(() => error));
      component.loginForm.get('username')!.setValue('wronguser');

      component.onSubmit();
      tick();

      expect(localStorage.getItem('token')).toBeNull();
    }));
  });

  // ── Déjà connecté ────────────────────────────────────────────────────
  describe('Redirection si déjà connecté', () => {
    it('devrait naviguer vers /tasks si un token est déjà présent au ngOnInit', fakeAsync(() => {
      localStorage.setItem('token', 'existing.token');
      spyOn(router, 'navigate');

      // Ré-initialiser le composant pour déclencher ngOnInit avec le token
      component.ngOnInit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    }));
  });

  // ── isFieldInvalid() ─────────────────────────────────────────────────
  describe('isFieldInvalid()', () => {
    it('devrait retourner false si le champ n\'a pas encore été touché', () => {
      // Le champ est invalide mais pas encore touché → pas d'erreur affichée
      expect(component.isFieldInvalid('username')).toBeFalse();
    });

    it('devrait retourner true si le champ est invalide ET touché', () => {
      const control = component.loginForm.get('username')!;
      control.markAsTouched();
      fixture.detectChanges();
      // Champ vide + touched → erreur visible
      expect(component.isFieldInvalid('username')).toBeTrue();
    });

    it('devrait retourner false si le champ est valide et touché', () => {
      const control = component.loginForm.get('username')!;
      control.setValue('alice');
      control.markAsTouched();
      expect(component.isFieldInvalid('username')).toBeFalse();
    });
  });
});
