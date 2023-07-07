const Player = require('./Player');
const gameStatus = require('../enum/GameStatus');

class Game {
    constructor(code) {
        this.code = code;
        this.status = gameStatus.WAITING;
        this.discarding = true;
        this.discardSize = 5;
        this.pool = new Array();
        this.cursedCard = null;
        this.maxPlayer = 8;
        this.players = new Map();
        this.spectators = new Map();
        this.mustPlay = null;
    }

    getHost() {
        for(const [nametag, player] of this.players){
            if (player.isHost) {
                return {nametag, player};
            }
        }
        return null;
    }

    addPlayer(user) {
        const player = new Player(user);
        player.isHost = this.players.size === 0;
        player.playingGame = this.code;
        this.players.set(user.toString(), player);
    }

    removePlayer(nametag) {
        if (!this.players.has(nametag)) {
            return false;
        }
        const removedPlayer = this.players.get(nametag);
        removedPlayer.playingGame = "";
        this.players.delete(nametag);

        // Update the host
        if (removedPlayer.isHost && this.players.size !== 0) {
            this.players.values().next().value.isHost = true;
        }

        // Update neighbor of the previous player
        if (removedPlayer.neighbor != null && this.players.size != null) {
            for (const player of this.players.values()) {
                if (player.neighbor === removedPlayer.nametag()) {
                    player.neighbor = removedPlayer.neighbor;
                    break;
                }
            }
        }

        return true;
    }

    countUsers() {
        return this.players.size + this.spectators.size;
    }

    getPlayersAndSpectators() {
        return new Map([...this.players, ...this.spectators]);
    }

    setNextPlayer() {
        this.mustPlay = this.players.get(this.mustPlay).neighbor;
    }

}

module.exports = Game;