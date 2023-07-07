const UserDTO = require('../model/dto/UserDTO');
const LoggedUserDTO = require('../model/dto/LoggedUserDTO');

function toUserDTO(user) {
    if (user == null) {
        return null;
    }
    return new UserDTO(user.name, user.tag, user.gamesPlayed, user.score);
}

function toLoggedUserDTO(user) {
    if (user == null) {
        return null;
    }
    return new LoggedUserDTO(user.token, user.name, user.tag, user.gamesPlayed, user.score);
}

module.exports = { toUserDTO, toLoggedUserDTO };