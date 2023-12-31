const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/bo/User');
const { toLoggedUserDTO } = require('../mapper/UserMapper');
const { getAllUsers, isUserExist, getOneUser, createUser, isCorrectName, isCorrectTag, isCorrectPassword } = require("../utils/helper/userHelper");
const { loggedUsers } = require("../utils/helper/gameHelper");
const { PLAYER_DOESNT_EXIST } = require("../utils/error/messagesConsts");
const { PapayooError, getErrorMessage } = require("../utils/error/PapayooError");

// this is our get method
// this method fetches all available data in our database
router.get('/', async (req, res) => {
    try {
        const users = await getAllUsers();
        return res.json(users);
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            console.error(e);
        }
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

        return res.json(logUser(createdUser));
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            console.error(e);
        }
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
        const user = await getOneUser({ name, tag }, { '_id': 0, '__v': 0 });

        if (!user) {
            throw new PapayooError(PLAYER_DOESNT_EXIST);
        }

        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
            throw new PapayooError('Mot de passe incorrect');
        }

        // Return the logged user
        return res.json(logUser(user));
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            console.error(e);
        }
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

    const storedUser = new User(token, user.name, user.tag, user.games, user.score);
    if (!loggedUsers.addUser(storedUser)) {
        throw new PapayooError('Vous êtes déjà connecté');
    }

    return toLoggedUserDTO(storedUser);
}

function canCreateUser(name, tag, password) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    if (!isCorrectPassword(password)) return false;
    return true;
}

function canLogin(name, tag, password) {
    if (!isCorrectName(name)) return false;
    if (!isCorrectTag(tag)) return false;
    if (!isCorrectPassword(password)) return false;
    return true;
}


module.exports = router;
