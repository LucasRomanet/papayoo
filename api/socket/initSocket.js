const sock = require('socket.io');
const { loggedUsers, currentGame } = require("../utils/game.js");
const { loadGameSocket } = require("./gameSocket");
const { notify } = require('../utils/socket.js');
const jwt = require('jsonwebtoken');

let io = null;

function initSocket(server){
    io = sock(server, {
        cors: {
            origin : "*",
            methods: ["GET","POST"]
        },
        path: "/api/ws"
    });

    io.on('connection', (socket)=>{
        socket.on('login', async (data)=>{
            /* format awaited:
            {
                token: string
            }
            */
            let decoded; // { name, tag }
            try {
                decoded = jwt.verify(
                    data.token,
                    process.env.JWT_SECRET,
                    { algorithm: process.env.JWT_ALGORITHM }
                );
            } catch (err) {
                console.error(err);
                return;
            }

            const user = loggedUsers.getUser(decoded.name, decoded.tag, data.token);
            if (user == null || user.socket != null){
                return;
            }
            
            user.socket = socket;
            socket.user = user;
            loadGameSocket(socket);
        });

        socket.on('disconnect', () => {
            /* format awaited: null */
            if (socket.user == null) {
                return;
            }

            const user = socket.user;
            const userNameTag = user.nametag();

            const gameCode = user.playingGame;
            user.playingGame = "";

            delete socket.user;

            // Remove player from the game
            if (gameCode == null) {
                return;
            }
            const game = currentGame.get(gameCode);
            if(game == null) {
                return;
            }

            if (game.removePlayer(userNameTag)) {
                if (game.mustPlay == userNameTag) {
                    game.setNextPlayer();
                }
            }

            if(game.players.size === 0) {
                currentGame.delete(gameCode);
            }

            loggedUsers.removeUser(user);
            
            notify(gameCode);
        });
    });
}


module.exports = {initSocket};
