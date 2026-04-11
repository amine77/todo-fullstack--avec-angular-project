package com.example.todo.infrastructure.adapters.messaging;

import com.example.todo.domain.model.TaskEvent;
import com.example.todo.domain.ports.AuditPublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class KafkaAuditPublisher implements AuditPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper;

    public KafkaAuditPublisher(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
    }

    @Override
    public void publish(TaskEvent event) {
        try {
            String payload = mapper.writeValueAsString(event);
            kafkaTemplate.send("user-activities", payload);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
