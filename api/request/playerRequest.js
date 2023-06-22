const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { getAllPlayers, getOnePlayer, createPlayer, updateOnePlayer, deleteOnePlayer, getNewTag, isCorrectName, isCorrectTag, isCorrectPassword } = require("../model/helpers/playerHelper");

const { currentPlayer, playerToSocket,makeJoinCode, Player, nametag, isInGame } = require("../utils/game.js");

const { PLAYER_DOESNT_EXIST, PLAYER_IS_IN_GAME } = require("../utils/errors/messagesConsts");
const { PapayooError, getErrorMessage } = require("../utils/errors/PapayooError");

// this is our get method
// this method fetches all available data in our database
router.get('/', async (req, res) => {
    try {
        const players = await getAllPlayers();
        return res.json(players);
    } catch (e) {
        return res.status(500).json( { message: getErrorMessage('Erreur lors de la récupération des joueurs', e) } )
    }
});


router.get('/:name/:tag', async (req, res) => {
    try {
        const { name, tag } = req.params;
        if (!canFindPlayer(name, tag)) {
            return res.status(400).send();
        }

        const player = await getOnePlayer({ name, tag });
        return res.json([player]);
    } catch (e) {
        return res.status(500).json( { message: getErrorMessage('Erreur lors de la récupération du joueur', e) } )
    }
});



// this is our create method
// this method adds new data in our database
router.post('/add', async (req, res) => {
    try {
        const { name, password } = req.body;
        if (!canCreatePlayer(name, password)) {
            return res.status(400).send();
        }

        const tag = await getNewTag(name);
        const createdPlayer = await createPlayer({ name, tag, password });

        const createdPlayerNametag = nametag(createdPlayer);

        currentPlayer.set(createdPlayerNametag, new Player(createdPlayer.name, createdPlayer.tag, createdPlayer.games, createdPlayer.score))

        let _token = makeJoinCode(10);
        playerToSocket.set(createdPlayerNametag, { token: _token });

        let hashedToken = await bcrypt.hash(_token, 10);
        return res.json({tag , token: hashedToken});
    } catch (e) {
        return res.status(500).json( { message: getErrorMessage('Erreur lors de la création du joueur', e) } )
    }
});


// this is our update method
// this method overwrites existing data in our database
router.post('/update', async (req, res) => {
    try {
        let { name, tag, password, update } = req.body;
        if (!canUpdatePlayer(name, tag, password, update)) {
            return res.status(400).send();
        }

        const playerNameTag = nametag({ name, tag });

        if (!currentPlayer.has(playerNameTag)) {
            throw new PapayooError(PLAYER_DOESNT_EXIST);
        }

        if (isInGame(playerNameTag)) {
            throw new PapayooError(PLAYER_IS_IN_GAME);
        }
        const player = await getOnePlayer({ name, tag }, {});
        const correctPassword = await bcrypt.compare(password, player.password);
        if (!correctPassword) {
            throw new PapayooError('Mot de passe incorrect');
        }

        const exPlayer = currentPlayer.get(playerNameTag);
        const count = await updateOnePlayer( { name, tag }, update);
        if (count === 0) {
            throw new Error();
        }
        
        currentPlayer.delete(playerNameTag);
        if (update.name !== name && update.name != null) {
            name = update.name;
        }
        currentPlayer.set(nametag({ name, tag }), new Player(name, tag, exPlayer.games, exPlayer.score));

        return res.sendStatus(200).json();
    } catch (e) {
        return res.status(500).json( { message: getErrorMessage('Erreur lors de la modification du joueur', e) } )
    }
    /* json format awaited:
    {
        name: string,
        tag: string,
        password : string
        update: {
            name: string, [optional]
            password: string, [optional]
        }
    }
    */
});

// this is our delete method
// this method removes existing data in our database
router.delete('/delete', async (req, res) => {
    /* json format awaited:
    {
        name: string,
        tag: string,
        password: string
    }
    */
    try {
        const { name, password, tag } = req.body;
        if(!canDeletePlayer(name, tag)) {
            return res.status(400).send();
        }

        const playerNameTag = nametag({ name, tag });

        if (!currentPlayer.has(playerNameTag)) {
            throw new PapayooError(PLAYER_DOESNT_EXIST);
        }

        if (isInGame(playerNameTag)) {
            throw new PapayooError(PLAYER_IS_IN_GAME);
        }
        const player = await getOnePlayer({ name, tag }, {});
        const correctPassword = await bcrypt.compare(password, player.password);
        if (!correctPassword) {
            throw new PapayooError('Mot de passe incorrect');
        }

        const count = await currentPlayer.delete(playerNameTag);
        if (count === 0) {
            throw new Error();
        }

        await deleteOnePlayer({ name, tag });
        return res.sendStatus(200).json();
    } catch (e) {
        return res.status(500).json( { message: getErrorMessage('Erreur lors de la suppresion du joueur', e) } )
    }
});

router.post('/login',async (req, res) => {
    /* json format awaited:
    {
        name: string,
        tag: string,
        password : string
    }
    returns socket
    */
    try {
        const { name, tag, password } = req.body;
        if (!canLogin(name, tag, password)) {
            return res.status(400).send();
        }

        const playerNameTag = nametag({ name, tag });

        if (!currentPlayer.has(playerNameTag)) {
            throw new PapayooError(PLAYER_DOESNT_EXIST);
        }

        if (playerToSocket.has(playerNameTag)) {
            playerToSocket.delete(playerNameTag);
        }

        const player = await getOnePlayer({ name, tag }, {});

        const correctPassword = await bcrypt.compare(password, player.password);
        if (!correctPassword) {
            throw new PapayooError('Mot de passe incorrect');
        }

        let _token = makeJoinCode(10);
        let hashedToken = await bcrypt.hash(_token, 10);
        playerToSocket.set(playerNameTag, {token : _token});
        return res.json(hashedToken);
    } catch (e) {
        return res.status(500).send( { message: getErrorMessage('Erreur lors de la connexion du joueur', e) } )
    }
});

function canFindPlayer(name, tag) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    return true;
}

function canCreatePlayer(name, password) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectPassword(password)) return false;
    return true;
}

function canUpdatePlayer(name, tag, update) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    if ((!update.password && !update.name) || update.tag != null || update._id != null || update.games != null) return false;
    return true;
}

function canDeletePlayer(name, tag) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    return true;
}

function canLogin(name, tag, password) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    if (!isCorrectPassword(password)) return false;
    return true;
}

function canUpdatePlayer(name, tag, password, update) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    if (!isCorrectPassword(password)) return false;
    if ((!update.password && !update.name) || update.tag != null || update._id != null || update.games != null) return false;
    return true;
}


module.exports = router;
