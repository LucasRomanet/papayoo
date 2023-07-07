const jwt = require('jsonwebtoken');
const { LOGIN_REQUIRED, INCORRECT_TOKEN } = require('../utils/error/messagesConsts');
const { PapayooError } = require('../utils/error/PapayooError');
const { loggedUsers } = require("../utils/helper/gameHelper");

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

    const user = loggedUsers.getUser(name, tag, token);
    if (user == null) {
        return res.status(500).send( { message: INCORRECT_TOKEN });
    }

    // TODO Vérifier que l'utilisateur existe en BDD

    req.user = user;
    next();
}

function extractToken(authorization) {
    if (authorization == null) {
        return '';
    }
    return authorization.replace('Bearer ', '');
}

module.exports = { loggedUserMiddleware, extractToken };