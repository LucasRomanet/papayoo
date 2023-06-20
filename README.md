# Papayoo en ligne

Plateforme de jeu de papayoo multijoueur en ligne.

Copyright: [Gigamic](https://www.gigamic.com/)

## Prérequis pour démarrer le projet

- Node.js
- npm

[Installer node et npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

### Serveur

L'API est située dans le répertoire [api/](api/)

Renommer et modifier le fichier [.env.example](api/.env.example) en [.env](api/.env.example), notamment la chaîne de connexion vers la base de donnée MongoDB.

Installer les modules nécessaires:

```sh
npm install
```

Démarrer le serveur:

```sh
# Mode développement
npm start
# Mode production (sans les évènements affichés dans la console)
npm run production
```

### Client

L'application React est située dans le répertoire [app/](app/)

Renommer et modifier le fichier [.env.example](app/.env.example) en [.env](app/.env.example) en fonction de la configuration de l'hébergeur.

Installer les modules nécessaires:

```sh
npm install
```

Démarrer un serveur de développement React:

```sh
npm start
```

Compiler une version déployable de l'application dans le répertoire [build/](build/)

```sh
npm run build
```