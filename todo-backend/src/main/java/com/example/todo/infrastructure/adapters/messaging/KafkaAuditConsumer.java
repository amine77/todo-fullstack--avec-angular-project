package com.example.todo.infrastructure.adapters.messaging;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class KafkaAuditConsumer {

    @KafkaListener(topics = "user-activities", groupId = "todo-audit-group")
    public void consumeAuditLog(String message) {
        System.out.println("\n==========================================================================================");
        System.out.println("🔔 [AUDIT LOG KAFKA REÇU EN TEMPS RÉEL] : " + message);
        System.out.println("==========================================================================================\n");
    }
}
