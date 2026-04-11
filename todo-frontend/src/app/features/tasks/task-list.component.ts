/**
 * task-list.component.ts
 *
 * Composant principal de la liste de tâches — Route privée /tasks
 *
 * Fonctionnalités :
 *  - Chargement des tâches au démarrage (OnInit)
 *  - Ajout d'une nouvelle tâche via formulaire
 *  - Toggle completed/non-completed
 *  - Suppression d'une tâche
 *  - Déconnexion (supprime le JWT et redirige vers /login)
 *  - Gestion des erreurs 403 → déconnexion automatique
 *  - Affichage d'un état vide quand aucune tâche n'existe
 *
 * Gestion d'état :
 *  Utilise les Angular Signals (signal(), computed()) introduits en Angular 16+.
 *  Les signals sont des primitives réactives qui déclenchent automatiquement
 *  la mise à jour du DOM sans nécessiter de subscribe() manuel.
 *
 *  Avantages vs observables dans les templates :
 *  - Pas besoin du pipe async
 *  - Détection de changement plus fine (sans Zone.js)
 *  - Lecture directe dans le template : tasks() au lieu de tasks | async
 *
 * Design : Bootstrap 5 + styles custom (styles.css)
 */

import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskService, Task } from '../../core/services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, // NgClass, NgStyle
    FormsModule,  // [(ngModel)] pour l'input de nouvelle tâche
  ],
  template: `
    <!-- Conteneur Bootstrap centré -->
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card premium-card p-4">

            <!-- ── En-tête : titre + bouton déconnexion ────────── -->
            <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <h1 class="fw-bold mb-0 text-dark h4">
                <i class="bi bi-card-checklist me-2 text-primary"></i>
                Ma Todo List
              </h1>
              <!-- Déconnexion → supprime le token et navigue vers /login -->
              <button
                id="logout-btn"
                (click)="logout()"
                class="btn btn-outline-danger btn-sm rounded-pill px-3 shadow-sm"
              >
                <i class="bi bi-box-arrow-right me-1"></i>
                Déconnexion
              </button>
            </div>

            <!-- ── Spinner de chargement initial ──────────────── -->
            @if (isLoading()) {
              <div class="loading-wrapper">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Chargement...</span>
                </div>
              </div>
            }

            <!-- ── Message d'erreur global ─────────────────────── -->
            @if (errorMessage()) {
              <div class="alert alert-warning d-flex align-items-center mb-3" role="alert" id="tasks-error-message">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{ errorMessage() }}
              </div>
            }

            <!-- ── Formulaire d'ajout de tâche ────────────────── -->
            <form (ngSubmit)="addTask()" class="mb-4" #addForm="ngForm">
              <div class="input-group input-group-lg shadow-sm">
                <input
                  id="new-task-input"
                  type="text"
                  [(ngModel)]="newTaskTitle"
                  name="newTaskTitle"
                  class="form-control"
                  placeholder="Que voulez-vous faire aujourd'hui ?"
                  aria-label="Nouvelle tâche"
                  [disabled]="isSubmitting()"
                />
                <!-- Le bouton est désactivé si le champ est vide ou en cours d'envoi -->
                <button
                  id="add-task-btn"
                  class="btn btn-primary px-4"
                  type="submit"
                  [disabled]="!newTaskTitle.trim() || isSubmitting()"
                >
                  @if (isSubmitting()) {
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                  } @else {
                    <i class="bi bi-plus-lg"></i>
                  }
                </button>
              </div>
            </form>

            <!-- ── Compteur de tâches ──────────────────────────── -->
            @if (!isLoading() && tasks().length > 0) {
              <p class="text-muted small mb-2">
                {{ completedCount() }} / {{ tasks().length }} tâche(s) complétée(s)
              </p>
            }

            <!-- ── Liste des tâches ────────────────────────────── -->
            <ul class="list-group list-group-flush mb-0">

              <!-- État vide : aucune tâche à afficher -->
              @if (!isLoading() && tasks().length === 0) {
                <div class="text-center text-muted py-4" id="empty-state">
                  <i class="bi bi-inbox fs-1 d-block mb-3 text-opacity-50"></i>
                  <p class="mb-0">Aucune tâche pour le moment. Ajoutez-en une !</p>
                </div>
              }

              <!-- @for remplace *ngFor — syntaxe Angular 17+ avec track obligatoire -->
              @for (task of tasks(); track task.id) {
                <li
                  [id]="'task-item-' + task.id"
                  class="list-group-item px-3 py-3 rounded mb-2 border d-flex justify-content-between align-items-center"
                  [class.task-completed]="task.completed"
                  [class.task-item]="!task.completed"
                >
                  <!-- Checkbox + titre de la tâche -->
                  <div class="d-flex align-items-center flex-grow-1"
                       (click)="toggle(task.id)"
                       style="cursor: pointer;">
                    <input
                      class="form-check-input me-3 border-secondary"
                      type="checkbox"
                      [checked]="task.completed"
                      [attr.aria-label]="'Marquer comme ' + (task.completed ? 'non complétée' : 'complétée')"
                      (click)="$event.stopPropagation()"
                      (change)="toggle(task.id)"
                      readonly
                    />
                    <span
                      class="fw-medium"
                      [class.text-muted]="task.completed"
                      [class.text-dark]="!task.completed"
                    >
                      {{ task.title }}
                    </span>
                  </div>

                  <!-- Bouton de suppression -->
                  <button
                    [id]="'delete-task-' + task.id"
                    (click)="remove(task.id)"
                    class="btn btn-sm btn-outline-danger border-0"
                    [title]="'Supprimer : ' + task.title"
                  >
                    <i class="bi bi-trash3"></i>
                  </button>
                </li>
              }
            </ul>

          </div>
        </div>
      </div>
    </div>
  `,
})
export class TaskListComponent implements OnInit {
  // ── Injections ────────────────────────────────────────────────
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  // ── État réactif avec Signals ─────────────────────────────────

