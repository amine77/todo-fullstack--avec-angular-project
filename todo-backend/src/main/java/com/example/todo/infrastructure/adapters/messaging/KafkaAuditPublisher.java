package com.example.todo.infrastructure.adapters.messaging;

import com.example.todo.domain.model.TaskEvent;
import com.example.todo.domain.ports.AuditPublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Adaptateur (Infrastructure) : Implémentation du Port AuditPublisher.
 * Cette classe est responsable de l'envoi des événements vers le Broker Kafka.
 * Le domaine appelle cette classe sans savoir qu'il s'agit de Kafka en dessous.
 */
@Component
public class KafkaAuditPublisher implements AuditPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper;

    public KafkaAuditPublisher(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
        // Le ObjectMapper de Jackson convertit nos objets Java en format texte JSON.
        // On rajoute le module JavaTimeModule pour gérer les dates (LocalDateTime) proprement.
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
    }

    /**
     * Convertit l'événement métier en JSON et l'envoie de manière asynchrone dans Kafka.
     * 
     * @param event L'événement concernant une tâche.
     */
    @Override
    public void publish(TaskEvent event) {
        try {
            // 1. On sérialise l'objet Record Java en chaîne JSON.
            String payload = mapper.writeValueAsString(event);
            
            // 2. On envoie le message texte au broker Kafka. 
            // "user-activities" est le nom strict du TOPIC configuré pour recueillir tous les logs.
            // Si le topic n'existe pas, Kafka le créera automatiquement avec ses paramètres par défaut.
            kafkaTemplate.send("user-activities", payload);
            
        } catch (Exception e) {
            // Si le serveur Kafka est subitement indisponible, on loggue l'erreur 
            // sans crasher l'application principale (grâce au asynchrone).
            e.printStackTrace();
        }
    }
}
