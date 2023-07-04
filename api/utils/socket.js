
const { userToSocket, currentGame, shuffle, toGameDTO, Card, cardsColors } = require("../utils/game.js");

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

function discard(game) {
    // Manual first iteration
    const playersIterable = game.players.values();
    const firstPlayer = playersIterable.next().value;
    let previousPlayer = firstPlayer;

    // Iterate through every player except the first
    for (let player of playersIterable) {
        player.hand = player.hand.concat(previousPlayer.discardPile);
        previousPlayer.discardPile = [];
        previousPlayer = player;
    }

    // Last player of the iteration gives cards to first player
    firstPlayer.hand = firstPlayer.hand.concat(previousPlayer.discardPile); 
    previousPlayer.discardPile = [];
    
    // Update the game
    game.discarding = false;
    game.mustPlay = game.players.values().next().value.nametag();
    

    // Select random cursedCard
    const availableColors = Object.values(cardsColors).filter(color => color !== cardsColors.PAYOO);
    const cursedCardColorIndex = Math.floor(Math.random() * availableColors.length);
    game.cursedCard = new Card(-1, 7, availableColors[cursedCardColorIndex]);
    // TODO Supprimer => game.cursedCard = Math.round(Math.random() * (5 - 2) + 2) * 10 + 6;

    notify(game.code);
}

function includeCardId(id, cards){
    for(let card of cards.values()){
        if(card.id === id){
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

module.exports = {notify, includeCardColor, includeCardId, includeOneCardId, discard, shufflePlayer};