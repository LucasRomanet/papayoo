const PlayerModel = require("../../model/Player");

const { PLAYER_DOESNT_EXIST } = require("../../utils/error/messagesConsts");
const { MIN_NAME_LENGTH, MAX_NAME_LENGTH, TAG_MIN, TAG_MAX, TAG_DIGITS } = require("../../utils/const");

const { PapayooError, getErrorMessage } = require("../../utils/error/PapayooError");

async function getAllPlayers(filter = {}, sort = {}) {
    try {
        return await PlayerModel.find(filter, getReturnedProperties()).sort(sort);
    } catch (e) {
        throw new PapayooError('Erreur lors de la récupération des joueurs');
    }
}


async function getOnePlayer(filter = {}, properties) {
    try {
        const player = await PlayerModel.findOne(filter, getReturnedProperties(properties));
        if (!player)
            throw new PapayooError(PLAYER_DOESNT_EXIST);
        return player;
    } catch (e) {
        throw new PapayooError(getErrorMessage('Erreur lors de la récupération du joueur', e));
    }
}

async function createPlayer(values) {
    try {
        const player = await PlayerModel.create(values);
        if (!player)
            throw Error();
        return player;
    } catch (e) {
        throw new PapayooError('Erreur lors de la création du joueur');
    }
}

async function updateOnePlayer(filter, values) {
    try {
        return (await PlayerModel.updateOne(filter, values)).nModified;
    } catch (e) {
        throw new PapayooError('Erreur lors de la modification du joueur');
    }
}

async function deleteOnePlayer(filter) {
    try {
        return (await PlayerModel.deleteOne(filter)).n;
    } catch (e) {
        throw new PapayooError('Erreur lors de la suppresion du joueur');
    }
}

async function getNewTag(name) {
    try {
        const players = await getAllPlayers({ name }, { tag: 1 });
        if (!Array.isArray(players))
            throw new Error();

        let tag = TAG_MIN;
        while (tag <= TAG_MAX && tag <= players.length) {
            let currentPlayer = players[tag - TAG_MIN];
            let playerTag = parseInt(currentPlayer.tag);
            if (playerTag !== tag) {
                break;
            }
            tag++;
        }

        if (tag > TAG_MAX) {
            throw new PapayooError('Ce pseudonyme n\'est plus disponible');
        }

        const returnTag = ('0'.repeat(TAG_DIGITS) + tag);
        return returnTag.substr(returnTag.length - TAG_DIGITS);
    } catch (e) {
        throw new PapayooError(getErrorMessage('Erreur lors de la création d\'un tag', e));
    }
}

function isCorrectTag(tag) {
    return tag && !isNaN(tag) && tag.length === TAG_DIGITS && tag >= TAG_MIN && tag <= TAG_MAX;
}

function isCorrectName(name) {
    return name && name.length >= MIN_NAME_LENGTH && name.length <= MAX_NAME_LENGTH;
}

function isCorrectPassword(password) {
    return password && password.length > 0;
}

function getReturnedProperties(properties = null) {
    if (!properties) return {'_id': 0, '__v': 0, 'password': 0};
    return properties;
}

module.exports = { getAllPlayers, getOnePlayer, createPlayer, updateOnePlayer, deleteOnePlayer, getNewTag, isCorrectName, isCorrectTag, isCorrectPassword };