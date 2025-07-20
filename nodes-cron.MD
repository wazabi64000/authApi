Qu’est-ce qu’un cron ?

Un cron est un planificateur de tâches sur Linux/Unix (et aussi dans beaucoup d’environnements) qui permet d’exécuter des commandes ou scripts automatiquement à des horaires précis.

Une expression cron se compose généralement de 5 champs (parfois 6 ou plus selon l’outil) :

* * * * *
│ │ │ │ │
│ │ │ │ └─ Jour de la semaine (0 - 7) (dimanche = 0 ou 7)
│ │ │ └─── Mois (1 - 12)
│ │ └───── Jour du mois (1 - 31)
│ └─────── Heure (0 - 23)
└───────── Minute (0 - 59)


Exemple : 0 3 * * *

    0 minute 0

    3 heure 3h du matin

    * chaque jour du mois

    * chaque mois

    * chaque jour de la semaine

Donc, cette tâche s’exécute tous les jours à 3h00 du matin.


Exemple plus complexe : */10 * * * *

    */10 toutes les 10 minutes

    * chaque heure

    * chaque jour du mois

    * chaque mois

    * chaque jour de la semaine

Donc la tâche s’exécute toutes les 10 minutes.



Autre exemple : 30 2 1 * *

    30 minute 30

    2 heure 2h du matin

    1 1er jour du mois

    * chaque mois

    * chaque jour de la semaine

Cette tâche s’exécute le 1er de chaque mois à 2h30 du matin.


En résumé

| Champ              | Valeurs possibles       | Description         |
| ------------------ | ----------------------- | ------------------- |
| Minute             | 0-59                    | Minute de l’heure   |
| Heure              | 0-23                    | Heure de la journée |
| Jour du mois       | 1-31                    | Jour du mois        |
| Mois               | 1-12                    | Mois de l’année     |
| Jour de la semaine | 0-7 (0 ou 7 = dimanche) | Jour de la semaine  |


1. Installer node-cron
```js
npm install node-cron
```


2. Exemple de code pour ton cron dans ton serveur Express

```js

import cron from 'node-cron';
import User from './models/User.js'; // adapte le chemin
import mongoose from 'mongoose';

// 72 heures en millisecondes
const seventyTwoHours = 72 * 60 * 60 * 1000;

cron.schedule('*/10 * * * * *', async () => {
  // Cette tâche s'exécute toutes les 10 secondes

  try {
    const now = Date.now();

    // Calculer la date limite
    const limitDate = new Date(now - seventyTwoHours);

    // Trouver les utilisateurs non vérifiés créés avant cette limite
    const usersToDelete = await User.find({
      isVerified: false,
      createdAt: { $lt: limitDate },
    });

    if (usersToDelete.length > 0) {
      console.log(`Suppression de ${usersToDelete.length} utilisateur(s) non vérifié(s) vieux de plus de 72h`);

      // Supprimer tous ces utilisateurs
      await User.deleteMany({
        _id: { $in: usersToDelete.map(user => user._id) }
      });

      console.log('Utilisateurs supprimés avec succès.');
    } else {
      console.log('Aucun utilisateur à supprimer pour le moment.');
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage des utilisateurs non vérifiés :', error);
  }
});

```