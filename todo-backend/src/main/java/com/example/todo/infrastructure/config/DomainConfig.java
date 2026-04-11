package com.example.todo.infrastructure.config;

import com.example.todo.domain.ports.AuditPublisher;
import com.example.todo.domain.ports.TaskRepository;
import com.example.todo.domain.service.TaskService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DomainConfig {

    @Bean
    public TaskService taskService(TaskRepository taskRepository, AuditPublisher auditPublisher) {
        return new TaskService(taskRepository, auditPublisher);
    }
}
// C'est ici que nous définissons les beans du domaine.
// Comme notre TaskService est dans le Domaine et n'a pas d'annotations @Service (pour rester pur), nous devons le déclarer manuellement dans l'infrastructure.