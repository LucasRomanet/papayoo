const sock = require('socket.io');
const PlayerModel = require('../model/Player');
const {playerToSocket, currentPlayer, currentGame,currentGamesHands,gameStatus, distributeCard, nametag, gameToJson, socketToPlayer} = require("../utils/game.js");
const {notify, includeCardColor, includeCardId, includeOneCardId, flick, setNextPlayer, shufflePlayer} = require("../utils/socket.js");

function loadGameSocket(socket){

    socket.on('start', (data)=>{
        /* format awaited:
        {
            gameCode: string
        }*/
        if(currentGame.has(data.gameCode)){
            let game = currentGame.get(data.gameCode);
            if(nametag(game.player.values().next().value) == nametag(socketToPlayer.get(socket).player) && game.player.size > 2 && !currentGamesHands.has(data.gameCode)){
                game.status = gameStatus.playing;
                let hands = distributeCard(game);
                currentGamesHands.set(data.gameCode, hands);
                shufflePlayer(data.gameCode);
                notify(data.gameCode);
            }
        }
    });
    socket.on('ask', ()=>{
        let player = socketToPlayer.get(socket).player;
        if(player.playingGame != ""){
            notify(player.playingGame);
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
        if(currentGame.has(data.gameCode)&& currentGamesHands.has(data.gameCode)){
            let game = currentGame.get(data.gameCode);
            let player = socketToPlayer.get(socket).player;
            let hand = currentGamesHands.get(data.gameCode).get(nametag(player));
            let num = 0;
            switch(game.player.size){
                case 3 :
                case 4 : num = 5;break;
                case 5 : num = 4;break;
                default : num = 3;
            }
            if(!game.flicked && !hand.flicked && data.cards.length == num){
                let bool = true;
                for(let card in data.cards){
                    if(!includeCardId(data.cards[card].id, hand.hand)){
                        bool = false;
                    }
                }
                if(bool){
                    hand.flicked = true;
                    hand.handFlick = data.cards;
                    hand.hand = hand.hand.filter(item => !includeCardId(item.id, data.cards));
                    for(let h of currentGamesHands.get(data.gameCode).values()){
                        if(!h.flicked){
                            bool = false;
                        }
                    }
                }
                if(bool){
                    flick(data.gameCode);
                }
            }
        }

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

        if(currentGame.has(data.gameCode)&& currentGamesHands.has(data.gameCode)){
            let game = currentGame.get(data.gameCode);
            let player = socketToPlayer.get(socket).player;
            let hand = currentGamesHands.get(data.gameCode).get(nametag(player));
            if(game.flicked){
                let colorAsk;
                if(game.pool.length<1){
                    colorAsk = data.card.color;
                }
                else{
                    colorAsk = game.pool[0].color;
                }
                if(includeCardId(data.card.id, hand.hand) && game.mustPlay == nametag(player) && ((hand.hand.filter(item => includeCardColor(item,colorAsk)).length>0&& data.card.color == colorAsk) || hand.hand.filter(item => includeCardColor(item,colorAsk)).length < 1 )){
                    let card = data.card;
                    card.player =  nametag(player);
                    game.pool.push(card);

                    currentGamesHands.get(data.gameCode).get(nametag(player)).hand = hand.hand.filter(item => includeOneCardId(data.card.id, item));
                    if(game.pool.length >= game.player.size){
                        let losingCard = game.pool[0];
                        Array.from(game.pool).filter(item => includeCardColor(item,colorAsk)).forEach(element => {
                            if(element.id > losingCard.id){
                                losingCard= element;
                            }
                        });
                        for(let v of game.playerScores.values()){
                            if(v.player == losingCard.player){
                                let add = 0;
                                if(includeCardId(game.IdCursedCard, game.pool)){
                                    add+=40;
                                }
                                Array.from(game.pool).filter(item => includeCardColor(item,"payoo")).forEach(element => {
                                    add = add + element.number;
                                });
                                v.score = v.score+add;
                            }
                        }
                        game.mustPlay = ""
                        setTimeout(function (){
                            game.mustPlay = losingCard.player;
                            game.pool = new Array();
                            if(hand.hand.length<1){
                                game.status = gameStatus.finish;
                                for(let v of game.playerScores.values()){
                                    PlayerModel.find({name : v.player.split('#')[0], tag : v.player.split('#')[1]}, {'_id': 0, '__v':0, 'password':0}).exec((err, data) => {
                                        if (err){return;}
                                        else if(!data.length){return;}
                                        else {
                                            return PlayerModel.updateOne({name : v.player.split('#')[0], tag : v.player.split('#')[1]}, {score: parseInt(data[0].score)+v.score, games: parseInt(data[0].games)+1}, (err) => {
                                                if (err) return;
                                        });;
                                        }
                                    });
                                }
                                notify(data.gameCode);
                                for(let p of game.player.values()){
                                    currentPlayer.get(nametag(p)).playingGame = "";
                                }
                                currentGame.delete(data.gameCode);
                                currentGamesHands.delete(data.gameCode);
                            }
                            else notify(data.gameCode);

                        },1300);


                    }
                    else setNextPlayer(game, nametag(player));
                    notify(data.gameCode);
                }
            }
        }
    });


    socket.on('message', (data)=>{
        /* format awaited:
        {
            gameCode: string,
            text : string
        }*/
        if(currentGame.has(data.gameCode)&& data.text.length>0){
            let game = currentGame.get(data.gameCode);
            let player = socketToPlayer.get(socket).player;
            let json =JSON.stringify({player: nametag(player), text: data.text});
            for (let p of game.player.values()){
                if(game.status!=gameStatus.finish){
                    playerToSocket.get(nametag(p)).socket.emit("message", json);
                }
            }
        }
        });


}



function getIo(){
    return io;
}

module.exports = {getIo, loadGameSocket};