  /**
   * Signal contenant la liste des tâches.
   * Chaque mise à jour de ce signal déclenche automatiquement
   * le re-render du template (sans Zone.js ou ChangeDetectorRef).
   */
  tasks = signal<Task[]>([]);

  /** Signal indiquant si le chargement initial est en cours */
  isLoading = signal(false);

  /** Signal indiquant si une soumission (ajout) est en cours */
  isSubmitting = signal(false);

  /** Signal pour le message d'erreur affiché dans le template */
  errorMessage = signal('');

  /**
   * Computed Signal : calcule automatiquement le nombre de tâches complétées.
   * Recalculé uniquement quand tasks() change (memoïsé).
   */
  completedCount = computed(() => this.tasks().filter((t) => t.completed).length);

  // ── État du formulaire (simple binding ngModel) ───────────────

  /** Modèle two-way binding pour l'input de création de tâche */
  newTaskTitle = '';

  // ── Cycle de vie ──────────────────────────────────────────────

  /**
   * Chargement initial des tâches dès que le composant est initialisé.
   * Angular appelle ngOnInit() après le premier rendu du template.
   */
  ngOnInit(): void {
    this.fetchTasks();
  }

  // ── Méthodes privées ──────────────────────────────────────────

  /**
   * Récupère toutes les tâches depuis le backend et met à jour le signal.
   *
   * En cas d'erreur 403 (token expiré ou invalide) → déconnexion automatique.
   * Autres erreurs → message affiché dans le template.
   */
  fetchTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.taskService.getTasks().subscribe({
      next: (data) => {
        // Mise à jour du signal → Angular met automatiquement à jour le template
        this.tasks.set(data);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 403 || err.status === 401) {
          // Token invalide ou expiré → déconnexion forcée
          this.logout();
        } else {
          this.errorMessage.set('Impossible de charger les tâches. Réessayez.');
        }
      },
    });
  }

  // ── Actions utilisateur ───────────────────────────────────────

  /**
   * Ajoute une nouvelle tâche.
   * Désactive le formulaire pendant l'appel HTTP (isSubmitting),
   * puis rafraîchit la liste et vide le champ.
   */
  addTask(): void {
    const title = this.newTaskTitle.trim();
    if (!title) return;

    this.isSubmitting.set(true);

    this.taskService.createTask(title).subscribe({
      next: () => {
        this.newTaskTitle = '';
        this.isSubmitting.set(false);
        // Rechargement de la liste (invalide aussi le cache Redis côté backend)
        this.fetchTasks();
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Impossible d\'ajouter la tâche. Réessayez.');
      },
    });
  }

  /**
   * Bascule l'état completed d'une tâche.
   * Mise à jour optimiste possible ici, mais on préfère rafraîchir
   * depuis le serveur pour rester cohérent avec la source de vérité.
   *
   * @param id - ID de la tâche à basculer
   */
  toggle(id: number): void {
    this.taskService.toggleTask(id).subscribe({
      next: () => this.fetchTasks(),
      error: () => this.errorMessage.set('Impossible de mettre à jour la tâche.'),
    });
  }

  /**
   * Supprime définitivement une tâche.
   *
   * @param id - ID de la tâche à supprimer
   */
  remove(id: number): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => this.fetchTasks(),
      error: () => this.errorMessage.set('Impossible de supprimer la tâche.'),
    });
  }

  /**
   * Déconnexion de l'utilisateur.
   *
   * Flux :
   *  1. Suppression du JWT du localStorage
   *  2. Vidage du signal tasks (pour éviter un flash de données à la reconnexion)
   *  3. Navigation vers /login
   */
  logout(): void {
    localStorage.removeItem('token');
    this.tasks.set([]);
    this.router.navigate(['/login']);
  }
}
