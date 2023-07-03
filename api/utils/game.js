let currentGame = new Map();
// TODO Supprimer currentUser.
// non pas forcément le supprimer, mais le vider quand un user se déconnecte
let currentUser = new Map();
let userToSocket  = new Map();

/**
 * ========== BO ==========
 */

const gameStatus = Object.freeze({
    WAITING: 'WAITING',
    PLAYING: 'PLAYING',
    ENDING: 'ENDING'
});

const cardColor = Object.freeze({
    payoo: 1,
    pique: 2,
    coeur: 3,
    carreau: 4,
    trefle: 5
});

class Game {
    constructor(code) {
        this.code = code;
        this.status = gameStatus.WAITING;
        this.flicked = true;
        this.flickSize = 5;
        this.pool = new Array();
        this.cursedCardId = 0;
        this.maxPlayer = 8;
        this.players = new Map();
        this.spectators = new Map();
        this.mustPlay = null;
    }

    getHost() {
        for(const [nametag, player] of this.players){
            if (player.isHost) {
                return {nametag, player};
            }
        }
        return null;
    }

    addPlayer(user) {
        const player = new Player(user);
        player.isHost = this.players.size === 0;
        this.players.set(nametag(user), player);
    }

    removePlayer(nametag) {
        if (!this.players.has(nametag)) {
            return false;
        }
        const isHost = this.players.get(nametag).isHost;
        this.players.delete(nametag);
        if (isHost && this.players.size !== 0) {
            this.players.values().next().value.isHost = true;
        }
        return true;
    }

    countUsers() {
        return this.players.size + this.spectators.size;
    }

    getPlayersAndSpectators() {
        return new Map([...this.players, ...this.spectators]);
    }

    setNextPlayer() {
        let next = true;
        for (const playerTag of this.players.keys()) {
            if (playerTag === this.mustPlay){
                next = true;
            } else if (next){
                game.mustPlay = playerTag;
                next = false;
            }
        }
        if (next) {
            game.mustPlay = this.players.keys().next().value;
        }
    }

}

class Player {
    constructor(user) {
        this.user = user;
        this.hand = [];
        this.points = 0;
        this.isHost = false;
        this.handFlick = [];
    }

    nametag() {
        return this.user.toString();
    }

    hasFlicked() {
        return this.handFlick.length > 0;
    }

    addPoints(points) {
        this.points += points;
    }
}

class User {
    constructor(name, tag, gamesPlayed, score){
        this.name = name;
        this.tag = tag;
        this.gamesPlayed = gamesPlayed;
        this.score = score;
        this.playingGame = "";
    }

    toString() {
        return `${this.name}#${this.tag}`;
    }
}

class Card {
    constructor(id, number, color) {
        this.id = id;
        this.number = number;
        this.color = color;
        this.user = null;
    }
}

/**
 * ========== DTO ==========
 */

function toGameDTO(game, nametag) {
    const isSpectator = false;
    const player = game.players.get(nametag);
    if (player == null) {
        isSpectator = true;
        player = game.spectators.get(nametag);
        if (player == null) {
            return null;
        }
    }

    // MutualGameStateDTO
    const players = new Map();
    for (let [nametag, player] of game.players) {
        const user = player.user;
        const userDTO = new UserDTO(user.name, user.tag, user.gamesPlayed, user.score, user.playingGame);
        players.set(nametag, new PlayerDTO(userDTO, player.score, player.isHost));
    }

    const spectators = new Map();
    for (let [nametag, player] of game.spectators) {
        const user = player.user;
        const userDTO = new UserDTO(user.name, user.tag, user.gamesPlayed, user.score, user.playingGame);
        spectators.set(nametag, new PlayerDTO(userDTO, player.score, player.isHost));
    }
    
    const mutualGameStateDTO = new MutualGameStateDTO(game.code, game.status, game.flicked, game.flickSize, game.pool, game.cursedCardId, game.maxPlayer, game.mustPlay, players, spectators);

    // IndividualGameStateDTO
    const individualGameStateDTO = new IndividualGameStateDTO(player.hand, player.isHost, isSpectator, player.handFlick);

    // GameDTO
    return new GameDTO(mutualGameStateDTO, individualGameStateDTO);
}

class GameDTO {
    constructor(mutual, individual) {
        this.mutual = mutual;
        this.individual = individual;
    }

