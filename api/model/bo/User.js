class User {
    constructor(token, name, tag, gamesPlayed, score) {
        this.token = token;
        this.name = name;
        this.tag = tag;
        this.gamesPlayed = gamesPlayed;
        this.score = score;
        this.playingGame = "";
        this.socket = null;
    }

    nametag() {
        return User.nametag({ name: this.name, tag: this.tag});
    }

    toString() {
        return this.nametag();
    }

    static nametag({ name, tag }) {
        return `${name}#${tag}`;
    }
}

module.exports = User;