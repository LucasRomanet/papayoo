const Card = require('../model/bo/Card');
const CardDTO = require('../model/dto/CardDTO');

function toCard(card) {
    if (card == null) {
        return null;
    }
    return new Card(card.id, card.number, card.color);
}

function toCardArray(cards) {
    if (!Array.isArray(cards)) {
        return null;
    }
    return cards.map(card => toCard(card));
}

function toCardDTO(card) {
    if (card == null) {
        return null;
    }
    return new CardDTO(card.id, card.number, card.color);
}

function toCardDTOArray(cards) {
    if (!Array.isArray(cards)) {
        return null;
    }
    return cards.map(card => toCardDTO(card));
}

module.exports = { toCard, toCardArray, toCardDTO, toCardDTOArray };