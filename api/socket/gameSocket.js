const sock = require('socket.io');
const UserModel = require('../model/User');
const { userToSocket, currentUser, currentGame, gameStatus, distributeCard, nametag } = require("../utils/game.js");
const { notify, includeCardColor, includeCardId, includeOneCardId, flick, shufflePlayer } = require("../utils/socket.js");
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
    socket.on('flick', (data)=>{
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

        let nbToBeFlicked = 0;
        switch(game.players.size){
            case 3 :
            case 4 : nbToBeFlicked = 5; break;
            case 5 : nbToBeFlicked = 4; break;
            default : nbToBeFlicked = 3;
        }

        if (game.flicked || player.hasFlicked() || cards.length != nbToBeFlicked) {
            return;
        }

        for (let card in cards){
            if (!includeCardId(cards[card].id, player.hand)){
                return;
            }
        }
        
        player.handFlick = cards;
        player.hand = player.hand.filter(item => !includeCardId(item.id, cards));

        for (let playerToBeChecked of game.players.values()) {
            if (!playerToBeChecked.hasFlicked()) {
                return;
            }
        }

        flick(game);
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
        if (game == null || !game.flicked) {
            return;
        }

        const player = game.players.get(nametag(user));
        if (player == null) {
            return;
        }

        let colorAsk;
        if (game.pool.length < 1){
            colorAsk = card.color;
        } else {
            colorAsk = game.pool[0].color;
        }

        if (includeCardId(card.id, player.hand) && game.mustPlay == player.nametag() && ((player.hand.filter(item => includeCardColor(item,colorAsk)).length>0&& card.color == colorAsk) || player.hand.filter(item => includeCardColor(item,colorAsk)).length < 1 )){
            let card = card;
            card.user = user;
            game.pool.push(card);

            player.hand = player.hand.filter(item => includeOneCardId(card.id, item));
            if (game.pool.length >= game.players.size) {
                checkWinnerOfRound(game);
            } else {
                game.setNextPlayer();
            }
            notify(gameCode);
        }
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

function checkWinnerOfRound(game) {
    // Retrieve the losing card
    let losingCard = game.pool[0];
    Array.from(game.pool).filter(item => includeCardColor(item,colorAsk)).forEach(element => {
        if(element.id > losingCard.id){
            losingCard = element;
        }
    });
    

    // Update points of players
    for (let player of game.players.values()) {
        if (player.user != losingCard.user) {
            return;
        }
        let points = 0;
        if (includeCardId(game.cursedCardId, game.pool)){
            points += 40;
        }
        Array.from(game.pool).filter(item => includeCardColor(item, "payoo")).forEach(element => {
            points = points + element.number;
        });
        player.addPoints(points);
    }

    game.mustPlay = null;
    setTimeout(() => {
        game.mustPlay = nametag(losingCard.user);
        if (player.hand.length >= 1){
            notify(gameCode);
            return;
        }

        game.pool = new Array();
        game.status = gameStatus.ENDING;

        // Update score of players
        for (let player of game.players.values()){
            UserModel.find({name : player.user.name, tag: player.user.tag}, {'_id': 0, '__v':0, 'password':0}).exec((err, data) => {
                if (err){return;}
                else if(!data.length){return;}
                else {
                    return UserModel.updateOne({
                        name : player.user.name, 
                        tag: player.user.tag
                    },
                    {
                        score: parseInt(data[0].score) + player.points,
                        games: parseInt(data[0].games) + 1
                    }, (err) => {
                        if (err) return;
                    });
                }
            });
        }
        notify(gameCode);

        for (const user of game.getPlayersAndSpectators().values()){
            currentUser.get(nametag(user)).playingGame = "";
        }
        currentGame.delete(gameCode);

    }, 1300);
}

module.exports = {loadGameSocket};
