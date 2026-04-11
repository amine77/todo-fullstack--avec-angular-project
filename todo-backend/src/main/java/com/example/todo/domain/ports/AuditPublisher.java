package com.example.todo.domain.ports;

import com.example.todo.domain.model.TaskEvent;

public interface AuditPublisher {
    void publish(TaskEvent event);
}