    toJSON() {
        return {
            mutual: this.mutual,
            individual: this.individual
        }
    }
}

class PlayerDTO {
    constructor(user, score, isHost) {
        this.user = user;
        this.score = score;
        this.isHost = isHost;
    }

    toJSON() {
        return {
            user: this.user,
            score: this.score,
            isHost: this.isHost,
        }
    }
}

class CardDTO {
    constructor(id, number, color) {
        this.id = id;
        this.number = number;
        this.color = color;
    }

    toJSON() {
        return {
            id: this.id,
            number: this.number,
            color: this.color
        }
    }
}

class MutualGameStateDTO {
    constructor(code, status, flicked, flickSize, pool, cursedCardId, maxPlayer, mustPlay, players, spectators) {
        this.code = code;
        this.status = status;
        this.flicked = flicked;
        this.flickSize = flickSize;
        this.pool = pool;
        this.cursedCardId = cursedCardId;
        this.maxPlayer = maxPlayer;
        this.mustPlay = mustPlay;
        this.players = players;
        this.spectators = spectators;
    }

    toJSON() {
        return {
            code: this.code,
            status: this.status,
            flicked: this.flicked,
            flickSize: this.flickSize,
            pool: this.pool,
            cursedCardId: this.cursedCardId,
            maxPlayer: this.maxPlayer,
            mustPlay: this.mustPlay,
            players: Array.from(this.players.values()),
            spectators: Array.from(this.spectators.values())
        }
    }
}

class IndividualGameStateDTO {
    constructor(hand, isHost, isSpectator, handFlick) {
        this.hand = hand;
        this.isHost = isHost;
        this.isSpectator = isSpectator;
        this.handFlick = handFlick;
    }

    toJSON() {
        return {
            hand: this.hand,
            isHost: this.isHost,
            isSpectator: this.isSpectator,
            handFlick: this.handFlick
        }
    }
}

class UserDTO {
    constructor(name, tag, gamesPlayed, score, playingGame) {
        this.name = name;
        this.tag = tag;
        this.gamesPlayed = gamesPlayed;
        this.score = score;
        this.playingGame = playingGame;
    }
}

function nametag({name, tag}){
    return name + '#' + tag;
}


function createJoinCode(length) {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;

    do {
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
    } while (currentGame.has(result));

    return result;
}

const cardColors = Object.freeze({
    TREFLE: 'TREFLE',
    CARREAU: 'CARREAU',
    COEUR: 'COEUR',
    PIQUE: 'PIQUE',
    PAYOO: 'PAYOO'
});

function initCards() {
    let id = 0;
    const cards = [];
    // Normal cards
    for (let color in [cardsColors.TREFLE, cardsColors.CARREAU, cardsColors.COEUR, cardsColors.PIQUE]) {
        for (let i = 1; i < 10; i++) {
            cards.push(new Card(id++, i, color));
        }
    }
    // Payoo
    for (let i = 1; i < 20; i++) {
        cards.push(new Card(id++, i, cardsColors.PAYOO));
    }
}

function distributeCard(game) {
    let colorSize,
        id=0,
        stack = new Array();
    for (const color in cardColor) {
        if (color==="payoo") colorSize=20;
        else colorSize=10;
        for(let i = 1; i <= colorSize; i++, id++) {
            stack.push({
                id: id,
                number: i,
                color: color
            });
        }
    }
    if (game.players.size > 6){
        for(let i = 20;i<50; i+=9) {
            stack.splice(i,1);
        }
    }
    stack = shuffle(stack);
    for (let spectator of game.spectators.values()) {
        spectator.hand = [];
        spectator.handFlick = [];
    }

    let i = 0;
    let cardPerPlayer = stack.length / game.players.size;
    for (let player of game.players.values()) {
        player.hand = [...stack.slice(i * cardPerPlayer, (i + 1) * cardPerPlayer)];
        player.handFlick = [];
    }
}

function shuffle(a) {
    let x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


module.exports = { currentGame, currentUser, userToSocket, gameStatus, distributeCard,
    GameDTO, PlayerDTO, MutualGameStateDTO, IndividualGameStateDTO, toGameDTO,
    Game, Player, User, Card,
    nametag, createJoinCode, shuffle };
