const CardDTO = require('./CardDTO');

class PlayedCardDTO extends CardDTO {
    constructor(id, number, color, userNameTag) {
        super(id, number, color);
        this.userNameTag = userNameTag;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            userNameTag: this.userNameTag
        }
    }
}

module.exports = PlayedCardDTO;