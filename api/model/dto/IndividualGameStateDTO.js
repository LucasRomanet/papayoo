class IndividualGameStateDTO {
    constructor(hand, isHost, isSpectator, discardPile, neighbor) {
        this.hand = hand;
        this.isHost = isHost;
        this.isSpectator = isSpectator;
        this.discardPile = discardPile;
        this.neighbor = neighbor;
    }

    toJSON() {
        return {
            hand: this.hand,
            isHost: this.isHost,
            isSpectator: this.isSpectator,
            discardPile: this.discardPile,
            neighbor: this.neighbor
        }
    }
}

module.exports = IndividualGameStateDTO;