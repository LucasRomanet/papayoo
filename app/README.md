# Démarrer l'application React

*Voir la documentation officielle [React](https://github.com/facebook/create-react-app)*

```
npm start
```

Lance l'application en mode développement
Ouvre [http://localhost:3000](http://localhost:3000) dans votre navigateur par défaut.

La page va s'actualiser si vous éditez les fichiers sources.

# Pages disponibles

*Certaines pages sont inaccessibles tant que le joueur n'a pas rejoint de partie ou n'est pas connecté.*

## Sans être connecté

#### `/`

Page d'accueil.

#### `/classement`

Classement global de tout les joueurs.

#### `/rules`

Rappel des règles du jeu de Papayoo.

#### `/contact`

Auteurs du jeu.

## Connexion requise

Il est possible de créer un joueur via le formulaire d'inscription, mais il existe également des comptes test déjà disponibles à la connexion avec pour identifiants:

**Login**: `Jeremy#000n` avec n au choix de 1 à 8 (exemple: Jeremy#0001)\
**Mot de passe**: `Jeremy`\
*Attention: un même joueur ne peut pas rejoindre 2 fois la même partie ou 2 parties différentes.*


#### `/jouer`

Créer ou rejoindre une partie (code à 6 caractères)

#### `/lobby`

Salon d'attente et de discussion précédant la partie. Nombre de joueurs minimums pour démarrer une partie: 3\
Seul le créateur du salon peut démarrer la partie.

#### `/partie`

Jeu de Papayoo.

#### `/game-over`

Écran de fin, récapitulatif des points de la partie qui vient de se dérouler.

# Page indisponible

*Page fonctionnelle mais dont l'accès est bloqué.*

#### `/partie-offline`

Prototype offline du jeu de Papayoo. Implémentation des règles du jeu coté client.