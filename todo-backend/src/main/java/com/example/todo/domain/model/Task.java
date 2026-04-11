package com.example.todo.domain.model;

import java.util.UUID;

import java.io.Serializable;

/**
 * Entité Task : Utilisation d'un record Java 21 pour l'immutabilité.
 * Le métier définit ce qu'est une tâche, sans se soucier de la base de données.
 */
public record Task(UUID id, String title, boolean completed, String userId) implements Serializable {
    
    // Validation métier lors de la création
    public Task {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Le titre de la tâche ne peut pas être vide");
        }
    }

    // Méthode métier pour inverser l'état de la tâche
    public Task toggle() {
        return new Task(this.id, this.title, !this.completed, this.userId);
    }
}