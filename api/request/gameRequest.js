const express = require('express');

const { PLAYER_DOESNT_EXIST, PLAYER_IN_GAME, PLAYER_NOT_ONLINE,
    PLAYER_IN_OTHER_GAME, GAME_CODE_UNKNOWN,
    GAME_IS_FULL, GAME_IS_ALREADY_STARTED, PLAYER_ALREADY_IN_GAME } = require("../utils/error/messagesConsts");

const { PapayooError, getErrorMessage } = require("../utils/error/PapayooError");
const router = express.Router();
const { loggedUserMiddleware } = require('./loggedUserMiddleware');

const Game = require('../model/bo/Game');

const gameStatus = require('../model/enum/GameStatus');
const { toGameDTO } = require('../mapper/GameMapper');
const { currentGame, createJoinCode } = require("../utils/helper/gameHelper");
const { notify, leaveGame } = require('../utils/helper/socketHelper');
const { nametag } = require('../model/bo/User');
const { loggedUsers } = require("../utils/helper/gameHelper");


router.post('/', loggedUserMiddleware, (req, res) => {
    try {
        const user = req.user;
        
        if (!canCreateGame(user)) {
            return res.status(400).send();
        }

        const gameCode = createJoinCode(6);
        const game = new Game(gameCode);

        currentGame.set(gameCode, game);

        user.playingGame = gameCode;

        notify(gameCode);
        return res.json(gameCode);
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            console.error(e);
        }
        return res.status(500).send( { message: getErrorMessage('Erreur lors de la création de la partie', e) } )
    }
});

router.post('/:gameCode', loggedUserMiddleware, (req, res) => {
    try {
        const { gameCode } = req.params;
        const user = req.user;
        if (!canJoinGame(user, gameCode)) {
            return res.status(400).send();
        }

        const game = currentGame.get(gameCode);
        game.addPlayer(user);

        notify(gameCode);
        const userNameTag = user.nametag();
        const gameDTO = toGameDTO(game, userNameTag);

        return res.json(gameDTO);
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            console.error(e);
        }
        return res.status(500).send( { message: getErrorMessage('Erreur lors l\'ajout du joueur dans la partie', e) } )
    }
});


router.post('/leave', loggedUserMiddleware, async (req, res) => {
    /* json format awaited:
    {}
    */
    try {
        const user = loggedUsers.get(nametag(req.user.name, req.user.tag));

        if (!user) {
            throw new PapayooError(PLAYER_DOESNT_EXIST);
        }

        leaveGame(user);
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            console.error(e);
        }
        return res.status(500).send( { message: getErrorMessage('Erreur lors de la connexion du joueur', e) } )
    }
}); 

function canCreateGame(user) {
    if (user.socket == null) {
        throw new PapayooError(PLAYER_NOT_ONLINE);
    }

    return true;
}

function canJoinGame(user, gameCode) {
    if (!gameCode) return false;

    if (!currentGame.has(gameCode)) {
        throw new PapayooError(GAME_CODE_UNKNOWN);
    }

    const userNameTag = user.nametag();
    const game = currentGame.get(gameCode);
    if (game.countUsers() === game.maxUser && !game.players.has(userNameTag) && !game.spectators.has(userNameTag)) {
        throw new PapayooError(GAME_IS_FULL);
    }

    if (game.players.has(userNameTag) || game.spectators.has(userNameTag)) {
        throw new PapayooError(PLAYER_ALREADY_IN_GAME);
    }


    if (game.status !== gameStatus.WAITING) {
        throw new PapayooError(GAME_IS_ALREADY_STARTED);
    }

    return true;
}

module.exports = router;
