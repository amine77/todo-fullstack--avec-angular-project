# language: fr
Fonctionnalité: Gestion des tâches
  En tant qu'utilisateur authentifié
  Je veux pouvoir créer, lister, modifier et supprimer des tâches
  Afin de gérer mon quotidien

  Scénario: Création réussie d'une tâche
    Etant donné que je suis un utilisateur connecté "jean@email.com"
    Quand je crée une tâche avec le titre "Apprendre l'architecture hexagonale"
    Alors la tâche doit être enregistrée et marquée comme non terminée

  Scénario: Lister mes tâches
    Etant donné que je suis un utilisateur connecté "marie@email.com"
    Et que j'ai déjà créé une tâche "Faire les courses"
    Quand je demande la liste de mes tâches
    Alors la liste doit contenir 1 tâche nommée "Faire les courses"

  Scénario: Marquer une tâche comme terminée
    Etant donné que je suis un utilisateur connecté "luc@email.com"
    Et que j'ai déjà créé une tâche "Lire un livre"
    Quand je bascule l'état de cette tâche
    Alors cette tâche doit être marquée comme terminée

  Scénario: Supprimer une tâche
    Etant donné que je suis un utilisateur connecté "paul@email.com"
    Et que j'ai déjà créé une tâche "Tâche à supprimer"
    Quand je supprime cette tâche
    Alors je ne dois plus avoir de tâche dans ma liste