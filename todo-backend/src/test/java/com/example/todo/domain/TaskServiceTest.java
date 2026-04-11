package com.example.todo.domain;

import com.example.todo.domain.model.Task;
import com.example.todo.domain.ports.AuditPublisher;
import com.example.todo.domain.ports.TaskRepository;
import com.example.todo.domain.service.TaskService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class TaskServiceTest {

    private TaskRepository repository;
    private AuditPublisher auditPublisher;
    private TaskService service;

    @BeforeEach
    void setUp() {
        repository = mock(TaskRepository.class);
        auditPublisher = mock(AuditPublisher.class);
        service = new TaskService(repository, auditPublisher);
    }

    @Test
    void should_create_task_with_valid_data() {
        String title = "Finir le projet Fullstack";
        String userId = "user-1";
        
        Task mockTask = new Task(UUID.randomUUID(), title, false, userId);
        when(repository.save(any(Task.class))).thenReturn(mockTask);
        
        service.createNewTask(title, userId);

        verify(repository, times(1)).save(any(Task.class));
        verify(auditPublisher, times(1)).publish(any());
    }

    @Test
    void should_toggle_task() {
        UUID taskId = UUID.randomUUID();
        String userId = "user-1";
        Task existingTask = new Task(taskId, "Test Task", false, userId);
        Task toggledTask = new Task(taskId, "Test Task", true, userId);

        when(repository.findById(taskId)).thenReturn(Optional.of(existingTask));
        when(repository.save(any(Task.class))).thenReturn(toggledTask);

        Task result = service.toggleTask(taskId, userId);

        assertTrue(result.completed());
        verify(repository, times(1)).save(any(Task.class));
        verify(auditPublisher, times(1)).publish(argThat(event -> "TOGGLED".equals(event.action())));
    }

    @Test
    void should_delete_task() {
        UUID taskId = UUID.randomUUID();
        String userId = "user-1";
        Task existingTask = new Task(taskId, "Test Task", false, userId);

        when(repository.findById(taskId)).thenReturn(Optional.of(existingTask));

        service.deleteTask(taskId, userId);

        verify(repository, times(1)).delete(existingTask);
        verify(auditPublisher, times(1)).publish(argThat(event -> "DELETED".equals(event.action())));
    }

    @Test
    void should_get_tasks_for_user() {
        String userId = "user-1";
        Task task = new Task(UUID.randomUUID(), "Tâche 1", false, userId);
        when(repository.findAllByUserId(userId)).thenReturn(List.of(task));

        List<Task> result = service.getTasksForUser(userId);

        assertEquals(1, result.size());
        assertEquals("Tâche 1", result.get(0).title());
    }
}