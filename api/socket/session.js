const sock = require('socket.io');
const { loggedUsers, currentGame } = require("../utils/helper/gameHelper");
const { subscribeToGameEvents } = require("./game");
const { leaveGame } = require('../utils/helper/socketHelper');
const jwt = require('jsonwebtoken');


function subscribeToSessionEvents(server){
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
            subscribeToGameEvents(socket);
        });

        socket.on('disconnect', () => {
            /* format awaited: null */
            if (socket.user == null) {
                return;
            }

            leaveGame(user);
            delete socket.user;
        });
    });
}


module.exports = { subscribeToSessionEvents };
