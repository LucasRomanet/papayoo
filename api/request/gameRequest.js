const express = require('express');

const { PLAYER_DOESNT_EXIST, PLAYER_IN_GAME, PLAYER_NOT_ONLINE,
    PLAYER_IN_OTHER_GAME, GAME_CODE_UNKNOWN,
    GAME_IS_FULL, GAME_IS_ALREADY_STARTED } = require("../utils/errors/messagesConsts");

const { PapayooError, getErrorMessage } = require("../utils/errors/PapayooError");
const { isCorrectName, isCorrectTag } = require("../model/helpers/userHelper");
const router = express.Router();
const { loggedUserMiddleware } = require('./loggedUserMiddleware');

const { currentGame, currentUser,userToSocket, Game, createJoinCode, nametag, gameStatus, toGameDTO } = require("../utils/game.js");
const { notify } = require('../utils/socket.js');


router.post('/', loggedUserMiddleware, (req, res) => {
    try {
        const { name, tag } = req.user;
        
        if (!canCreateGame(name, tag)) {
            return res.status(400).send();
        }

        const gameCode = createJoinCode(6);
        const game = new Game(gameCode);
        currentGame.set(gameCode, game);

        const userNameTag = nametag({ name, tag });
        let host = currentUser.get(userNameTag);
        host.playingGame = gameCode;

        notify(gameCode);
        return res.json(gameCode);
    } catch (e) {
        return res.status(500).send( { message: getErrorMessage('Erreur lors de la création de la partie', e) } )
    }
});

router.post('/:gameCode', loggedUserMiddleware, (req, res) => {
    try {
        const { gameCode } = req.params;
        const { name, tag } = req.user;
        if (!canJoinGame(name, tag, gameCode)) {
            return res.status(400).send();
        }
        const userNameTag = nametag({ name, tag });

        const joiningUser = currentUser.get(userNameTag);
        const game = currentGame.get(gameCode);

        joiningUser.playingGame = gameCode;
        game.addPlayer(joiningUser);

        notify(gameCode);
        const gameDTO = toGameDTO(game, userNameTag);

        return res.json(gameDTO);
    } catch (e) {
        console.log(e);
        return res.status(500).send( { message: getErrorMessage('Erreur lors l\'ajout du joueur dans la partie', e) } )
    }
});

function canCreateGame(name, tag) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;

    const userNameTag = nametag({ name, tag });


    if (!currentUser.has(userNameTag)) {
        throw new PapayooError(PLAYER_DOESNT_EXIST);
    }

    if (!userToSocket.has(userNameTag)) {
        throw new PapayooError(PLAYER_NOT_ONLINE);
    }

    return true;
}

function canJoinGame(name, tag, gameCode) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    if (!gameCode) return false;

    if (!currentGame.has(gameCode)) {
        throw new PapayooError(GAME_CODE_UNKNOWN);
    }

    const userNameTag = nametag({ name, tag });
    if (!currentUser.has(userNameTag)) {
        throw new PapayooError(PLAYER_DOESNT_EXIST);
    }

    const game = currentGame.get(gameCode);
    if (game.countUsers() === game.maxUser && !game.players.has(userNameTag)) {
        throw new PapayooError(GAME_IS_FULL);
    }


    if (game.status !== gameStatus.WAITING) {
        throw new PapayooError(GAME_IS_ALREADY_STARTED);
    }

    return true;
}

module.exports = router;
