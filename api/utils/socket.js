
const { userToSocket, currentGame, gameStatus, nametag, shuffle, toGameDTO } = require("../utils/game.js");



function notify(gameCode){
    let game = currentGame.get(gameCode);
    if (!game)
        return;
    
    for (const userNameTag of game.getPlayersAndSpectators().keys()){

        const userSocket = userToSocket.get(userNameTag);

        if (userSocket == null || userSocket.socket == null)
            continue;

        const gameDTO = toGameDTO(game, userNameTag);

        // Send game information
        userSocket.socket.emit("notify", JSON.stringify(gameDTO));
    }
}

function flick(game) {
    const prec = null;
    for (let player of game.players.values()) {
        if (prec != null) {
            player.hand = player.hand.concat(prec.handFlick);
            prec.handFlick = [];
        }
        prec = player;
    }

    // For the first player
    const player = game.players.values().next().value;
    player.hand = player.hand.concat(prec.handFlick);
    prec.handFlick = [];
    
    // Update the game
    game.flicked = true;
    game.mustPlay = game.players.values().next().value.nametag();
    game.cursedCardId = Math.round(Math.random() * (5 - 2) + 2) * 10 + 6;

    notify(gameCode);
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
    return id != item.id;
}

function includeCardColor(card, color){
    if(card.color == color){
        return true;
    }
    return false;
}

function shufflePlayer(game) {
    let newMapKeys = new Array();
    let newMapValues = new Map();
    for (let playerNameTag of game.players.keys()){
        newMapKeys.push(playerNameTag);
        newMapValues.set(playerNameTag, game.players.get(playerNameTag));
    }
    newMapKeys = shuffle(newMapKeys);
    game.players = new Map();
    for (let playerNameTag of newMapKeys){
        let player = newMapValues.get(playerNameTag);
        player.points = 0;
        game.players.set(playerNameTag, player);
    }
}

module.exports = {notify, includeCardColor, includeCardId, includeOneCardId, flick, shufflePlayer};