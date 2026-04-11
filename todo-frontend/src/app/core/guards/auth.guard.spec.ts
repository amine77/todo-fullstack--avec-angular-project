/**
 * auth.guard.spec.ts
 *
 * Tests unitaires du AuthGuard (CanActivateFn).
 *
 * Cas testés :
 *  ✓ Token présent dans localStorage → accès autorisé (retourne true)
 *  ✓ Token absent               → redirection vers /login (retourne UrlTree)
 *  ✓ Token vide string          → redirection vers /login
 */

import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { authGuard } from './auth.guard';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

/** Helper pour exécuter le guard dans le contexte TestBed */
const runGuard = () =>
  TestBed.runInInjectionContext(() =>
    authGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot
    )
  );

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
    });
    router = TestBed.inject(Router);
    localStorage.removeItem('token');
  });

  afterEach(() => {
    localStorage.removeItem('token');
  });

  // ── Token présent → accès autorisé ─────────────────────────────────
  it('devrait retourner true si un token JWT est présent dans localStorage', () => {
    // ARRANGE : simuler un utilisateur connecté
    localStorage.setItem('token', 'valid.jwt.token');

    // ACT
    const result = runGuard();

    // ASSERT
    expect(result).toBeTrue();
  });

  // ── Token absent → redirection vers /login ──────────────────────────
  it('devrait rediriger vers /login si aucun token n\'est présent', () => {
    // ARRANGE : aucun token → utilisateur non connecté
    localStorage.removeItem('token');

    // ACT
    const result = runGuard();

    // ASSERT : le guard doit retourner un UrlTree (redirection Angular)
    expect(result).toBeInstanceOf(UrlTree);
    if (result instanceof UrlTree) {
      // Vérifie que la redirection pointe bien vers /login
      expect(result.toString()).toContain('/login');
    }
  });

  // ── Cas limite : token vide ────────────────────────────────────────
  it('devrait rediriger vers /login si le token est une chaîne vide', () => {
    // Un token vide ne doit pas être considéré comme valide
    localStorage.setItem('token', '');

    const result = runGuard();

    // localStorage.getItem('token') retourne '' qui est falsy → redirection
    expect(result).toBeInstanceOf(UrlTree);
  });

  // ── Vérification de la navigatino via Router ────────────────────────
  it('devrait utiliser router.createUrlTree(["/login"]) pour la redirection', () => {
    localStorage.removeItem('token');
    spyOn(router, 'createUrlTree').and.callThrough();

    runGuard();

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
