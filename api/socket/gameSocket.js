const UserModel = require('../model/database/User');
const PlayedCard = require('../model/bo/PlayedCard.js');
const gameStatus = require('../model/enum/GameStatus.js');
const cardsColors = require('../model/enum/CardsColors.js');
const { toCardArray } = require('../mapper/CardMapper.js');
const { currentGame, distributeCard } = require("../utils/game.js");
const { notify, includeCardId, includeOneCardId, hasColorInHand, discard, shufflePlayer, } = require("../utils/socket.js");
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
        if (hostNameTag == user.nametag() && game.players.size >= MIN_PLAYER_TO_START) {
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

        const player = game.players.get(user.nametag());
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
        for (const card of cards){
            if (!includeCardId(card.id, player.hand)){
                return;
            }
        }

        player.discardPile = toCardArray(cards);
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
        
        const player = game.players.get(user.nametag());
        if (player == null || game.pool.filter(playedCard => playedCard.userNameTag === user.nametag()).length > 0) {
            return;
        }

        let requiredColor;
        if (game.pool.length < 1){
            requiredColor = card.color;
        } else {
            requiredColor = game.pool[0].color;
        }

        // Check if it's the player's turn
        if (game.mustPlay !== player.nametag()) {
            return;
        }

        const hasThisCard = includeCardId(card.id, player.hand);
        if (!hasThisCard) {
            return;
        }
        const canPlayThisCard = card.color == requiredColor || !hasColorInHand(requiredColor, player.hand);
        if (!canPlayThisCard) {
            return;
        }

        // Stack to the pile of played cards
        const playedCard = new PlayedCard(card.id, card.number, card.color, user.nametag());
        game.pool.push(playedCard);
        player.hand = player.hand.filter(item => includeOneCardId(playedCard.id, item));
        
        if (game.pool.length >= game.players.size) {
            checkWinnerOfRound(game, requiredColor);
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

        const jsonMessage = JSON.stringify({ userNameTag: user.nametag(), text: text });
        for (const someone of game.getPlayersAndSpectators().values()){
            someone.user.socket.emit("message", jsonMessage);
        }
    });

}

function checkWinnerOfRound(game, requiredColor) {

    let losingCard = game.pool[0];
    let points = 0;

    for (const card of game.pool) {
        if (card.color === requiredColor && card.number > losingCard.number) {
            losingCard = card;
        }

        if (card.color === cardsColors.PAYOO) {
            points += card.number;
        }
        else if (card.id === game.cursedCard.id) {
            points += 40;
        }
    }

    const losingPlayer = game.players.get(losingCard.userNameTag);
    losingPlayer.addPoints(points);
    
    setTimeout(() => {
        game.pool = [];
        
        if (game.players.values().next().value.hand.length >= 1) {
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
    game.mustPlay = null;
    game.pool = new Array();
    game.status = gameStatus.ENDING;

    // Store player score
    for (let player of game.players.values()){
        UserModel.findOneAndUpdate(
            { name: player.user.name, tag: player.user.tag },
            {
                $inc: { score: player.points },
                $inc: { games: 1 }
            }
        );
    }

    // End the game
    notify(game.code);
    for (const user of game.getPlayersAndSpectators().values()) {
        user.playingGame = "";
    }
    currentGame.delete(game.code);
}

module.exports = {loadGameSocket};
