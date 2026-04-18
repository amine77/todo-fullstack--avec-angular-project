describe('Task Management Flow', () => {
  beforeEach(() => {
    // Simuler la connexion en injectant un token fictif
    window.localStorage.setItem('token', 'fake-jwt-token');
    
    // Intercepter la récupération des tâches
    cy.intercept('GET', '**/api/tasks', {
      statusCode: 200,
      body: [
        { id: 1, title: 'Apprendre Cypress', completed: false, userId: 'testUser' },
        { id: 2, title: 'Rédiger des tests E2E', completed: true, userId: 'testUser' }
      ]
    }).as('getTasks');
    
    cy.visit('/tasks');
    cy.wait('@getTasks');
  });

  it('devrait afficher la liste des tâches', () => {
    // Vérifier l'affichage des éléments
    cy.get('#task-item-1').should('contain', 'Apprendre Cypress');
    cy.get('#task-item-2').should('contain', 'Rédiger des tests E2E').and('have.class', 'task-completed');
  });
  
  it('devrait permettre d\'ajouter une nouvelle tâche', () => {
    const newTask = { id: 3, title: 'Nouvelle tâche E2E', completed: false, userId: 'testUser' };
    
    cy.intercept('POST', '**/api/tasks', {
      statusCode: 200,
      body: newTask
    }).as('addTask');
    
    // Intercepter le get consécutif (refetch() après création)
    cy.intercept('GET', '**/api/tasks', {
      statusCode: 200,
      body: [
        { id: 1, title: 'Apprendre Cypress', completed: false, userId: 'testUser' },
        { id: 2, title: 'Rédiger des tests E2E', completed: true, userId: 'testUser' },
        newTask
      ]
    }).as('getTasksAfterAdd');
    
    // Remplir et soumettre le formulaire
    cy.get('input#new-task-input').type('Nouvelle tâche E2E');
    cy.get('button#add-task-btn').click();
    
    cy.wait('@addTask');
    cy.wait('@getTasksAfterAdd');
    
    // Vérifier que la nouvelle tâche est dans la liste
    cy.get('#task-item-3').should('contain', 'Nouvelle tâche E2E');
  });

  it('devrait pouvoir marquer une tâche comme terminée/non terminée', () => {
    // Interception de l'appel PUT/toggle
    cy.intercept('PUT', '**/api/tasks/1/toggle', {
      statusCode: 200,
      body: { id: 1, title: 'Apprendre Cypress', completed: true, userId: 'testUser' } // L'état changé
    }).as('toggleTask');

    // On prépare le refetch
    cy.intercept('GET', '**/api/tasks', {
      statusCode: 200,
      body: [
        { id: 1, title: 'Apprendre Cypress', completed: true, userId: 'testUser' },
        { id: 2, title: 'Rédiger des tests E2E', completed: true, userId: 'testUser' }
      ]
    }).as('getTasksAfterToggle');

    // Clique sur la tâche pour déclencher toggle (clic sur la div ou le checkbox)
    cy.get('#task-item-1 div').first().click();
    
    cy.wait('@toggleTask');
    cy.wait('@getTasksAfterToggle');

    cy.get('#task-item-1').should('have.class', 'task-completed');
  });

  it('devrait permettre de supprimer une tâche', () => {
    cy.intercept('DELETE', '**/api/tasks/2', {
      statusCode: 204
    }).as('deleteTask');

    cy.intercept('GET', '**/api/tasks', {
      statusCode: 200,
      body: [
        { id: 1, title: 'Apprendre Cypress', completed: false, userId: 'testUser' }
      ]
    }).as('getTasksAfterDelete');

    cy.get('button#delete-task-2').click();
    
    cy.wait('@deleteTask');
    cy.wait('@getTasksAfterDelete');

    cy.get('#task-item-2').should('not.exist');
    cy.get('#task-item-1').should('exist');
  });

  it('devrait permettre à l\'utilisateur de se déconnecter', () => {
    cy.get('button#logout-btn').click();
    cy.url().should('include', '/login');
    cy.window().its('localStorage').invoke('getItem', 'token').should('be.null');
  });
});
