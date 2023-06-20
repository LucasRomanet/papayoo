const sock = require('socket.io');
const bcrypt = require('bcrypt');
const {playerToSocket, socketToPlayer, nametag, currentPlayer, currentGame, currentGamesHands, gameStatus} = require("../utils/game.js");
const {loadGameSocket} = require("./gameSocket");
const { notify, setNextPlayer} = require('../utils/socket.js');

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
                name: string,
                tag: string,
                token: string
            }
            */
            if(currentPlayer.has(nametag(data))){
                if(playerToSocket.has(nametag(data))){
                    if(playerToSocket.get(nametag(data)).token != null){
                        let match = await bcrypt.compare(playerToSocket.get(nametag(data)).token, data.token);
                        if(match){
                            playerToSocket.delete(nametag(data));
                            playerToSocket.set(nametag(data), {socket : socket, token : data.token, player : currentPlayer.get(nametag(data))});
                            socketToPlayer.set(socket, {token : data.token, player : currentPlayer.get(nametag(data))});
                            loadGameSocket(socket);
                        }
                    }
                }
            }
        });

        socket.on('disconnect', () => {
            /* format awaited: null */
            if(socketToPlayer.has(socket)){
                let player = currentPlayer.get(nametag(socketToPlayer.get(socket).player));
                let code = player.playingGame;
                if(code != ""){
                    currentPlayer.get(nametag(player)).playingGame = "";
                    socketToPlayer.delete(socket);
                    playerToSocket.delete(nametag(player));
                    if(currentGame.has(code) && currentGame.get(code).player.has(nametag(player))){
                        currentGame.get(code).player.delete(nametag(player));
                        if(currentGamesHands.has(code)){
                            currentGamesHands.get(code).delete(nametag(player));
                            if(currentGame.get(code).mustPlay == nametag(player)){
                                setNextPlayer(currentGame.get(code), nametag(player));
                            }
                        }
                        notify(code);
                    }
                }
            }
        });
    });
}


module.exports = {initSocket};
