import cron from "node-cron"; // Import du module node-cron pour planifier des tâches cron
import User from "../models/User.js"; // Import du modèle User depuis le dossier models (adapter le chemin si nécessaire)

// Fonction asynchrone qui supprime les utilisateurs non vérifiés depuis plus de 10 secondes (pour test)
async function deleteUnverifiedUsers() {
  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000); // Date il y a 72 heures (3 jours)
  const twentySecondsAgo = new Date(Date.now() - 10 * 1000); // Date il y a 10 secondes (pour test rapide)

  try {
    // Suppression de tous les utilisateurs qui ne sont pas vérifiés ET dont la date de création est antérieure à "twentySecondsAgo"
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: threeDaysAgo },
    });

    // Affichage du nombre d'utilisateurs supprimés
    console.log(`Suppression effectuée : ${result.deletedCount} utilisateurs non vérifiés supprimés.`);
  } catch (error) {
    // Affichage d'une erreur en cas d'échec de la suppression
    console.error("Erreur suppression utilisateurs non vérifiés :", error);
  }
}

// Planification du cron job avec la syntaxe cron suivante : "12 14 */3 * *"
// Ce qui signifie : à 14h12 tous les 3 jours du mois
const task = cron.schedule("12 14 */3 * *", () => {
  // Log dans la console quand la tâche démarre
  console.log("Cron job démarré pour supprimer les utilisateurs non vérifiés...");
  // Appel de la fonction pour supprimer les utilisateurs non vérifiés
  deleteUnverifiedUsers();
});

export default task; // Export du cron job pour l'importer et l'exécuter dans d'autres fichiers
