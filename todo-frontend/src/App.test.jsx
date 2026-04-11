import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('should display the login form initially when no token is present', () => {
    // Rend le composant principal App en mémoire (jsdom)
    render(<App />);
    
    // Le titre de connexion doit s'afficher
    const loginHeading = screen.getByRole('heading', { name: /Connexion/i });
    expect(loginHeading).toBeDefined();

    // Le champ Nom d'utilisateur doit être là
    const usernameInput = screen.getByPlaceholderText(/Votre identifiant/i);
    expect(usernameInput).toBeDefined();

    // Le bouton 'Se connecter'
    const loginBtn = screen.getByRole('button', { name: /Se connecter/i });
    expect(loginBtn).toBeDefined();
  });
});
