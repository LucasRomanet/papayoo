
const Card = require('../model/bo/Card.js');
const cardsColors = require('../model/enum/CardsColors.js');
const { toGameDTO } = require('../mapper/GameMapper.js');
const { currentGame, shuffle } = require("../utils/game.js");

function notify(gameCode){
    let game = currentGame.get(gameCode);
    if (!game)
        return;

    for (const player of game.getPlayersAndSpectators().values()){
        if (player.user.socket == null) {
            continue;
        }
        const gameDTO = toGameDTO(game, player.nametag());
        
        // Send game information
        player.user.socket.emit("notify", JSON.stringify(gameDTO));
    }
}

function discard(game) {

    // Pass discarded cards to the correct neighboring player
    for (let player of game.players.values()) {
        const neighbor = game.players.get(player.neighbor);
        player.hand = player.hand.concat(neighbor.discardPile);
        neighbor.discardPile = [];
    }

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
        if(card.id == id){
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

function hasColorInHand(color, hand){
    for (const card of hand) {
        if(card.color == color){
            return true;
        }
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
    let previous = newMapKeys.at(-1);
    for (let playerNameTag of newMapKeys){
        let player = newMapValues.get(playerNameTag);
        player.points = 0;
        player.neighbor = previous;
        game.players.set(playerNameTag, player);
        previous = playerNameTag;
    }
}

module.exports = {notify, includeCardColor, includeCardId, includeOneCardId, hasColorInHand, discard, shufflePlayer};