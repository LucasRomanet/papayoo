import React, { Component } from "react";
import Card from "./Card.js";
import Chat from "../Chat.js";
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import '../../style/partie.css';
import UserProfile from '../../utils/UserProfile.js';
import Stats from "./Stats.js"

const socket = UserProfile.getSocket();

function byId(a, b) {return a.id-b.id};

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'PLAYING',
            code: '',
            player: props.router.location.state.player,
            playable : {
                color: null,
                noColorCardsLeft: false
            },
            flick: true,
            cards : {
                pool: [],
                hand: [],
                original: []
            },
            highest : {
                id:-1,
                number:-1,
                color: null
            },
            flickSize: 5,
            mustPlay: UserProfile.nametag(),
            currentPlayerInformation: {},
            cursedCard: "",
            playerScores : []
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleFlick = this.handleFlick.bind(this);
        this.handleClear = this.handleClear.bind(this);
    }

    handleModalStatsOpen = (id) => {
        if(id != null) {
            this.setState({currentPlayerInformation : this.state.player[id]})
        }
        this.setState((prevState) => {
            return {
                modalStatsOpen: !prevState.modalStatsOpen
            }
        });
    }
    setCursedCard = (id) => {
        switch(id) {
            case 26 :
                this.setState({cursedCard : "pique"});
                break;
            case 36 :
                this.setState({cursedCard : "coeur"});
                break;
            case 46 :
                this.setState({cursedCard : "carreau"});
                break;
            case 56 :
                this.setState({cursedCard : "trefle"});
                break;
        }
    }

    searchHandForColor(color) {
        let found = false;
        this.state.cards.hand.forEach((card, i) => {
            found = (card.color === color || found);
        });
        return found;
    }
    playable(cards) {
        cards.forEach((card, i) => {
            cards[i] = {
                ...card,
                playable:
                    (!this.state.playable.color
                        || this.state.playable.color === card.color
                        || !this.state.playable.noColorCardsLeft
                        || this.state.flick
                    ) && ((this.state.flick && this.state.cards.pool.length < this.state.flickSize)
                        || !this.state.flick
                    ) && (UserProfile.nametag() == this.state.mustPlay || this.state.flick)
            }
        });
        return cards;
    }
    handleClick = event => {
        let id, color = this.state.playable.color,
        noColorCardsLeft = this.state.playable.noColorCardsLeft,
        {hand, pool} = this.state.cards;
        if (event.target)
            id = event.target.closest(".card-container").id;
        else if (event.destination && event.destination.droppableId === "pool")
            id = event.draggableId;
        else return;

        let cardIndex = hand.findIndex((card) => card.id == id);
        let card = hand[cardIndex];
        if (card.playable){
            if (!this.state.flick) {
                socket.emit('play', {gameCode: this.state.code, card: card});
            }
            delete hand[cardIndex];
            if (!pool.length) color = card.color;
            pool.push(card);
            let newHighest = this.state.highest;
            if (card.color === color && card.number>newHighest.number) newHighest = card;
            let playable = {
               color: null,
               noColorCardsLeft: false
            }
            if (!this.state.flick) playable = {
                color: color,
                noColorCardsLeft: this.searchHandForColor(color)
            }
            this.setState({
                playable,
                cards: {
                    ...this.state.cards,
                    hand: this.playable(hand.sort(byId)),
                    pool: pool,
                },
                highest: newHighest
            });
        }

    }
    handleFlick = (event) => {
        socket.emit('flick', {gameCode: this.state.code, cards: this.state.cards.pool});
    }
    handleClear = (event) => {
        let hand = [...this.state.cards.original];
        this.setState({
            cards: {
                ...this.state.cards,
                pool: []
            },
        }, () => {
            this.setState({
                cards: {
                    ...this.state.cards,
                    hand: this.playable(hand.sort(byId))
                }
            })
        })
    }
    componentDidMount() {
        this.socketFunction();
        let flickSize, hand = [...this.props.router.location.state.hand.hand];
        switch(this.props.router.location.state.player.length){
            case 3: case 4 : flickSize = 5; break;
            case 5 : flickSize = 4; break;
            case 6: case 7: case 8: flickSize = 3; break;
        }
        this.setState({
            code: this.props.router.location.state.code,
            cards: {
                hand: this.playable(hand.sort(byId)),
                pool: [],
                original: this.props.router.location.state.hand.hand
            },
            highest : {
                id:-1,
                number:-1,
                color: null
            },
            flickSize: flickSize,
        });

    }
    socketFunction = (event) => {
        socket.on("notify", (arg)=> {
            const newState = JSON.parse(arg);
            if (newState.status !== 'ENDING') {
                let color, last = newState.pool.slice(-1);
                if (last.length) { color = newState.pool[0].color}
                this.setState({
                    status: newState.status,
                    flick: !newState.flicked,
                    mustPlay: newState.mustPlay,
                    playable : {
                        color: color,
                        noColorCardsLeft: this.searchHandForColor(color)
                    },
                    player: newState.player,
                    playerScores: newState.playerScores
                }, () => {
                     this.setState({
                        cards: {
                            ...this.state.cards,
                            hand: this.playable(newState.hand.hand.sort(byId)),
                            pool: newState.pool
                        }
                    });
                });
                this.setCursedCard(newState.IdCursedCard);
            }
            else {
                this.setState({
                   status: newState.status,
                   playerScores: newState.playerScores
                })
            }
        });
    }
    getScore = (index) => {
        let player = this.state.playerScores[index];
        if(player != null) {
            return player.score;
        }
        return 0;
    }
    render() {
        let navbar = document.getElementsByClassName("navbar")[0];
        if (navbar) navbar.style.display = "none";
        return (
            <div>
                <div className="opponent-wrapper">
                {
                    this.state.player.map((p, index) =>
                        <div className={[(UserProfile.nametag(p) === this.state.mustPlay) ? "must-play":"", "player-wrapper"].join(' ')} >
                            <div className="opponent" index={index}>
                                <a key={index} onClick={() => this.handleModalStatsOpen(index)} style={{cursor: 'pointer'}} >{p.name}#{p.tag}</a>
                            </div>
                            <div className="opponent" index={index}>
                                <p>Score : {this.getScore(index)}</p>
                            </div>
                        </div>
                    )
                }
                </div>
                <div className="table-wrapper">
                    {
                        (!this.state.flick) ?
                        <div>
                            Couleur demandée:
                                <div className={[(this.state.playable.color) ? this.state.playable.color : "indefini", "playable"].join(' ')}>‎</div>
                        </div>:
                            (this.state.cards.pool.length < this.state.flickSize) ?
                            <div className="buttonHolder">
                                Cartes défaussées: ({this.state.cards.pool.length}/{this.state.flickSize})
                                {
                                    (this.state.cards.pool.length > 0) ? <button class="btn btn-danger" onClick={this.handleClear}>X</button>:""
                                }
                            </div>:
                            <div className="buttonHolder">
                                <button class="btn btn-success" onClick={this.handleFlick}>Valider la défausse</button>
                                <button class="btn btn-danger" onClick={this.handleClear}>X</button>
                            </div>

                    }
                    {
                        this.state.cursedCard == '' ? "" :
                        <div>
                            Carte Maudite : <div className={[this.state.cursedCard, "maudite"].join(' ')}>7</div>
                        </div>
                    }
                </div>
                <DragDropContext onDragEnd={this.handleClick}>
                    <Droppable droppableId="pool" key="pool" direction="horizontal">
                    {(provided, snapshot) =>
                        <div
                            className="pool-wrapper"
                            ref={provided.innerRef}
                            style={{
                                background: snapshot.isDraggingOver
                                ? "rgba(10,10,10,.3)"
                                : ""
                            }}
                        >
                        {
                            this.state.cards.pool.map((card) =>
                                <Card
                                    index={card.id}
                                    key={card.id}
                                    card={card}
                                    playable={false}
                                    context={"pool"}
                                    highest={this.state.highest.id == card.id}
                                />
                            )
                        }
                        {provided.placeholder}
                        </div>
                    }
                    </Droppable>
                    <Droppable droppableId="hand" key="hand" direction="horizontal">
                    {(provided, snapshot) =>
                        <div
                            className="hand-wrapper"
                            ref={provided.innerRef}
                        >
                        {
                            this.state.cards.hand.map((card) =>
                                <Card
                                    index={card.id}
                                    key={card.id}
                                    card={card}
                                    playable={card.playable}
                                    context={"hand"}
                                    handleClick={this.handleClick}
                                />
                            )
                        }
                        {provided.placeholder}
                        </div>
                    }
                    </Droppable>
                </DragDropContext>
                <Stats
                    modalOpen={this.state.modalStatsOpen}
                    handleModalOpen={this.handleModalStatsOpen}
                    player={this.state.currentPlayerInformation}
                />
                <Chat code={this.props.router.location.state.code}/>
            </div>
        );
    }
}

export default Game;
