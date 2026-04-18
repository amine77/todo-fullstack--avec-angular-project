package com.example.todo.bdd;

import com.example.todo.domain.model.Task;
import com.example.todo.domain.service.TaskService;
import io.cucumber.java.fr.*;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@CucumberContextConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class TodoStepDefinitions {

    @Autowired
    private TaskService taskService;

    private String currentUser;
    private Task lastCreatedTask;
    private List<Task> fetchedTasks;

    @Etantdonné("je suis un utilisateur connecté {string}")
    public void que_je_suis_un_utilisateur_connecté(String email) {
        this.currentUser = email;
    }

    @Quand("je crée une tâche avec le titre {string}")
    public void je_crée_une_tâche_avec_le_titre(String titre) {
        this.lastCreatedTask = taskService.createNewTask(titre, currentUser);
    }

    @Alors("la tâche doit être enregistrée et marquée comme non terminée")
    public void la_tâche_doit_être_enregistrée_et_marquée_comme_non_terminée() {
        assertNotNull(lastCreatedTask);
        assertNotNull(lastCreatedTask.id());
        assertEquals(currentUser, lastCreatedTask.userId());
        assertFalse(lastCreatedTask.completed());
    }

    @Et("j'ai déjà créé une tâche {string}")
    public void que_j_ai_déjà_créé_une_tâche(String titre) {
        this.lastCreatedTask = taskService.createNewTask(titre, currentUser);
    }

    @Quand("je demande la liste de mes tâches")
    public void je_demande_la_liste_de_mes_tâches() {
        this.fetchedTasks = taskService.getTasksForUser(currentUser);
    }

    @Alors("la liste doit contenir {int} tâche nommée {string}")
    public void la_liste_doit_contenir_tâche_nommée(int count, String titre) {
        assertNotNull(fetchedTasks);
        long matchingCount = fetchedTasks.stream().filter(t -> t.title().equals(titre)).count();
        assertEquals(count, matchingCount);
    }

    @Quand("je bascule l'état de cette tâche")
    public void je_bascule_l_état_de_cette_tâche() {
        this.lastCreatedTask = taskService.toggleTask(lastCreatedTask.id(), currentUser);
    }

    @Alors("cette tâche doit être marquée comme terminée")
    public void cette_tâche_doit_être_marquée_comme_terminée() {
        assertTrue(lastCreatedTask.completed());
    }

    @Quand("je supprime cette tâche")
    public void je_supprime_cette_tâche() {
        taskService.deleteTask(lastCreatedTask.id(), currentUser);
    }

    @Alors("je ne dois plus avoir de tâche dans ma liste")
    public void je_ne_dois_plus_avoir_de_tâche_dans_ma_liste() {
        this.fetchedTasks = taskService.getTasksForUser(currentUser);
        assertTrue(fetchedTasks == null || fetchedTasks.stream().noneMatch(t -> t.id().equals(lastCreatedTask.id())));
    }
}