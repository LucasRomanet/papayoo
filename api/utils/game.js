const cardsColors = require('../model/enum/CardsColors.js');
const Card = require('../model/bo/Card.js');
const UserStore = require('../model/store/UserStore.js');

let currentGame = new Map();
const loggedUsers = new UserStore();

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
    for (let i = 1; i <= 20; i++) {
        cards.push(new Card(id++, i, cardsColors.PAYOO));
    }
    // Normal cards
    for (let color of [cardsColors.TREFLE, cardsColors.CARREAU, cardsColors.COEUR, cardsColors.PIQUE]) {
        for (let i = 1; i <= 10; i++) {
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
        i++;
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

module.exports = { currentGame, loggedUsers, distributeCard, initCards, nametag, createJoinCode, shuffle };
