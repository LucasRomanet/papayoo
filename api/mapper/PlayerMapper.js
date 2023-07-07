const PlayerDTO = require('../model/dto/PlayerDTO.js');
const { toUserDTO } = require('./UserMapper.js');

function toPlayerDTO(player) {
    if (player == null) {
        return null;
    }
    return new PlayerDTO(toUserDTO(player.user), player.points);
}

module.exports = { toPlayerDTO };