const jwt = require('jsonwebtoken');
const { LOGIN_REQUIRED, INCORRECT_TOKEN } = require('../utils/errors/messagesConsts');
const { PapayooError } = require('../utils/errors/PapayooError');
const { playerToSocket, nametag } = require("../utils/game.js");

function loggedUserMiddleware(req, res, next) {
    const authorization = req.header('Authorization');
    if (authorization == null) {
        return res.status(500).send( { message: LOGIN_REQUIRED });
    }

    // Récupérer l'utilisateur à partir du token
    const token = extractToken(authorization);
    let decoded;
    try {
        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithm: process.env.JWT_ALGORITHM }
        );
    } catch (err) {
        return res.status(500).send( { message: INCORRECT_TOKEN });
    }

    const { name, tag } = decoded;
    if (name == null || name == '' || tag == null || tag == '') {
        return res.status(500).send( { message: INCORRECT_TOKEN });
    }

    const playerNameTag = nametag({ name, tag });
    if (token !== playerToSocket.get(playerNameTag).token) {
        return res.status(500).send( { message: INCORRECT_TOKEN });
    }

    // TODO Vérifier que l'utilisateur existe en BDD

    req.user = { name, tag };
    next();
}

function extractToken(authorization) {
    if (authorization == null) {
        return '';
    }
    return authorization.replace('Bearer ', '');
}

module.exports = { loggedUserMiddleware, extractToken };