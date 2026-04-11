package com.example.todo.domain.service;

import com.example.todo.domain.model.Task;
import com.example.todo.domain.ports.TaskRepository;
import java.util.List;
import java.util.UUID;

public class TaskService {
    
    private final TaskRepository taskRepository;

    // Pas d'annotation @Autowired ici, l'injection se fait par le constructeur
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Task createNewTask(String title, String userId) {
        Task newTask = new Task(UUID.randomUUID(), title, false, userId);
        return taskRepository.save(newTask);
    }

    public List<Task> getTasksForUser(String userId) {
        return taskRepository.findAllByUserId(userId);
    }

    public Task toggleTask(UUID taskId, String userId) {
        return taskRepository.findById(taskId)
                .filter(task -> task.userId().equals(userId))
                .map(Task::toggle)
                .map(taskRepository::save)
                .orElseThrow(() -> new IllegalArgumentException("Tâche introuvable ou non autorisée"));
    }

    public void deleteTask(UUID taskId, String userId) {
        taskRepository.findById(taskId)
                .filter(task -> task.userId().equals(userId))
                .ifPresentOrElse(
                        taskRepository::delete,
                        () -> { throw new IllegalArgumentException("Tâche introuvable ou non autorisée"); }
                );
    }
}