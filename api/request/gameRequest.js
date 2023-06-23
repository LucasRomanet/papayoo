const express = require('express');

const { PLAYER_DOESNT_EXIST, PLAYER_IN_GAME, PLAYER_NOT_ONLINE,
    PLAYER_IN_OTHER_GAME, INCORRECT_TOKEN, GAME_CODE_UNKNOWN,
    GAME_IS_FULL, GAME_IS_ALREADY_STARTED } = require("../utils/errors/messagesConsts");

const { PapayooError, getErrorMessage } = require("../utils/errors/PapayooError");
const { isCorrectName, isCorrectTag } = require("../model/helpers/playerHelper");
const router = express.Router();
const { loggedUserMiddleware } = require('./loggedUserMiddleware');

const { currentGame, currentPlayer,playerToSocket, Game, makeJoinCode, nametag, isInGame, isInGameWithExclusion, gameToJson, gameStatus } = require("../utils/game.js");
const { notify } = require('../utils/socket.js');


router.post('/', loggedUserMiddleware, (req, res) => {
    /* turns:
    {
        maxplayer: int,
        code: string,
        player: [],
        status: int
    }
    */
    try {
        const { name, tag } = req.user;
        if (!canCreateGame(name, tag)) {
            return res.status(400).send();
        }

        const playerNameTag = nametag({ name, tag });

        const gameCode = makeJoinCode(6);
        const game = new Game(gameCode, playerNameTag);
        currentGame.set(gameCode, game);

        const ownerPlayer = currentPlayer.get(playerNameTag);
        ownerPlayer.playingGame = gameCode;

        // TODO Verifier qu'on doit la retourner
        res.json(JSON.parse(gameToJson(game)));
        notify(gameCode);
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

        const playerNameTag = nametag({ name, tag });

        const joinedPlayer = currentPlayer.get(playerNameTag);
        const game = currentGame.get(gameCode);

        joinedPlayer.playingGame = gameCode;
        game.player.set(playerNameTag, joinedPlayer);

        // TODO Verifier qu'on doit la retourner
        res.json(JSON.parse(gameToJson(game)));
        notify(gameCode);
    } catch (e) {
        return res.status(500).send( { message: getErrorMessage('Erreur lors l\'ajout du joueur dans la partie', e) } )
    }
});

function canCreateGame(name, tag) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;

    const playerNameTag = nametag({ name, tag });

    if (!currentPlayer.has(playerNameTag)) {
        throw new PapayooError(PLAYER_DOESNT_EXIST);
    }

    if (isInGame(playerNameTag)) {
        throw new PapayooError(PLAYER_IN_GAME);
    }

    if (!playerToSocket.has(playerNameTag)) {
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

    const playerNameTag = nametag({ name, tag });
    if (!currentPlayer.has(playerNameTag)) {
        throw new PapayooError(PLAYER_DOESNT_EXIST);
    }

    const game = currentGame.get(gameCode);
    if (game.player.size === game.maxPlayer && !game.player.has(playerNameTag)) {
        throw new PapayooError(GAME_IS_FULL);
    }

    if (isInGameWithExclusion(playerNameTag, gameCode)) {
        throw new PapayooError(PLAYER_IN_OTHER_GAME);
    }

    if (game.status !== gameStatus.WAITING) {
        throw new PapayooError(GAME_IS_ALREADY_STARTED);
    }

    return true;
}

module.exports = router;
