const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { LoggedUserDTO } = require('../utils/game.js');

const { getAllUsers, isUserExist, getOneUser, createUser, isCorrectName, isCorrectTag, isCorrectPassword } = require("../model/helpers/userHelper");

const { currentUser, userToSocket, User, nametag } = require("../utils/game.js");

const { PLAYER_DOESNT_EXIST, PLAYER_IS_IN_GAME } = require("../utils/errors/messagesConsts");
const { PapayooError, getErrorMessage } = require("../utils/errors/PapayooError");

// this is our get method
// this method fetches all available data in our database
router.get('/', async (req, res) => {
    try {
        const users = await getAllUsers();
        return res.json(users);
    } catch (e) {
        return res.status(500).json( { message: getErrorMessage('Erreur lors de la récupération des joueurs', e) } )
    }
});

// this is our create method
// this method adds new data in our database
router.post('/register', async (req, res) => {
    try {
        const { name, tag, password } = req.body;
        if (!canCreateUser(name, tag, password)) {
            return res.status(400).send();
        }

        if (await isUserExist({ name, tag })) {
            throw new PapayooError('Couple nom/tag indisponible.')
        }

        const createdUser = await createUser({ name, tag, password }, { '_id': 0, '__v': 0, 'password': 0 });

        const createdUserNametag = nametag(createdUser);

        currentUser.set(createdUserNametag, new User(createdUser.name, createdUser.tag, createdUser.games, createdUser.score))

        return res.json(logUser(createdUser));
    } catch (e) {
        return res.status(500).json( { message: getErrorMessage('Erreur lors de la création du joueur', e) } )
    }
});

router.post('/login',async (req, res) => {
    /* json format awaited:
    {
        name: string,
        tag: string,
        password : string
    }
    returns token
    */
    try {
        const { name, tag, password } = req.body;
        if (!canLogin(name, tag, password)) {
            return res.status(400).send();
        }
        const userNameTag = nametag({ name, tag });
        const user = await getOneUser({ name, tag }, { '_id': 0, '__v': 0 });

        if (!user) {
            throw new PapayooError(PLAYER_DOESNT_EXIST);
        }

        if (userToSocket.has(userNameTag)) {
            userToSocket.delete(userNameTag);
        }
        
        currentUser.set(userNameTag, new User(user.name, user.tag, user.games, user.score));

        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
            throw new PapayooError('Mot de passe incorrect');
        }
        // Return the logged user
        return res.json(logUser(user));
    } catch (e) {
        return res.status(500).send( { message: getErrorMessage('Erreur lors de la connexion du joueur', e) } )
    }
}); 

function createToken(name, tag) {
    return jwt.sign(
        { name, tag },
        process.env.JWT_SECRET,
        { 
            algorithm: process.env.JWT_ALGORITHM, 
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
}

function logUser(user) {
    const token = createToken(user.name, user.tag);

    const userNameTag = nametag({ name: user.name, tag: user.tag });
    userToSocket.set(userNameTag, { token });

    return new LoggedUserDTO(token, user.name, user.tag, user.games, user.score);
}

function canCreateUser(name, tag, password) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    if (!isCorrectPassword(password)) return false;
    return true;
}

function canUpdateUser(name, tag, update) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    if ((!update.password && !update.name) || update.tag != null || update._id != null || update.games != null) return false;
    return true;
}

function canLogin(name, tag, password) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    if (!isCorrectPassword(password)) return false;
    return true;
}

function canUpdateUser(name, tag, password, update) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    if (!isCorrectPassword(password)) return false;
    if ((!update.password && !update.name) || update.tag != null || update._id != null || update.games != null) return false;
    return true;
}


module.exports = router;
