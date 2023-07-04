let currentGame = new Map();
// TODO Supprimer currentUser.
// non pas forcément le supprimer, mais le vider quand un user se déconnecte
let currentUser = new Map();
// TODO : userToSocket peut poser problème si on se connecte sur un compte déjà en partie
let userToSocket  = new Map();

/**
 * ========== BO ==========
 */

const gameStatus = Object.freeze({
    WAITING: 'WAITING',
    PLAYING: 'PLAYING',
    ENDING: 'ENDING'
});

const cardsColors = Object.freeze({
    TREFLE: 'TREFLE',
    CARREAU: 'CARREAU',
    COEUR: 'COEUR',
    PIQUE: 'PIQUE',
    PAYOO: 'PAYOO'
});

class Game {
    constructor(code) {
        this.code = code;
        this.status = gameStatus.WAITING;
        this.discarding = true;
        this.discardSize = 5;
        this.pool = new Array();
        this.cursedCard = null;
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
                this.mustPlay = playerTag;
                next = false;
            }
        }
        if (next) {
            this.mustPlay = this.players.keys().next().value;
        }
    }

}

class Player {
    constructor(user) {
        this.user = user;
        this.hand = [];
        this.points = 0;
        this.isHost = false;
        this.discardPile = [];
    }

    nametag() {
        return this.user.toString();
    }

    hasDiscarded() {
        return this.discardPile.length > 0;
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
    }
}

class PlayedCard extends Card {
    constructor(id, number, color, userNameTag) {
        super(id, number, color);
        this.userNameTag = userNameTag;
    }
}

/**
 * ========== DTO ==========
 */
function toGameDTO(game, nametag) {
    if (game == null) {
        return null;
    }

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

    const pool = [];
    for (let card of game.pool) {
        pool.push(toPlayedCardDTO(card));
    }
    const mutualGameStateDTO = new MutualGameStateDTO(game.code, game.status, game.discarding, game.discardSize, pool, toCardDTO(game.cursedCard), game.maxPlayer, game.mustPlay, players, spectators);

    // IndividualGameStateDTO
    const hand = [];
    for (let card of player.hand) {
        hand.push(toCardDTO(card));
    }
    const discardPile = [];
    for (let card of player.discardPile) {
        discardPile.push(toCardDTO(card));
    }
    const individualGameStateDTO = new IndividualGameStateDTO(hand, player.isHost, isSpectator, discardPile);

    // GameDTO
    return new GameDTO(mutualGameStateDTO, individualGameStateDTO);
}

function toCardDTO(card) {
    if (card == null) {
        return null;
    }
    return new CardDTO(card.id, card.number, card.color);
}

function toPlayedCardDTO(playedCard) {
    if (playedCard == null) {
        return null;
    }
    return new PlayedCardDTO(playedCard.id, playedCard.number, playedCard.color, playedCard.userNameTag);
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

class PlayedCardDTO extends CardDTO {
    constructor(id, number, color, userNameTag) {
        super(id, number, color);
        this.userNameTag = userNameTag;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            userNameTag: this.userNameTag
        }
    }
}

class MutualGameStateDTO {
    constructor(code, status, discarding, discardSize, pool, cursedCard, maxPlayer, mustPlay, players, spectators) {
        this.code = code;
        this.status = status;
        this.discarding = discarding;
        this.discardSize = discardSize;
        this.pool = pool;
        this.cursedCard = cursedCard;
        this.maxPlayer = maxPlayer;
        this.mustPlay = mustPlay;
        this.players = players;
        this.spectators = spectators;
    }

    toJSON() {
        return {
            code: this.code,
            status: this.status,
            discarding: this.discarding,
            discardSize: this.discardSize,
            pool: this.pool,
            cursedCard: this.cursedCard,
            maxPlayer: this.maxPlayer,
            mustPlay: this.mustPlay,
            players: Array.from(this.players.values()),
            spectators: Array.from(this.spectators.values())
        }
    }
}

class IndividualGameStateDTO {
    constructor(hand, isHost, isSpectator, discardPile) {
        this.hand = hand;
        this.isHost = isHost;
        this.isSpectator = isSpectator;
        this.discardPile = discardPile;
    }

    toJSON() {
        return {
            hand: this.hand,
            isHost: this.isHost,
            isSpectator: this.isSpectator,
            discardPile: this.discardPile
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

    toJSON() {
        return {
            name: this.name,
            tag: this.tag,
            gamesPlayed: this.gamesPlayed,
            score: this.score,
            playingGame: this.playingGame
        }
    }
}

class LoggedUserDTO {
    constructor(token, name, tag, gamesPlayed, score) {
        this.token = token;
        this.name = name;
        this.tag = tag;
        this.gamesPlayed = gamesPlayed;
        this.score = score
    }

    toJSON() {
        return {
            token: this.token,
            name: this.name,
            tag: this.tag,
            gamesPlayed: this.gamesPlayed,
            score: this.score
        }
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

function initCards() {
    let id = 0;
    const cards = [];
    // Payoo
    for (let i = 1; i < 20; i++) {
        cards.push(new Card(id++, i, cardsColors.PAYOO));
    }
    // Normal cards
    for (let color of [cardsColors.TREFLE, cardsColors.CARREAU, cardsColors.COEUR, cardsColors.PIQUE]) {
        for (let i = 1; i < 10; i++) {
            cards.push(new Card(id++, i, color));
        }
    }
    return cards;
}

function distributeCard(game) {
    let cards = initCards();

    if (game.players.size > 6) {
        cards = cards.filter(card => card.color === cardsColors.PAYOO || card.number !== 1);
    }

    cards = shuffle(cards);
    for (let spectator of game.spectators.values()) {
        spectator.hand = [];
        spectator.discardPile = [];
    }

    let i = 0;
    let cardPerPlayer = cards.length / game.players.size;
    for (let player of game.players.values()) {
        player.hand = [...cards.slice(i * cardPerPlayer, (i + 1) * cardPerPlayer)];
        player.discardPile = [];
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
    GameDTO, PlayerDTO, MutualGameStateDTO, IndividualGameStateDTO, toGameDTO, cardsColors, initCards,
    Game, Player, User, Card, PlayedCard, LoggedUserDTO,
    nametag, createJoinCode, shuffle };
