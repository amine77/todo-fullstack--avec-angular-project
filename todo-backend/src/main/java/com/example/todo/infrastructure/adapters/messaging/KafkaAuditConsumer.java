package com.example.todo.infrastructure.adapters.messaging;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Adaptateur (Infrastructure) : Consommateur Kafka.
 * Il tourne en permanence en toile de fond pour écouter les nouveaux messages.
 */
@Component
public class KafkaAuditConsumer {

    /**
     * La magie de Spring Kafka : cette méthode est déclenchée automatiquement
     * à l'arrivée d'un message dans le topic précisé.
     * 
     * topics = "user-activities" : Doit obligatoirement correspondre au nom 
     *                              du topic dans lequel le Producer (KafkaAuditPublisher) envoie les données.
     * groupId = "todo-audit-group" : Identifiant de ce consommateur. Si on lance 3 instances de l'application, 
     *                                le groupe permet de répartir la charge (un message n'est traité qu'une fois pour ce groupe).
     */
    @KafkaListener(topics = "user-activities", groupId = "todo-audit-group")
    public void consumeAuditLog(String message) {
        // En vrai, nous pourrions sauvegarder cet événement dans une base ElasticSearch,
        // ou bien envoyer un Metric pour un dashboard Grafana ou Datadog.
        // Ici on se contente de l'afficher proprement.
        System.out.println("\n==========================================================================================");
        System.out.println("🔔 [AUDIT LOG KAFKA REÇU EN TEMPS RÉEL] : " + message);
        System.out.println("==========================================================================================\n");
    }
}
