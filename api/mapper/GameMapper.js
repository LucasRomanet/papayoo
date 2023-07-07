const MutualGameStateDTO = require('../model/dto/MutualGameStateDTO');
const IndividualGameStateDTO = require('../model/dto/IndividualGameStateDTO');
const GameDTO = require('../model/dto/GameDTO');
const { toCardDTO } = require('./CardMapper');
const { toPlayedCardDTOArray } = require('./PlayedCardMapper');
const { toPlayerDTO } = require('./PlayerMapper');

function toGameDTO(game, nametag) {
    if (game == null) {
        return null;
    }

    const isSpectator = false;
    const player = game.players.get(nametag);
    if (player == null) {
        isSpectator = true;
        player = game.spectators.get(nametag);
        if (player == null) {
            return null;
        }
    }

    // MutualGameStateDTO
    const players = new Map();
    for (let [nametag, player] of game.players) {
        players.set(nametag, toPlayerDTO(player));
    }

    const spectators = new Map();
    for (let [nametag, player] of game.spectators) {
        spectators.set(nametag, toPlayerDTO(player));
    }

    const mutualGameStateDTO = new MutualGameStateDTO(game.code, game.status, game.discarding, game.discardSize, toPlayedCardDTOArray(game.pool), toCardDTO(game.cursedCard), game.maxPlayer, game.mustPlay, players, spectators);

    // IndividualGameStateDTO
    const individualGameStateDTO = new IndividualGameStateDTO(toPlayedCardDTOArray(player.hand), player.isHost, isSpectator, toPlayedCardDTOArray(player.discardPile), player.neighbor);

    // GameDTO
    return new GameDTO(mutualGameStateDTO, individualGameStateDTO);
}

module.exports = { toGameDTO }; 