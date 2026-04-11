package com.example.todo.application.web;

import com.example.todo.domain.model.Task;
import com.example.todo.domain.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Adaptateur (Infrastructure) : Point d'entrée Web / API REST.
 * Reçoit les requêtes HTTP (Postman/Navigateur), extrait l'identité de l'utilisateur
 * et délègue l'effort au composant central (TaskService).
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Traite POST /api/tasks pour la création d'une tâche.
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody String title) {
        // On récupère l'ID utilisateur (username) sécurisé et validé, injecté par notre JwtAuthenticationFilter
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        
        Task newTask = taskService.createNewTask(title, userId);
        return ResponseEntity.ok(newTask);
    }

    /**
     * Traite GET /api/tasks pour la lecture des tâches.
     */
    @GetMapping
    public ResponseEntity<List<Task>> getMyTasks() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        // L'appel au service métier renverra la liste (probablement depuis le cache Redis s'il est chaud)
        return ResponseEntity.ok(taskService.getTasksForUser(userId));
    }

    /**
     * Traite PUT /api/tasks/{id}/toggle pour inverser l'état (case à cocher).
     */
    @PutMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTask(@PathVariable java.util.UUID id) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(taskService.toggleTask(id, userId));
    }

    /**
     * Traite DELETE /api/tasks/{id} pour l'enlèvement définitif d'une tâche.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable java.util.UUID id) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        taskService.deleteTask(id, userId);
        // "No Content" (204) est la bonne pratique REST quand une suppression réussit.
        return ResponseEntity.noContent().build();
    }
}