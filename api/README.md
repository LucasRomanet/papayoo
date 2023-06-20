# Démarrer l'API

```
node index.js
```

Lance l'API accessible via [http://localhost:3001/api](http://localhost:3001/api)

# Routes disponibles

## GET

#### `/player`

Renvoie une liste de tout les joueurs et leurs statistiques.

#### `/player/:nom/:tag`

Renvoie les statistiques du joueur name#tag.

## POST

#### `/player/add`

```js
/* format json attendu:
{
    name: string,
    password: string
}
*/
```

Ajoute un joueur à la base de données accompagné de son mot de passe crypté et de son tag géneré automatiquement.

#### `/player/update`

```js
/* format json attendu:
{
    name: string,
    tag: string,
    update: {
        name: string, [optionnel]
        password: string, [optionnel]
        score: int, [optionnel]
        games: int, [optionnel]
    }
}
*/
```

Modifie les attributs d'un joueur.

#### `/player/login`

```js
/* format json attendu:
{
    name: string,
    tag: string,
    password : string
}
*/
```

Connecte le joueur et lui renvoie un token d'authentification.

#### `/game`

```js
/* format json attendu:
{
    name: string,
    tag: string,
    token : string
}
*/
```

Crée un nouveau salon de jeu multijoueur et y connecte le joueur.

#### `/game/:code`

```js
/* format json attendu:
{
    name: string,
    tag: string,
    token: string
}
*/
```

Rejoint un salon multijoueur à l'aide d'un code à 6 caractères.

## DELETE

#### `/player/add`

```js
/* format json attendu:
{
    name: string,
    tag: string,
    password : string
}
*/
```

Supprime un joueur de la base de données.

# Fonctions du socket

## Client

#### `login`

```js
/* format json attendu:
{
    name: string,
    tag: string,
    token: string
}
*/
```

2e étape de la connexion du joueur avec le token obtenu par la méthode l'appel de `/api/player/login`.

#### `start`

```js
/* format json attendu:
{
    gameCode: string
}
*/
```

Crée une nouvelle partie de papayoo avec tout les membres du salon d'attente.

#### `flick`

```js
/* format json attendu:
{
    gameCode: string,
    array cards : {
                id: id,
                number: i,
                color: j
            }
}
*/
```

Transmet une défausse de 5 cartes au joueur suivant.

#### `ask`

Transmet au joueur qui en fait la demande les caractéristiques de la salle d'attente dans laquelle il se trouve (ce qui permet de quitter la salle d'attente et d'y retourner facilement). 

#### `play`

```js
/* format json attendu:
{
    gameCode: string,
    card : {
                id: id,
                number: i,
                color: j
            }
}
*/
```

Pose une carte sur la table.

#### `message`

```js
/* format json attendu:
{
    gameCode: string,
    text : string
}
*/
```

Envoie un message dans le chat.

## Serveur

#### `notify`

Fonction généraliste qui envoie au client des éléments du state:

	- La composition du lobby
	- La table de jeu et/ou la main du joueur
	- L'état de la partie (en cours, défaussage, terminée...)

#### `message`

Actualiste le chat chez tout les joueurs du salon.