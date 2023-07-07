class Player {
    constructor(user) {
        this.user = user;
        this.hand = [];
        this.points = 0;
        this.isHost = false;
        this.neighbor = "";
        this.discardPile = [];
    }

    nametag() {
        return this.user.nametag();
    }

    hasDiscarded() {
        return this.discardPile.length > 0;
    }

    addPoints(points) {
        this.points += points;
    }
}

module.exports = Player;