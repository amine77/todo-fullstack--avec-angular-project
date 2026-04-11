/**
 * task-list.component.spec.ts
 *
 * Tests unitaires du composant TaskListComponent avec Karma/Jasmine.
 *
 * Cas testés :
 *  ✓ ngOnInit → appelle fetchTasks() → affiche la liste
 *  ✓ Affichage correct de la liste de tâches (titres, états)
 *  ✓ État vide → message "Aucune tâche" visible
 *  ✓ Compteur tasks complétées
 *  ✓ addTask() → crée une tâche et rafraîchit la liste
 *  ✓ addTask() → ne fait rien si le champ est vide/whitespace
 *  ✓ toggle() → appelle toggleTask(id) et rafraîchit
 *  ✓ remove() → appelle deleteTask(id) et rafraîchit
 *  ✓ logout() → supprime le token, navigue vers /login
 *  ✓ Erreur 403 sur getTasks → logout automatique
 *  ✓ Erreur 401 sur getTasks → logout automatique
 *  ✓ Erreur réseau → affiche message d'erreur
 */

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { TaskListComponent } from './task-list.component';
import { TaskService, Task } from '../../core/services/task.service';

// ── Données de test ──────────────────────────────────────────────────
const MOCK_TASKS: Task[] = [
  { id: 1, title: 'Apprendre Angular', completed: false },
  { id: 2, title: 'Écrire des tests', completed: true },
];

