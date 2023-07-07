const Card = require('./Card');

class PlayedCard extends Card {
    constructor(id, number, color, userNameTag) {
        super(id, number, color);
        this.userNameTag = userNameTag;
    }
}

module.exports = PlayedCard;