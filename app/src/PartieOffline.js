import React, { Component } from "react";
import Card from "./Card.js";
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import './style/partie.css';
import UserProfile from './utils/UserProfile.js';

class Partie extends Component {
    constructor(props) {
        super(props);
        this.state = {
             playable : {
                color: null,
                noColorCardsLeft: false
            },
            cards : {
                pool: [],
                hand: []
            },
            highest : {
                id:-1,
                number:-1,
                color: null
            }
        };
        this.handleClick = this.handleClick.bind(this);
    }
    distributeCards() {
        let cards = [];
        let colors = ["coeur", "carreau", "pique", "trefle", "payoo"];
        for (let c=0, id=0; c<colors.length; c++)
            for (let i=1; i<=3; i++, id++)
                cards[id] = {id: id.toString(), number: i, color: colors[c]};
        return cards;
    };
    searchHandForColor(color) {
        let found = false;
        this.state.cards.hand.forEach((card, i) => {
            found = (card.color === color || found);
        });
        return found;

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
        let card = hand[id];
        if (card.color === color || !color || !noColorCardsLeft) {
            delete hand[id];
            if (!pool.length) color = card.color;
            pool.push(card);
            let newHighest = this.state.highest;
            if (card.color === color && card.number>newHighest.number) newHighest = card;
            this.setState({
                playable: {
                    color: color,
                    noColorCardsLeft: this.searchHandForColor(color)
                },
                cards: {
                    hand: hand,
                    pool: pool
                },
                highest: newHighest
            });
        }

    }
    componentDidMount() {
        let hand = this.state.cards.hand;
        if (hand!==null) hand = this.distributeCards();
        this.setState({
            cards: {
                hand: hand,
                pool: [],
            },
            highest : {
                id:-1,
                number:-1,
                color: null
            }
        });
    }
    render() {
        return (
            <div>
            <button onClick={this.handleDebug}>Debug</button>
                <DragDropContext onDragEnd={this.handleClick}>

                <h2>Table</h2>
                <div>
                    Couleur demandée:
                     <div className={[(this.state.playable.color) ? this.state.playable.color : "indefini", "playable"].join(' ')}>‎</div>
                </div>
                    <Droppable droppableId="pool" key="pool" direction="horizontal">
                    {(provided, snapshot) =>
                        <div
                            className="pool-wrapper"
                            ref={provided.innerRef}
                            style={{
                                background: snapshot.isDraggingOver
                                ? "rgba(10,10,10,.02)"
                                : "lightgrey"
                            }}
                        >
                        <Card
                            index={-1}
                            key={-1}
                            playable={false}
                            context={"pool"}
                            highest={false}
                            card={{}}
                        />
                        {
                            this.state.cards.pool.map((card, index) =>
                                <Card
                                    index={index}
                                    key={card.id}
                                    playable={false}
                                    context={"pool"}
                                    highest={this.state.highest.id == card.id}
                                    card={card}
                                />
                            )
                        }
                        {provided.placeholder}
                        </div>
                    }
                    </Droppable>

                <h2>Main</h2>
                    <Droppable droppableId="hand" key="hand" direction="horizontal">
                    {(provided, snapshot) =>
                        <div
                            className="hand-wrapper"
                            ref={provided.innerRef}

                        >
                        {
                            this.state.cards.hand.map((card, index) =>
                                <Card
                                    index={index}
                                    key={card.id}
                                    card={card}
                                    playable={(!this.state.playable.color
                                        || this.state.playable.color === card.color
                                        || !this.state.playable.noColorCardsLeft
                                    )}
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
            </div>
        );
    }
}

export default Partie;