// ── Mock du TaskService ───────────────────────────────────────────────
class MockTaskService {
  getTasks = jasmine.createSpy('getTasks').and.returnValue(of(MOCK_TASKS));
  createTask = jasmine.createSpy('createTask').and.returnValue(
    of({ id: 3, title: 'Nouvelle tâche', completed: false })
  );
  toggleTask = jasmine.createSpy('toggleTask').and.returnValue(
    of({ id: 1, title: 'Apprendre Angular', completed: true })
  );
  deleteTask = jasmine.createSpy('deleteTask').and.returnValue(of(null));
}

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let mockTaskService: MockTaskService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskListComponent,   // Composant standalone
        FormsModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: TaskService, useClass: MockTaskService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    mockTaskService = TestBed.inject(TaskService) as unknown as MockTaskService;
    router = TestBed.inject(Router);

    localStorage.setItem('token', 'valid.jwt.token');
    fixture.detectChanges(); // Déclenche ngOnInit → fetchTasks
  });

  afterEach(() => {
    localStorage.removeItem('token');
    // Reset des spies entre chaque test
    mockTaskService.getTasks.and.returnValue(of(MOCK_TASKS));
  });

  // ── Instanciation ────────────────────────────────────────────────────
  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  // ── Chargement initial (ngOnInit) ─────────────────────────────────────
  describe('Chargement initial', () => {
    it('devrait appeler getTasks() au ngOnInit', () => {
      expect(mockTaskService.getTasks).toHaveBeenCalledTimes(1);
    });

    it('devrait peupler le signal tasks après le chargement', fakeAsync(() => {
      tick();
      expect(component.tasks().length).toBe(2);
      expect(component.tasks()[0].title).toBe('Apprendre Angular');
    }));

    it('devrait rendre les éléments de la liste dans le DOM', fakeAsync(() => {
      tick();
      fixture.detectChanges();
      const items = fixture.nativeElement.querySelectorAll('[id^="task-item-"]');
      expect(items.length).toBe(2);
    }));
  });

  // ── État vide ─────────────────────────────────────────────────────────
  describe('État vide', () => {
    it('devrait afficher le message "Aucune tâche" si la liste est vide', fakeAsync(() => {
      // Remplacer le mock pour retourner une liste vide
      mockTaskService.getTasks.and.returnValue(of([]));
      component.fetchTasks();
      tick();
      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector('#empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('Aucune tâche');
    }));

    it('ne devrait PAS afficher l\'état vide si des tâches existent', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector('#empty-state');
      expect(emptyState).toBeNull();
    }));
  });

  // ── Compteur de tâches complétées ────────────────────────────────────
  describe('completedCount', () => {
    it('devrait calculer le bon nombre de tâches complétées', fakeAsync(() => {
      tick();
      // MOCK_TASKS a 1 tâche complétée (id=2)
      expect(component.completedCount()).toBe(1);
    }));

    it('devrait retourner 0 si aucune tâche n\'est complétée', fakeAsync(() => {
      const noCompletedTasks: Task[] = [
        { id: 1, title: 'A faire', completed: false },
        { id: 2, title: 'Aussi à faire', completed: false },
      ];
      mockTaskService.getTasks.and.returnValue(of(noCompletedTasks));
      component.fetchTasks();
      tick();

      expect(component.completedCount()).toBe(0);
    }));
  });

  // ── addTask() ─────────────────────────────────────────────────────────
  describe('addTask()', () => {
    it('devrait appeler createTask() avec le titre saisi', fakeAsync(() => {
      component.newTaskTitle = 'Nouvelle tâche Test';
      component.addTask();
      tick();

      expect(mockTaskService.createTask).toHaveBeenCalledWith('Nouvelle tâche Test');
    }));

    it('devrait rafraîchir la liste après ajout', fakeAsync(() => {
      component.newTaskTitle = 'Tâche refresh';
      component.addTask();
      tick();

      // getTasks a été appelé une 2e fois (après ngOnInit)
      expect(mockTaskService.getTasks).toHaveBeenCalledTimes(2);
    }));

    it('devrait vider le champ newTaskTitle après ajout réussi', fakeAsync(() => {
      component.newTaskTitle = 'Tâche à vider';
      component.addTask();
      tick();

      expect(component.newTaskTitle).toBe('');
    }));

    it('ne devrait PAS appeler createTask() si le titre est vide', fakeAsync(() => {
      component.newTaskTitle = '';
      component.addTask();
      tick();

      expect(mockTaskService.createTask).not.toHaveBeenCalled();
    }));

    it('ne devrait PAS appeler createTask() si le titre est seulement des espaces', fakeAsync(() => {
      component.newTaskTitle = '   ';
      component.addTask();
      tick();

      expect(mockTaskService.createTask).not.toHaveBeenCalled();
    }));

    it('devrait afficher une erreur si createTask() échoue', fakeAsync(() => {
      mockTaskService.createTask.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 500 }))
      );
      component.newTaskTitle = 'Tâche problème';
      component.addTask();
      tick();
      fixture.detectChanges();

      expect(component.errorMessage()).toContain('Impossible d\'ajouter');
    }));
  });

  // ── toggle() ──────────────────────────────────────────────────────────
  describe('toggle()', () => {
    it('devrait appeler toggleTask() avec le bon id', fakeAsync(() => {
      component.toggle(1);
      tick();

      expect(mockTaskService.toggleTask).toHaveBeenCalledWith(1);
    }));

    it('devrait rafraîchir la liste après toggle', fakeAsync(() => {
      component.toggle(1);
      tick();

      // Appel initial (ngOnInit) + après toggle = 2 appels
      expect(mockTaskService.getTasks).toHaveBeenCalledTimes(2);
    }));

    it('devrait afficher une erreur si toggleTask() échoue', fakeAsync(() => {
      mockTaskService.toggleTask.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 500 }))
      );
      component.toggle(1);
      tick();
      fixture.detectChanges();

      expect(component.errorMessage()).toContain('Impossible de mettre à jour');
    }));
  });

  // ── remove() ──────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('devrait appeler deleteTask() avec le bon id', fakeAsync(() => {
      component.remove(2);
      tick();

      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(2);
    }));

    it('devrait rafraîchir la liste après suppression', fakeAsync(() => {
      component.remove(2);
      tick();

      expect(mockTaskService.getTasks).toHaveBeenCalledTimes(2);
    }));

    it('devrait afficher une erreur si deleteTask() échoue', fakeAsync(() => {
      mockTaskService.deleteTask.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 500 }))
      );
      component.remove(1);
      tick();
      fixture.detectChanges();

      expect(component.errorMessage()).toContain('Impossible de supprimer');
    }));
  });

  // ── logout() ──────────────────────────────────────────────────────────
  describe('logout()', () => {
    it('devrait supprimer le token du localStorage', () => {
      localStorage.setItem('token', 'some.jwt.token');
      component.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('devrait vider le signal tasks', () => {
      component.logout();
      expect(component.tasks()).toEqual([]);
    });

    it('devrait naviguer vers /login', () => {
      spyOn(router, 'navigate');
      component.logout();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  // ── Gestion des erreurs HTTP ────────────────────────────────────────
  describe('Gestion des erreurs HTTP', () => {
    it('devrait appeler logout() automatiquement si getTasks() retourne 403', fakeAsync(() => {
      mockTaskService.getTasks.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 403, statusText: 'Forbidden' }))
      );
      spyOn(component, 'logout');

      component.fetchTasks();
      tick();

      expect(component.logout).toHaveBeenCalled();
    }));

    it('devrait appeler logout() automatiquement si getTasks() retourne 401', fakeAsync(() => {
      mockTaskService.getTasks.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }))
      );
      spyOn(component, 'logout');

      component.fetchTasks();
      tick();

      expect(component.logout).toHaveBeenCalled();
    }));

    it('devrait afficher un message d\'erreur pour les erreurs non-auth (500)', fakeAsync(() => {
      mockTaskService.getTasks.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' }))
      );

      component.fetchTasks();
      tick();
      fixture.detectChanges();

      expect(component.errorMessage()).toContain('Impossible de charger');
    }));

    it('devrait afficher le message d\'erreur dans le DOM', fakeAsync(() => {
      mockTaskService.getTasks.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 500 }))
      );

      component.fetchTasks();
      tick();
      fixture.detectChanges();

      const errorEl = fixture.nativeElement.querySelector('#tasks-error-message');
      expect(errorEl).toBeTruthy();
    }));
  });
});
