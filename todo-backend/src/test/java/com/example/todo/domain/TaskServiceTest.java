package com.example.todo.domain;

import com.example.todo.domain.model.Task;
import com.example.todo.domain.ports.AuditPublisher;
import com.example.todo.domain.ports.TaskRepository;
import com.example.todo.domain.service.TaskService;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.mockito.Mockito.*;


class TaskServiceTest {

    @Test
    void should_create_task_with_valid_data() {
        // GIVEN
        TaskRepository repository = mock(TaskRepository.class);
        AuditPublisher auditPublisher = mock(AuditPublisher.class);
        TaskService service = new TaskService(repository, auditPublisher);
        String title = "Finir le projet Fullstack";
        String userId = "user-1";
        
        Task mockTask = new Task(UUID.randomUUID(), title, false, userId);
        when(repository.save(any(Task.class))).thenReturn(mockTask);
        
        // WHEN
        service.createNewTask(title, userId);

        // THEN
        verify(repository, times(1)).save(any(Task.class));
        verify(auditPublisher, times(1)).publish(any());
    }
}