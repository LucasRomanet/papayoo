class MutualGameStateDTO {
    constructor(code, status, discarding, discardSize, pool, cursedCard, maxPlayer, mustPlay, players, spectators) {
        this.code = code;
        this.status = status;
        this.discarding = discarding;
        this.discardSize = discardSize;
        this.pool = pool;
        this.cursedCard = cursedCard;
        this.maxPlayer = maxPlayer;
        this.mustPlay = mustPlay;
        this.players = players;
        this.spectators = spectators;
    }

    toJSON() {
        return {
            code: this.code,
            status: this.status,
            discarding: this.discarding,
            discardSize: this.discardSize,
            pool: this.pool,
            cursedCard: this.cursedCard,
            maxPlayer: this.maxPlayer,
            mustPlay: this.mustPlay,
            players: Array.from(this.players.values()),
            spectators: Array.from(this.spectators.values())
        }
    }
}

module.exports = MutualGameStateDTO;