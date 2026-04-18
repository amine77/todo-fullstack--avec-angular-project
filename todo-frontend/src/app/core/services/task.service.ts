/**
 * task.service.ts
 *
 * Service central de l'application Todo.
 * Responsable de TOUTES les communications HTTP avec le backend Spring Boot.
 *
 * Architecture :
 *  - Utilise HttpClient d'Angular (injecté via inject())
 *  - Le Token JWT est ajouté automatiquement par authInterceptor (voir auth.interceptor.ts)
 *  - Toutes les méthodes retournent des Observable<T> pour une intégration
 *    réactive avec les composants Angular (Signals, async pipe, etc.)
 *
 * URL de base : http://localhost:8080/api (configurable via environment)
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Modèle de données d'une tâche (miroir du DTO backend) */
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

/** Réponse renvoyée par le endpoint /auth/login */
export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root', // Singleton disponible dans toute l'application
})
export class TaskService {
  /** 
   * URL de base de l'API REST du backend Spring Boot.
   * ⚠️ IMPORTANT POUR LE DEPLOIEMENT (Render.com) :
   * En local, gardez 'http://localhost:8080/api'.
   * En production, remplacez par l'URL de votre Web Service Backend métier (ex: 'https://todo-backend-xxx.onrender.com/api').
   */
  private readonly apiUrl = 'http://localhost:8080/api';

  /** HttpClient injecté via la nouvelle API inject() d'Angular */
  private readonly http = inject(HttpClient);

  // ─────────────────────────────────────────────
  //  AUTHENTIFICATION
  // ─────────────────────────────────────────────

  /**
   * Authentifie un utilisateur et retourne un JWT.
   *
   * POST /api/auth/login
   * Body : { username: string, password: string }
   *
   * Le token retourné doit être stocké dans localStorage par le composant appelant.
   * Il sera ensuite automatiquement attaché à chaque requête par authInterceptor.
   *
   * @param username - Identifiant de l'utilisateur
   * @param password - Mot de passe (simplifié dans cet exemple)
   * @returns Observable contenant { token: string }
   */
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      username,
      password,
    });
  }

  // ─────────────────────────────────────────────
  //  GESTION DES TÂCHES
  // ─────────────────────────────────────────────

  /**
   * Récupère la liste complète des tâches de l'utilisateur connecté.
   *
   * GET /api/tasks
   * Requiert : Authorization header (géré par l'intercepteur JWT)
   *
   * Le backend peut servir depuis le cache Redis si disponible.
   *
   * @returns Observable contenant un tableau de Task[]
   */
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }

  /**
   * Crée une nouvelle tâche avec le titre fourni.
   *
   * POST /api/tasks
   * Content-Type: text/plain (le backend attend le titre en plain text)
   *
   * La création invalide le cache Redis côté backend,
   * forçant un rechargement depuis PostgreSQL au prochain getTasks().
   *
   * @param title - Titre de la tâche à créer
   * @returns Observable contenant la Task créée (avec son id généré)
   */
  createTask(title: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, title, {
      headers: new HttpHeaders({ 'Content-Type': 'text/plain' }),
    });
  }

  /**
   * Inverse l'état completed/non-completed d'une tâche.
   *
   * PUT /api/tasks/{id}/toggle
   * Requiert : Authorization header
   *
   * @param id - Identifiant unique de la tâche à basculer
   * @returns Observable contenant la Task mise à jour
   */
  toggleTask(id: number): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}/toggle`, null);
  }

  /**
   * Supprime définitivement une tâche par son identifiant.
   *
   * DELETE /api/tasks/{id}
   * Requiert : Authorization header
   *
   * @param id - Identifiant unique de la tâche à supprimer
   * @returns Observable void (pas de corps de réponse en cas de succès)
   */
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`);
  }
}
