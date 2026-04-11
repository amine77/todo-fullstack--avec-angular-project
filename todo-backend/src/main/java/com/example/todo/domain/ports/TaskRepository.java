package com.example.todo.domain.ports;

import com.example.todo.domain.model.Task;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Port de sortie (Output Port) : Ce dont le domaine a besoin pour sauvegarder
// Le port doit définir la capacité de l'infrastructure à récupérer les données.
public interface TaskRepository {
    Task save(Task task);
    List<Task> findAllByUserId(String userId);
    Optional<Task> findById(UUID id);
    void delete(Task task);
}