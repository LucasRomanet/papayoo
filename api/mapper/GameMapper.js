const MutualGameStateDTO = require('../model/dto/MutualGameStateDTO.js');
const IndividualGameStateDTO = require('../model/dto/IndividualGameStateDTO.js');
const GameDTO = require('../model/dto/GameDTO.js');
const { toCardDTO } = require('./CardMapper.js');
const { toPlayedCardDTOArray } = require('./PlayedCardMapper.js');
const { toPlayerDTO } = require('./PlayerMapper.js');

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