import cron from "node-cron";
import { exec } from "child_process";

// Fonction qui lance la commande `npm audit` pour vérifier les vulnérabilités
function auditDependencies() {
  exec("npm audit --json", { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      console.error("Erreur lors de l'exécution de npm audit :", error.message);
      return;
    }
    if (stderr) {
      console.error("Erreur standard lors de npm audit :", stderr);
      return;
    }
    try {
      const auditReport = JSON.parse(stdout);
      const vulnerabilities = auditReport.metadata.vulnerabilities;
      console.log("Audit des dépendances :");
      console.log(`Faible: ${vulnerabilities.low || 0}, Modérée: ${vulnerabilities.moderate || 0}, Élevée: ${vulnerabilities.high || 0}, Critique: ${vulnerabilities.critical || 0}`);
    } catch (parseError) {
      console.error("Erreur de parsing du rapport d'audit :", parseError);
    }
  });
}

// Planification du cron job toutes les 10 secondes
const auditTask = cron.schedule("0 0 0 * * *", () => {
  console.log("Démarrage du cron d’audit des dépendances...");
  auditDependencies();
});

export default auditTask;
