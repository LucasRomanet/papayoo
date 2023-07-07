class LoggedUserDTO {
    constructor(token, name, tag, gamesPlayed, score) {
        this.token = token;
        this.name = name;
        this.tag = tag;
        this.gamesPlayed = gamesPlayed;
        this.score = score;
    }

    toJSON() {
        return {
            token: this.token,
            name: this.name,
            tag: this.tag,
            gamesPlayed: this.gamesPlayed,
            score: this.score
        }
    }
}

module.exports = LoggedUserDTO;