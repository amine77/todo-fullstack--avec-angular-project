package com.example.todo.domain.model;

import java.time.LocalDateTime;

public record TaskEvent(
    String action, 
    String taskId,
    String userId,
    String taskTitle,
    LocalDateTime timestamp
) {}
