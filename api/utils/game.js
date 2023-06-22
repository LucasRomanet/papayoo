const PlayerModel = require('../model/Player');

let currentGame = new Map();
let currentPlayer = new Map();
let playerToSocket  = new Map();
let socketToPlayer = new Map();
let currentGamesHands = new Map();

function initData(){
    PlayerModel.find().cursor().eachAsync((p) => {
        currentPlayer.set(nametag(p), new Player(p.name, p.tag, p.games, p.score));
    })
}

const gameStatus = Object.freeze({
    WAITING: 'WAITING',
    PLAYING: 'PLAYING',
    ENDING: 'ENDING'
});
const cardColor = Object.freeze({
    payoo:1,
    pique:2,
    coeur:3,
    carreau:4,
    trefle:5
});

class Game{
    constructor(code, nametag){
        //this.gameid = gameId;
        this.maxPlayer = 8;
        this.code = code;
        this.player = new Map();
        this.player.set(nametag, currentPlayer.get(nametag));
        this.status = gameStatus.WAITING;
        this.flicked = false;
        this.pool = new Array();
        this.mustPlay = "";
        this.playerScores = new Array();
        this.IdCursedCard = 0;
    }

}

class Player{
    constructor(name, tag, gamesPlayed, score){
        this.name = name;
        this.tag = tag;
        this.gamesPlayed = gamesPlayed;
        this.score = score
        this.playingGame = "";
    }
}

function nametag({name, tag}){
    return name + '#' + tag;
}

function isInGame(nt){
    currentGame.forEach((values)=>{
        if(values.player.has(nt)){
            return true;
        }
    });
    return false;
}

function isInGameWithExclusion(nt, gc){
    currentGame.forEach((values, keys)=>{
        if(gc != keys){
            if(values.player.has(nt)){
                return true;
            }
        }
    });
    return false;
}

function makeJoinCode(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    if(currentGame.has(result)){
        return makeJoinCode(length);
    }
    else{
        return result;
    }
}

function distributeCard(game){
    let colorSize,
        id=0,
        stack = new Array();
    for(let j in cardColor) {
        if (j==="payoo") colorSize=20;
        else colorSize=10;
        for(let i = 1; i <= colorSize; i++, id++) {
            stack.push({
                id: id,
                number: i,
                color: j
            });
        }
    }
    if(game.player.size > 6){
        for(let i = 20;i<50; i+=9){
            stack.splice(i,1);
        }
    }
    stack = shuffle(stack);
    let hands = new Map();
    for(let key of game.player.keys()){
        hands.set(key, {hand :new Array(), flicked : false});
    }
    while(stack.length > 0){
        for(let key of hands.keys()){
            hands.get(key).hand.push(stack.shift());
        }
    }
    return hands;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function gameToJson(game) {
    let o2 = [];
    for(let p of game.player.values()){
        o2.push(p);
    }
    let output = {maxPlayer: game.maxPlayer, code: game.code, status: game.status, flicked : game.flicked, IdCursedCard: game.IdCursedCard, pool : game.pool, mustPlay :game.mustPlay, playerScores : game.playerScores, player: o2};
    return JSON.stringify(output);
}


module.exports = {currentGame, currentPlayer, currentGamesHands, playerToSocket, socketToPlayer,gameStatus, distributeCard, initData, Game, Player, nametag, isInGame, makeJoinCode, isInGameWithExclusion: isInGameWithExclusion, gameToJson, shuffle};
