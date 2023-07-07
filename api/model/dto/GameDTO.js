class GameDTO {
    constructor(mutual, individual) {
        this.mutual = mutual;
        this.individual = individual;
    }

    toJSON() {
        return {
            mutual: this.mutual,
            individual: this.individual
        }
    }
}

module.exports = GameDTO;