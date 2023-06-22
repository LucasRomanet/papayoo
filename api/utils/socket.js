
const {playerToSocket, currentGame,currentGamesHands,gameStatus, distributeCard, nametag, gameToJson, socketToPlayer, shuffle} = require("../utils/game.js");


function notify(gameCode){
    let game = currentGame.get(gameCode);
    if (!game)
        return;

    let json = gameToJson(game);

    for (let p of game.player.values()){
        const playerSocket = playerToSocket.get(nametag(p));
        if (!playerSocket)
            continue;
        
        if (game.status === gameStatus.PLAYING){
            hand = currentGamesHands.get(gameCode).get(nametag(p));
            json = JSON.stringify(Object.assign(JSON.parse(json),{hand : hand}));
        }

        if (playerSocket.socket) {
            playerSocket.socket.emit("notify", json);
        }
    }
}

function flick(gameCode){
    let arrflick = Array.from(currentGamesHands.get(gameCode).values()).pop().handFlick;
    for(let k of currentGamesHands.get(gameCode).keys()){
        currentGamesHands.get(gameCode).get(k).hand = currentGamesHands.get(gameCode).get(k).hand.concat(arrflick);
        arrflick = currentGamesHands.get(gameCode).get(k).handFlick;
    }
    currentGame.get(gameCode).flicked = true;
    currentGame.get(gameCode).mustPlay = nametag(currentGame.get(gameCode).player.values().next().value);//Array.from(currentGamesHands.get(gameCode).keys()).shift();
    currentGame.get(gameCode).IdCursedCard = Math.round(Math.random()*(5-2)+2)*10+6;
    notify(gameCode);
}

function setNextPlayer(game, nameTag){
    let next = true;
    for(let k of game.player.keys()){
        if(k == nameTag){
            next = true;
        }
        else if(next){
            game.mustPlay = k;
            next = false;
        }
    }
}

function includeCardId(id, tab){
    for(let c of tab.values()){
        if(c.id == id){
            return true;
        }
    }
    return false;
}
function includeOneCardId(id, item){
    if(id == item.id)
    return false;
    else return true;
}

function includeCardColor(card, color){
    if(card.color == color){
        return true;
    }
    return false;
}

function shufflePlayer(gameCode){
    let newMapKeys = new Array();
    let newMapValues = new Map();
    for(let k of currentGame.get(gameCode).player.keys()){
        newMapKeys.push(k);
        newMapValues.set(k, currentGame.get(gameCode).player.get(k));
    }
    newMapKeys = shuffle(newMapKeys);
    currentGame.get(gameCode).player = new Map();
    for(let element of newMapKeys){
        currentGame.get(gameCode).player.set(element, newMapValues.get(element));
        currentGame.get(gameCode).playerScores.push({player: element, score : 0});
    }
}

module.exports = {notify, includeCardColor, includeCardId, includeOneCardId, flick, setNextPlayer, shufflePlayer};