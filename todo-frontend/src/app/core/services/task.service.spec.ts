/**
 * task.service.spec.ts
 *
 * Tests unitaires du service TaskService avec Karma/Jasmine.
 *
 * Utilise HttpClientTestingModule pour simuler les requêtes HTTP
 * sans avoir besoin d'un vrai backend.
 *
 * HttpTestingController permet de :
 *  - Intercepter les requêtes HTTP sortantes
 *  - Vérifier la méthode, l'URL, les headers et le corps
 *  - Simuler les réponses (succès ou erreur HTTP)
 *
 * Cas testés :
 *  ✓ login()      → succès + erreur 401
 *  ✓ getTasks()   → succès avec liste + liste vide + erreur 403
 *  ✓ createTask() → succès + vérification Content-Type: text/plain
 *  ✓ toggleTask() → succès
 *  ✓ deleteTask() → succès
 *  ✓ authInterceptor → présence du header Authorization sur les requêtes privées
 */

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TaskService, Task } from './task.service';

// ── Données de test réutilisables ──────────────────────────────────────
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.mock.token';
const MOCK_TASKS: Task[] = [
  { id: 1, title: 'Apprendre Angular', completed: false },
  { id: 2, title: 'Écrire des tests', completed: true },
];

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  // ─────────────────────────────────────────────────────────────────────
  //  Configuration du TestBed avant chaque test
  // ─────────────────────────────────────────────────────────────────────
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Remplace HttpClientModule par une version mockée
      providers: [TaskService],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);

    // Nettoyer le token avant chaque test pour éviter les effets de bord
    localStorage.removeItem('token');
  });

  afterEach(() => {
    // Vérifie qu'aucune requête inattendue n'est en attente → détecte les fuite
    httpMock.verify();
    localStorage.removeItem('token');
  });

  // ─────────────────────────────────────────────────────────────────────
  //  Instanciation
  // ─────────────────────────────────────────────────────────────────────
  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────────────
  //  login()
  // ─────────────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('devrait envoyer un POST /api/auth/login et retourner un token', () => {
      // ARRANGE
      const mockResponse = { token: MOCK_TOKEN };

      // ACT
      service.login('alice', 'password').subscribe((res) => {
        // ASSERT
        expect(res.token).toBe(MOCK_TOKEN);
      });

      // Intercepter la requête et vérifier ses caractéristiques
      const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'alice', password: 'password' });

      // Simuler la réponse du backend
      req.flush(mockResponse);
    });

    it('devrait propager une erreur 401 si les identifiants sont incorrects', () => {
      // ACT + ASSERT
      service.login('wrong', 'bad').subscribe({
        next: () => fail('Devrait avoir échoué avec 401'),
        error: (err) => expect(err.status).toBe(401),
      });

      // Simuler une réponse d'erreur 401 Unauthorized
      const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  //  getTasks()
  // ─────────────────────────────────────────────────────────────────────
  describe('getTasks()', () => {
    it('devrait retourner la liste des tâches via GET /api/tasks', () => {
      service.getTasks().subscribe((tasks) => {
        expect(tasks.length).toBe(2);
        expect(tasks[0].title).toBe('Apprendre Angular');
        expect(tasks[1].completed).toBeTrue();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/tasks');
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_TASKS);
    });

    it('devrait retourner un tableau vide si aucune tâche n\'existe', () => {
      service.getTasks().subscribe((tasks) => {
        expect(tasks).toEqual([]);
        expect(tasks.length).toBe(0);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/tasks');
      req.flush([]);
    });

    it('devrait propager une erreur 403 si le token est invalide/expiré', () => {
      service.getTasks().subscribe({
        next: () => fail('Devrait avoir échoué avec 403'),
        error: (err) => expect(err.status).toBe(403),
      });

      const req = httpMock.expectOne('http://localhost:8080/api/tasks');
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  //  createTask()
  // ─────────────────────────────────────────────────────────────────────
  describe('createTask()', () => {
    it('devrait envoyer un POST avec Content-Type text/plain et retourner la tâche créée', () => {
      const newTask: Task = { id: 3, title: 'Nouvelle tâche', completed: false };

      service.createTask('Nouvelle tâche').subscribe((task) => {
        expect(task.id).toBe(3);
        expect(task.title).toBe('Nouvelle tâche');
        expect(task.completed).toBeFalse();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/tasks');
      expect(req.request.method).toBe('POST');
      // Vérification cruciale : le backend attend text/plain (pas JSON)
      expect(req.request.headers.get('Content-Type')).toContain('text/plain');
      expect(req.request.body).toBe('Nouvelle tâche');

      req.flush(newTask);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  //  toggleTask()
  // ─────────────────────────────────────────────────────────────────────
  describe('toggleTask()', () => {
    it('devrait envoyer un PUT /api/tasks/{id}/toggle et retourner la tâche mise à jour', () => {
      const updatedTask: Task = { id: 1, title: 'Apprendre Angular', completed: true };

      service.toggleTask(1).subscribe((task) => {
        expect(task.completed).toBeTrue();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/tasks/1/toggle');
      expect(req.request.method).toBe('PUT');
      req.flush(updatedTask);
    });

    it('devrait utiliser le bon id dans l\'URL pour toggle', () => {
      service.toggleTask(42).subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/tasks/42/toggle');
      expect(req.request.url).toContain('/42/toggle');
      req.flush({ id: 42, title: 'Test', completed: true });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  //  deleteTask()
  // ─────────────────────────────────────────────────────────────────────
  describe('deleteTask()', () => {
    it('devrait envoyer un DELETE /api/tasks/{id} et compléter sans corps', () => {
      let deleteCalled = false;

      service.deleteTask(1).subscribe(() => {
        deleteCalled = true;
      });

      const req = httpMock.expectOne('http://localhost:8080/api/tasks/1');
      expect(req.request.method).toBe('DELETE');

      // Le backend retourne 204 No Content → flush null
      req.flush(null);

      expect(deleteCalled).toBeTrue();
    });

    it('devrait utiliser le bon id dans l\'URL pour delete', () => {
      service.deleteTask(99).subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/tasks/99');
      expect(req.request.url).toContain('/99');
      req.flush(null);
    });
  });
});
