import React, { useState, useEffect } from 'react';
import { login, getTasks, createTask, toggleTask, deleteTask } from './api/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [username, setUsername] = useState('');

  // Charger les tâches si on est connecté
  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (err) {
      if (err.response?.status === 403) handleLogout();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(username, 'password_ignore'); // Simplifié pour l'exemple
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert("Erreur de connexion");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    await createTask(newTaskTitle);
    setNewTaskTitle('');
    fetchTasks(); // Rafraîchir la liste (et vider le cache Redis côté backend)
  };

  const handleToggleTask = async (id) => {
    await toggleTask(id);
    fetchTasks();
  };

  const handleDeleteTask = async (id) => {
    await deleteTask(id);
    fetchTasks();
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return (
      <div className="container d-flex align-items-center justify-content-center min-vh-100">
        <div className="card premium-card p-5" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="text-center mb-4">
            <h2 className="fw-bold">Connexion</h2>
            <p className="text-muted">Accédez à votre espace Todo</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="form-label">Nom d'utilisateur</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-person"></i></span>
                <input 
                  type="text"
                  className="form-control border-start-0 ps-0" 
                  placeholder="Votre identifiant"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold shadow-sm">
              <i className="bi bi-box-arrow-in-right me-2"></i> Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 max-w-md">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card premium-card p-4">
            
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <h3 className="fw-bold mb-0 text-dark">
                <i className="bi bi-card-checklist me-2 text-primary"></i>
                Ma Todo List
              </h3>
              <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-3 shadow-sm">
                <i className="bi bi-box-arrow-right me-1"></i> Déconnexion
              </button>
            </div>

            <form onSubmit={handleAddTask} className="mb-4">
              <div className="input-group input-group-lg shadow-sm">
                <input 
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="form-control"
                  placeholder="Que voulez-vous faire aujourd'hui ?"
                  aria-label="Nouvelle tâche"
                />
                <button className="btn btn-primary px-4" type="submit">
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            </form>

            <ul className="list-group list-group-flush mb-0">
              {tasks.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-inbox fs-1 d-block mb-3 text-opacity-50"></i>
                  <p>Aucune tâche pour le moment. Ajoutez-en une !</p>
                </div>
              ) : (
                tasks.map(task => (
                  <li 
                    key={task.id} 
                    className={`list-group-item px-3 py-3 rounded mb-2 border d-flex justify-content-between align-items-center ${task.completed ? 'task-completed' : 'task-item'}`}
                  >
                    <div className="d-flex align-items-center flex-grow-1">
                      <div className="form-check mb-0 w-100 cursor-pointer" onClick={() => handleToggleTask(task.id)}>
                        <input 
                          className="form-check-input me-3 border-secondary" 
                          type="checkbox" 
                          readOnly
                          checked={task.completed} 
                          style={{ cursor: 'pointer' }}
                        />
                        <span className={`fw-medium ${task.completed ? 'text-muted' : 'text-dark'}`} style={{ cursor: 'pointer' }}>
                          {task.title}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteTask(task.id)} 
                      className="btn btn-sm btn-outline-danger border-0"
                      title="Supprimer"
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </li>
                ))
              )}
            </ul>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;