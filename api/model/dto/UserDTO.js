class UserDTO {
    constructor(name, tag, gamesPlayed, score) {
        this.name = name;
        this.tag = tag;
        this.gamesPlayed = gamesPlayed;
        this.score = score;
    }

    toJSON() {
        return {
            name: this.name,
            tag: this.tag,
            gamesPlayed: this.gamesPlayed,
            score: this.score
        }
    }
}

module.exports = UserDTO;