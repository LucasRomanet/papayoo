const PlayedCardDTO = require('../model/dto/PlayedCardDTO.js');

function toPlayedCardDTO(playedCard) {
    if (playedCard == null) {
        return null;
    }
    return new PlayedCardDTO(playedCard.id, playedCard.number, playedCard.color, playedCard.userNameTag);
}

function toPlayedCardDTOArray(playedCards) {
    if (!Array.isArray(playedCards)) {
        return null;
    }
    return playedCards.map(playedCard => toPlayedCardDTO(playedCard));
}

module.exports = { toPlayedCardDTO, toPlayedCardDTOArray };