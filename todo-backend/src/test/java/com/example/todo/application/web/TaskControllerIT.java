package com.example.todo.application.web;

import com.example.todo.domain.model.Task;
import com.example.todo.domain.service.TaskService;
import com.example.todo.infrastructure.config.SecurityConfig;
import com.example.todo.infrastructure.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class TaskControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    // Isoler complètement la base de données et Redis en mockant le service ciblé.
    @MockBean
    private TaskService taskService;

    private String validToken;

    @BeforeEach
    void setUp() {
        validToken = "Bearer " + jwtService.generateToken("apiUser");
    }

    @Test
    void shouldCreateTaskAndReturnIt() throws Exception {
        UUID taskId = UUID.randomUUID();
        Task mockTask = new Task(taskId, "Acheter du lait mockmvc", false, "apiUser");
        
        // Configuration du Mock : quand le contrôleur passera le texte, on renvoie notre tâche simulée.
        Mockito.when(taskService.createNewTask("Acheter du lait mockmvc", "apiUser")).thenReturn(mockTask);

        mockMvc.perform(post("/api/tasks")
                        .header(HttpHeaders.AUTHORIZATION, validToken)
                        .contentType(MediaType.TEXT_PLAIN) 
                        .content("Acheter du lait mockmvc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Acheter du lait mockmvc"))
                .andExpect(jsonPath("$.completed").value(false))
                .andExpect(jsonPath("$.userId").value("apiUser"))
                .andExpect(jsonPath("$.id").value(taskId.toString()));
    }

    @Test
    void shouldGetTasksList() throws Exception {
        UUID taskId = UUID.randomUUID();
        Mockito.when(taskService.getTasksForUser("apiUser")).thenReturn(List.of(
            new Task(taskId, "Tâche test isolée", false, "apiUser")
        ));

        mockMvc.perform(get("/api/tasks")
                        .header(HttpHeaders.AUTHORIZATION, validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("Tâche test isolée"));
    }

    @Test
    void shouldBlockAccessWithoutToken() throws Exception {
        mockMvc.perform(get("/api/tasks"))
               .andExpect(status().is4xxClientError());
    }

    @Test
    void shouldPerformFullTaskLifecycle() throws Exception {
        UUID taskId = UUID.randomUUID();
        Task createdTask = new Task(taskId, "Tâche E2E API", false, "apiUser");
        Task toggledTask = new Task(taskId, "Tâche E2E API", true, "apiUser");

        Mockito.when(taskService.createNewTask("Tâche E2E API", "apiUser")).thenReturn(createdTask);
        Mockito.when(taskService.toggleTask(taskId, "apiUser")).thenReturn(toggledTask);

        // 1. Création de la tâche
        mockMvc.perform(post("/api/tasks")
                        .header(HttpHeaders.AUTHORIZATION, validToken)
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("Tâche E2E API"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists());

        // 2. Bascule du statut (toggle)
        mockMvc.perform(put("/api/tasks/" + taskId + "/toggle")
                        .header(HttpHeaders.AUTHORIZATION, validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(true));

        // 3. Suppression de la tâche
        mockMvc.perform(delete("/api/tasks/" + taskId)
                        .header(HttpHeaders.AUTHORIZATION, validToken))
                .andExpect(status().isNoContent());

        // Vérifie formellement que le controller a bien délégué la suppression au service.
        Mockito.verify(taskService).deleteTask(taskId, "apiUser");
    }
}
