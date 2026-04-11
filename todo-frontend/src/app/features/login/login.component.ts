/**
 * login.component.ts
 *
 * Composant de connexion — Route publique /login
 *
 * Fonctionnalités :
 *  - Formulaire Reactive Form avec validation (champ obligatoire)
 *  - Appel à TaskService.login() pour authentifier via le backend
 *  - Stockage du JWT retourné dans localStorage
 *  - Navigation automatique vers /tasks après login réussi
 *  - Affichage d'un message d'erreur sur échec
 *  - Désactivation du bouton pendant l'appel HTTP (état "loading")
 *
 * Design : Bootstrap 5 + styles premium-card définis dans styles.css
 *
 * Flux d'authentification :
 *  Formulaire → TaskService.login() → POST /api/auth/login
 *    ↓ succès : token JWT → localStorage → navigate('/tasks')
 *    ↓ erreur  : affichage message d'erreur → formulaire réactivé
 */

import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,       // *ngIf, *ngFor, async pipe
    ReactiveFormsModule // formGroup, formControlName
  ],
  template: `
    <!-- Conteneur centré verticalement sur toute la hauteur de l'écran -->
    <div class="container d-flex align-items-center justify-content-center min-vh-100">
      <div class="card premium-card p-5" style="max-width: 400px; width: 100%;">

        <!-- En-tête du formulaire -->
        <div class="text-center mb-4">
          <i class="bi bi-check2-square fs-1 text-primary mb-2 d-block"></i>
          <h1 class="fw-bold h3">Connexion</h1>
          <p class="text-muted mb-0">Accédez à votre espace Todo</p>
        </div>

        <!-- Formulaire de connexion (Reactive Form) -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>

          <!-- Champ Nom d'utilisateur -->
          <div class="mb-4">
            <label for="username" class="form-label fw-medium">
              Nom d'utilisateur
            </label>
            <div class="input-group">
              <span class="input-group-text bg-white">
                <i class="bi bi-person text-muted"></i>
              </span>
              <input
                id="username"
                type="text"
                formControlName="username"
                class="form-control border-start-0 ps-0"
                [class.is-invalid]="isFieldInvalid('username')"
                placeholder="Votre identifiant"
                autocomplete="username"
              />
              <!-- Message de validation inline -->
              @if (isFieldInvalid('username')) {
                <div class="invalid-feedback">
                  Le nom d'utilisateur est requis.
                </div>
              }
            </div>
          </div>

          <!-- Message d'erreur de connexion (affiché si login échoue) -->
          @if (errorMessage) {
            <div class="alert alert-danger alert-form-error" role="alert" id="login-error-message">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ errorMessage }}
            </div>
          }

          <!-- Bouton de soumission — désactivé si formulaire invalide ou chargement -->
          <button
            id="login-submit-btn"
            type="submit"
            class="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
            [disabled]="loginForm.invalid || isLoading"
          >
            @if (isLoading) {
              <!-- Spinner Bootstrap pendant l'appel HTTP -->
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Connexion en cours...
            } @else {
              <i class="bi bi-box-arrow-in-right me-2"></i>
              Se connecter
            }
          </button>

        </form>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  // ── Injections ────────────────────────────────────────────────
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  // ── État du composant ─────────────────────────────────────────

  /** Reactive Form du formulaire de connexion */
  loginForm!: FormGroup;

  /** true pendant l'appel HTTP → désactive le bouton et affiche le spinner */
  isLoading = false;

  /** Message d'erreur affiché en cas d'échec de connexion */
  errorMessage = '';

  // ── Cycle de vie ──────────────────────────────────────────────

  ngOnInit(): void {
    // Initialisation du formulaire avec validation.
    // Seul le username est demandé dans cette implémentation simplifiée.
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(2)]],
    });

    // Si un token existe déjà → l'utilisateur est déjà connecté,
    // on le redirige directement vers la liste des tâches.
    if (localStorage.getItem('token')) {
      this.router.navigate(['/tasks']);
    }
  }

  // ── Actions ───────────────────────────────────────────────────

  /**
   * Soumission du formulaire de connexion.
   *
   * Flux :
   *  1. Valide le formulaire (protection double avec le disabled du bouton)
   *  2. Active l'état "loading"
   *  3. Appelle TaskService.login()
   *  4. Sur succès : stocke le token et navigue vers /tasks
   *  5. Sur erreur : affiche un message et désactive le loading
   */
  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { username } = this.loginForm.value;

    // Le mot de passe est simplifié dans cette version de démonstration
    this.taskService.login(username, 'password_ignore').subscribe({
      next: (response) => {
        // Stockage du JWT pour les futures requêtes (lu par authInterceptor)
        localStorage.setItem('token', response.token);
        // Navigation vers la page principale protégée
        this.router.navigate(['/tasks']);
      },
      error: () => {
        // Affichage d'un message d'erreur générique (ne pas exposer les détails)
        this.errorMessage = 'Identifiant invalide. Veuillez réessayer.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Vérifie si un champ est invalide ET a été touché (pour l'UX).
   * Évite d'afficher des erreurs avant que l'utilisateur ait interagi.
   *
   * @param controlName - Nom du FormControl à vérifier
   */
  isFieldInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
