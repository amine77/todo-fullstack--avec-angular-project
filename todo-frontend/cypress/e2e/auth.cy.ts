describe('Authentication Flow', () => {
  beforeEach(() => {
    // S'assurer que le localStorage est vide avant chaque test
    cy.clearLocalStorage();
  });

  it('devrait rediriger vers /login si non authentifié lors de l\'accès à /tasks', () => {
    cy.visit('/tasks');
    cy.url().should('include', '/login');
  });

  it('devrait permettre à un utilisateur de se connecter et le rediriger vers /tasks', () => {
    // Intercepter l'appel backend pour mocker la réponse de connexion
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { token: 'fake-jwt-token' }
    }).as('loginRequest');

    cy.visit('/login');
    
    // Remplir le formulaire
    cy.get('input#username').type('testUser');
    
    // Soumettre
    cy.get('button#login-submit-btn').click();
    
    // Attendre l'appel réseau mocké
    cy.wait('@loginRequest').its('request.body').should('deep.equal', {
      username: 'testUser',
      password: 'password_ignore'
    });
    
    // Vérifier la redirection
    cy.url().should('include', '/tasks');
    
    // Vérifier que le token est bien dans le localStorage
    cy.window().its('localStorage').invoke('getItem', 'token').should('eq', 'fake-jwt-token');
  });

  it('devrait afficher un message d\'erreur si les identifiants sont invalides', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' }
    }).as('loginFailed');

    cy.visit('/login');
    cy.get('input#username').type('wrongUser');
    cy.get('button#login-submit-btn').click();

    cy.wait('@loginFailed');
    
    // Vérifier l'apparition du message d'erreur
    cy.get('#login-error-message').should('be.visible').and('contain', 'Identifiant invalide');
  });
});
