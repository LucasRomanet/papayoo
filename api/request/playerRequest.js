const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { getAllPlayers, isPlayerExist, getOnePlayer, createPlayer, updateOnePlayer, deleteOnePlayer, getNewTag, isCorrectName, isCorrectTag, isCorrectPassword } = require("../model/helpers/playerHelper");

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

// this is our create method
// this method adds new data in our database
router.post('/register', async (req, res) => {
    try {
        const { name, tag, password } = req.body;
        if (!canCreatePlayer(name, tag, password)) {
            return res.status(400).send();
        }

        if (await isPlayerExist({ name, tag })) {
            throw new PapayooError('Couple nom/tag indisponible.')
        }

        //const tag = await getNewTag(name);
        const createdPlayer = await createPlayer({ name, tag, password });

        const createdPlayerNametag = nametag(createdPlayer);

        currentPlayer.set(createdPlayerNametag, new Player(createdPlayer.name, createdPlayer.tag, createdPlayer.games, createdPlayer.score))

        return res.json(logPlayer(createdPlayer));
    } catch (e) {
        console.log(e);
        return res.status(500).json( { message: getErrorMessage('Erreur lors de la création du joueur', e) } )
    }
});

router.post('/login',async (req, res) => {
    /* json format awaited:
    {
        name: string,
        tag: string,
        password : string
    }
    returns token
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

        // Return the logged player
        return res.json(logPlayer(player));
    } catch (e) {
        return res.status(500).send( { message: getErrorMessage('Erreur lors de la connexion du joueur', e) } )
    }
}); 

function createToken(name, tag) {
    return jwt.sign(
        { name, tag },
        process.env.JWT_SECRET,
        { 
            algorithm: process.env.JWT_ALGORITHM, 
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
}

function logPlayer(player) {
    const token = createToken(player.name, player.tag);

    const playerNameTag = nametag({ name: player.name, tag: player.tag });
    playerToSocket.set(playerNameTag, { token });

    return {
        token, 
        name: player.name,
        tag: player.tag, 
        games: player.games, 
        score: player.score
    };
}

function canCreatePlayer(name, tag, password) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    if (!isCorrectPassword(password)) return false;
    return true;
}

function canUpdatePlayer(name, tag, update) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    if ((!update.password && !update.name) || update.tag != null || update._id != null || update.games != null) return false;
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
