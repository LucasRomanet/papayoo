const UserModel = require("../User");

const { PLAYER_DOESNT_EXIST } = require("../../utils/errors/messagesConsts");
const { MIN_NAME_LENGTH, MAX_NAME_LENGTH, TAG_MIN, TAG_MAX, TAG_DIGITS } = require("../../utils/const");

const { PapayooError, getErrorMessage } = require("../../utils/errors/PapayooError");

async function getAllUsers(filter = {}, sort = {}) {
    try {
        return await UserModel.find(filter, getReturnedProperties()).sort(sort);
    } catch (e) {
        throw new PapayooError('Erreur lors de la récupération des joueurs');
    }
}

async function isUserExist(filter = {}) {
    try {
        const isExist = await UserModel.count(filter);
        return isExist > 0;
    } catch (e) {
        throw new PapayooError(getErrorMessage('Erreur lors de la vérification de l\existence du joueur', e));
    }
}

async function getOneUser(filter = {}, properties) {
    try {
        const user = await UserModel.findOne(filter, getReturnedProperties(properties));
        if (!user)
            throw new PapayooError(PLAYER_DOESNT_EXIST);
        return user;
    } catch (e) {
        throw new PapayooError(getErrorMessage('Erreur lors de la récupération du joueur', e));
    }
}

async function createUser(values) {
    try {
        const user = await UserModel.create(values);
        if (!user)
            throw Error();
        return user;
    } catch (e) {
        throw new PapayooError('Erreur lors de la création du joueur');
    }
}

async function updateOneUser(filter, values) {
    try {
        return (await UserModel.updateOne(filter, values)).nModified;
    } catch (e) {
        throw new PapayooError('Erreur lors de la modification du joueur');
    }
}

async function deleteOneUser(filter) {
    try {
        return (await UserModel.deleteOne(filter)).n;
    } catch (e) {
        throw new PapayooError('Erreur lors de la suppresion du joueur');
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

module.exports = { getAllUsers, isUserExist, getOneUser, createUser, updateOneUser, deleteOneUser, isCorrectName, isCorrectTag, isCorrectPassword };