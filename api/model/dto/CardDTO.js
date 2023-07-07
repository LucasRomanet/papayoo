class CardDTO {
    constructor(id, number, color) {
        this.id = id;
        this.number = number;
        this.color = color;
    }

    toJSON() {
        return {
            id: this.id,
            number: this.number,
            color: this.color
        }
    }
}

module.exports = CardDTO;