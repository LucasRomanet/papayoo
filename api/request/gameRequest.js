const express = require('express');

const { PLAYER_DOESNT_EXIST, PLAYER_IN_GAME, PLAYER_NOT_ONLINE,
    PLAYER_IN_OTHER_GAME, GAME_CODE_UNKNOWN,
    GAME_IS_FULL, GAME_IS_ALREADY_STARTED, PLAYER_ALREADY_IN_GAME } = require("../utils/errors/messagesConsts");

const { PapayooError, getErrorMessage } = require("../utils/errors/PapayooError");
const { isCorrectName, isCorrectTag } = require("../utils/helpers/userHelper");
const router = express.Router();
const { loggedUserMiddleware } = require('./loggedUserMiddleware');

const Game = require('../model/bo/Game.js');

const gameStatus = require('../model/enum/GameStatus.js');
const { toGameDTO } = require('../mapper/GameMapper.js');
const { currentGame, loggedUsers, createJoinCode } = require("../utils/game.js");
const { notify } = require('../utils/socket.js');


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

function canCreateGame(user) {
    const userNameTag = user.nametag();

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
