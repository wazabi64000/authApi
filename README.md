# authApi
##    1. Arborescence du projet                 ##
mon-api-auth/
│
├── config/
│   └── db.js                 # Connexion à la base MongoDB avec Mongoose
│
├── controllers/
│   └── authController.js     # Logique métier d’authentification (register, login, verify)
│
├── middlewares/
│   └── authMiddleware.js     # Middleware pour protéger les routes via JWT
│
├── models/
│   └── User.js               # Schéma utilisateur MongoDB avec Mongoose
│
├── routes/
│   └── auth.js               # Routes HTTP pour l’authentification
│
├── utils/
│   ├── sendEmail.js          # Fonction d’envoi d’email avec Nodemailer + OAuth2 Google
│   └── cloudinary.js         # Configuration Cloudinary (upload avatar) - optionnel
│
├── .env                      # Variables d’environnement (ne pas versionner)
├── .gitignore                # Fichiers à ignorer par git
├── package.json              # Liste des dépendances & scripts npm
├── README.md                 # Documentation (ce fichier)
└── server.js                 # Point d’entrée principal du serveur Express

## _______________________________________________________________________ ##




##     2.1 Initialiser le projet                ##

npm init -y

## _______________________________________________________________________ ##


##      2.2 Installer les dépendances essentielles               ##

npm install express mongoose bcryptjs jsonwebtoken cookie-parser dotenv nodemailer cloudinary

## _______________________________________________________________________ ##


##      2.3 Installer les dépendances de développement (optionnel)               ##
npm install --save-dev nodemon
## _______________________________________________________________________ ##


##        3. Explications des dépendances             ##

| Package       | Rôle principal                                         |
| ------------- | ------------------------------------------------------ |
| express       | Framework web pour créer serveur HTTP                  |
| mongoose      | ODM pour MongoDB (modélisation + gestion BDD)          |
| bcryptjs      | Hashage sécurisé des mots de passe                     |
| jsonwebtoken  | Création et vérification de tokens JWT                 |
| cookie-parser | Analyse des cookies HTTP                               |
| dotenv        | Gestion des variables d’environnement depuis `.env`    |
| nodemailer    | Envoi d’emails via SMTP (ici avec OAuth2 Google)       |
| cloudinary    | Gestion de l’upload et stockage d’images dans le cloud |
| nodemon       | Outil dev pour recharger le serveur automatiquement    |

## _______________________________________________________________________ ##


##      4. Variables d’environnement (.env)               ##
PORT=5000
MONGO_URI=ton_mongodb_uri
JWT_SECRET=une_clef_secrete_complexe

GOOGLE_CLIENT_ID=ton_client_id_google
GOOGLE_CLIENT_SECRET=ton_client_secret_google
GOOGLE_REFRESH_TOKEN=ton_refresh_token_google
SENDER_EMAIL=ton_email@gmail.com

CLIENT_URL=http://localhost:5000

CLOUDINARY_CLOUD_NAME=ton_cloud_name
CLOUDINARY_API_KEY=ta_cle_api
CLOUDINARY_API_SECRET=ton_secret_api

## _______________________________________________________________________ ##


##     En développement avec nodemon             ##

"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js"
}

## _______________________________________________________________________ ##



##     Puis lancer :                ##
npm/yarn run dev

## _______________________________________________________________________ ##



##    6. Bref descriptif des dossiers/fichiers ##

config/db.js : connexion MongoDB simplifiée (Mongoose 7+ sans options obsolètes)

controllers/authController.js : fonctions asynchrones gérant les actions d’authentification (register, login, email verification)

middlewares/authMiddleware.js : middleware pour sécuriser les routes, vérifie le JWT et extrait l’utilisateur

models/User.js : schéma Mongoose pour la collection utilisateur avec validation, enum, etc.

routes/auth.js : déclaration des routes REST pour l’auth (POST /register, POST /login, GET /verify/:token)

utils/sendEmail.js : module pour envoyer des emails sécurisés via Nodemailer avec OAuth2 Google

utils/cloudinary.js : config Cloudinary pour uploader et gérer les avatars utilisateurs (optionnel)

server.js : point d’entrée express, initialise middleware, routes, connexion BDD, gestion erreurs non capturées

## _______________________________________________________________________ ##





