package com.example.todo.infrastructure.adapters.persistence;

import com.example.todo.domain.model.Task;
import com.example.todo.domain.ports.TaskRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import java.util.List;

import java.util.UUID;

@Component
public class PostgresTaskRepository implements TaskRepository {
    
    private final JpaTaskRepository jpaRepository;

    public PostgresTaskRepository(JpaTaskRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    @CacheEvict(value = "tasks", key = "#task.userId()") 
    // On vide le cache de l'utilisateur quand il ajoute une tâche pour forcer la mise à jour
    public Task save(Task task) {
        TaskEntity entity = TaskEntity.fromDomain(task);
        return jpaRepository.save(entity).toDomain();
    }

    @Override
    @Cacheable(value = "tasks", key = "#userId")
    // Si la liste est en cache Redis, on la renvoie directement. Sinon, go Postgres.
    public List<Task> findAllByUserId(String userId) {
        return jpaRepository.findByUserId(userId).stream()
                .map(TaskEntity::toDomain)
                .toList();
    }

    @Override
    public java.util.Optional<Task> findById(UUID id) {
        return jpaRepository.findById(id).map(TaskEntity::toDomain);
    }

    @Override
    @CacheEvict(value = "tasks", key = "#task.userId()")
    public void delete(Task task) {
        jpaRepository.deleteById(task.id());
    }
}