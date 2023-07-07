const Card = require('../../model/bo/Card');
const cardsColors = require('../../model/enum/CardsColors');
const { toGameDTO } = require('../../mapper/GameMapper');
const { currentGame } = require("./gameHelper");

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

function sendRoundResults(gameCode, loserNameTag, points){
    let game = currentGame.get(gameCode);
    if (!game)
        return;

    for (const player of game.getPlayersAndSpectators().values()){
        if (player.user.socket == null) {
            continue;
        }
        
        // Send round results
        player.user.socket.emit("results", JSON.stringify({loserNameTag, points}));
    }
}

function leaveGame(user) {
    const userNameTag = user.nametag();

    const gameCode = user.playingGame;
    user.playingGame = "";

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
}

module.exports = { notify, discard, sendRoundResults, leaveGame };