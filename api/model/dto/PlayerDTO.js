class PlayerDTO {
    constructor(user, points, isHost) {
        this.user = user;
        this.points = points;
        this.isHost = isHost;
    }

    toJSON() {
        return {
            user: this.user,
            points: this.points,
            isHost: this.isHost
        }
    }
}

module.exports = PlayerDTO;