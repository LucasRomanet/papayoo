const sock = require('socket.io');
const UserModel = require('../model/User');
const { userToSocket, currentUser, currentGame, gameStatus, distributeCard, nametag, PlayedCard, cardsColors } = require("../utils/game.js");
const { notify, includeCardColor, includeCardId, includeOneCardId, discard, shufflePlayer, } = require("../utils/socket.js");
const { MIN_PLAYER_TO_START } = require('../utils/const.js');

function loadGameSocket(socket){

    socket.on('start', (data)=>{
        /* format awaited:
        {
            gameCode: string
        }*/
        const user = socket.user;
        if (user == null) {
            return;
        }

        const { gameCode } = data;
        const game = currentGame.get(gameCode);
        if (game == null) {
            return;
        }

        const hostNameTag = game.getHost().nametag;
        if (hostNameTag == nametag(user) && game.players.size >= MIN_PLAYER_TO_START) {
            game.status = gameStatus.PLAYING;
            distributeCard(game);
            shufflePlayer(game);
            notify(gameCode);
        }
    });
    
    socket.on('ask', ()=> {
        const user = socket.user;
        if (user != null && user.playingGame != "") {
            notify(user.playingGame);
        }
    });

    socket.on('discard', (data)=>{
        /* format awaited:
        {
            gameCode: string,
            array cards : {
                        id: id,
                        number: i,
                        color: j
                    }
        }*/
        const user = socket.user;
        if (user == null) {
            return;
        }
        
        const { gameCode, cards } = data;
        const game = currentGame.get(gameCode);
        if (game == null) {
            return;
        }

        const player = game.players.get(nametag(user));
        if (player == null) {
            return;
        }

        let nbToBeDiscarded = 0;
        switch(game.players.size){
            case 3 :
            case 4 : nbToBeDiscarded = 5; break;
            case 5 : nbToBeDiscarded = 4; break;
            default : nbToBeDiscarded = 3;
        }

        if (!game.discarding || player.hasDiscarded() || cards.length != nbToBeDiscarded) {
            return;
        }

        for (let card in cards){
            if (!includeCardId(card.id, player.hand)){
                return;
            }
        }

        player.discardPile = cards;
        player.hand = player.hand.filter(card => !includeCardId(card.id, cards));

        for (let playerToBeChecked of game.players.values()) {
            if (!playerToBeChecked.hasDiscarded()) {
                return;
            }
        }

        discard(game);
    });

    socket.on('play', (data)=>{
        /* format awaited:
        {
            gameCode: string,
            card : {
                        id: id,
                        number: i,
                        color: j
                    }
        }*/
        let user = socket.user;
        if (user == null) {
            return;
        }

        const { gameCode, card } = data;
        let game = currentGame.get(gameCode);
        if (game == null || game.discarding) {
            return;
        }
        
        const player = game.players.get(nametag(user));
        if (player == null) {
            return;
        }

        let askedColor;
        if (game.pool.length < 1){
            askedColor = card.color;
        } else {
            askedColor = game.pool[0].color;
        }

        // Check if it's the player's turn
        if (game.mustPlay !== player.nametag()) {
            return;
        }

        // Check if the player can play this card
        const hasColorInHand = player.hand.filter(item => includeCardColor(item, askedColor)).length > 0;
        const canPlayThisCard = includeCardId(card.id, player.hand) && hasColorInHand && card.color == askedColor
        if (!canPlayThisCard) {
            return;
        }

        // Stack to the pile of played cards
        const playedCard = new PlayedCard(card.id, card.number, card.color, nametag(user));
        game.pool.push(playedCard);
        player.hand = player.hand.filter(item => includeOneCardId(playedCard.id, item));
        
        if (game.pool.length >= game.players.size) {
            checkWinnerOfRound(game, askedColor);
        } else {
            game.setNextPlayer();
        }
        notify(gameCode);
    });


    socket.on('message', (data)=>{
        /* format awaited:
        {
            gameCode: string,
            text : string
        }*/
        const user = socket.user;
        if (user == null) {
            return;
        }

        const { gameCode, text } = data;
        if (text == null) {
            return;
        }

        const game = currentGame.get(gameCode);
        if (game == null) {
            return;
        }

        const jsonMessage = JSON.stringify({ userNameTag: nametag(user), text: text });
        for (const someone of game.getPlayersAndSpectators().values()){
            userToSocket.get(someone.nametag()).socket.emit("message", jsonMessage);
        }
    });

}

function checkWinnerOfRound(game, askedColor) {
    
    // Retrieve the losing card
    let losingCard = null;
    game.pool.filter(item => includeCardColor(item, askedColor))
        .forEach(card => {
            if (losingCard == null || card.number > losingCard.number){
                losingCard = card;
            }
        });
    
    // Update points of players
    for (let player of game.players.values()) {
        if (player.nametag() != losingCard.userNameTag) {
            return;
        }

        // Count the points of player
        let points = 0;
        if (includeCardId(game.cursedCard.id, game.pool)){
            points += 40;
        }

        game.pool.filter(item => includeCardColor(item, cardsColors.PAYOO))
            .forEach(element => points += element.number);
        
        // Add the points
        player.addPoints(points);
    }

    game.mustPlay = null;
    setTimeout(() => {
        if (player.hand.length >= 1) {
            startNextRound(game, losingCard.userNameTag);
        } else {
            endGame(game);
        }
    }, 1300);
}

function startNextRound(game, userNameTag) {
    game.mustPlay = userNameTag;
    notify(game.code);
}

function endGame(game) {
    game.pool = new Array();
    game.status = gameStatus.ENDING;

    // Update score of players
    for (let player of game.players.values()){
        UserModel.find({name : player.user.name, tag: player.user.tag}, {'_id': 0, '__v': 0, 'password': 0})
            .exec((err, data) => {
                if (err || !data.length){
                    return;
                } else {
                    return UserModel.updateOne({
                        name: player.user.name, 
                        tag: player.user.tag
                    },
                    {
                        score: parseInt(data[0].score) + player.points,
                        games: parseInt(data[0].games) + 1
                    }, (err) => {
                        if (err) {
                            return;
                        }
                    });
                }
            });
    }

    // End the game
    notify(game.code);
    for (const user of game.getPlayersAndSpectators().values()){
        currentUser.get(nametag(user)).playingGame = "";
    }
    currentGame.delete(game.code);
}

module.exports = {loadGameSocket};
