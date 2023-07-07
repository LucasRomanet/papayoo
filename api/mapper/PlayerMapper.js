const PlayerDTO = require('../model/dto/PlayerDTO');
const { toUserDTO } = require('./UserMapper');

function toPlayerDTO(player) {
    if (player == null) {
        return null;
    }
    return new PlayerDTO(toUserDTO(player.user), player.points);
}

module.exports = { toPlayerDTO };