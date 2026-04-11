package com.example.todo.domain.service;

import com.example.todo.domain.model.Task;
import com.example.todo.domain.model.TaskEvent;
import com.example.todo.domain.ports.AuditPublisher;
import com.example.todo.domain.ports.TaskRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class TaskService {
    
    private final TaskRepository taskRepository;
    private final AuditPublisher auditPublisher;

    public TaskService(TaskRepository taskRepository, AuditPublisher auditPublisher) {
        this.taskRepository = taskRepository;
        this.auditPublisher = auditPublisher;
    }

    public Task createNewTask(String title, String userId) {
        Task newTask = new Task(UUID.randomUUID(), title, false, userId);
        Task savedTask = taskRepository.save(newTask);
        
        auditPublisher.publish(new TaskEvent("CREATED", savedTask.id().toString(), userId, title, LocalDateTime.now()));
        return savedTask;
    }

    public List<Task> getTasksForUser(String userId) {
        return taskRepository.findAllByUserId(userId);
    }

    public Task toggleTask(UUID taskId, String userId) {
        return taskRepository.findById(taskId)
                .filter(task -> task.userId().equals(userId))
                .map(Task::toggle)
                .map(task -> {
                    Task savedTask = taskRepository.save(task);
                    auditPublisher.publish(new TaskEvent("TOGGLED", savedTask.id().toString(), userId, savedTask.title(), LocalDateTime.now()));
                    return savedTask;
                })
                .orElseThrow(() -> new IllegalArgumentException("Tâche introuvable ou non autorisée"));
    }

    public void deleteTask(UUID taskId, String userId) {
        taskRepository.findById(taskId)
                .filter(task -> task.userId().equals(userId))
                .ifPresentOrElse(
                        task -> {
                            taskRepository.delete(task);
                            auditPublisher.publish(new TaskEvent("DELETED", task.id().toString(), userId, task.title(), LocalDateTime.now()));
                        },
                        () -> { throw new IllegalArgumentException("Tâche introuvable ou non autorisée"); }
                );
    }
}