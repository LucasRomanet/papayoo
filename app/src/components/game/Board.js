import { useContext, useState, useEffect } from "react";
import Card from "./Card.js";
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import '../../style/partie.css';
import UserProfile from '../../utils/UserProfile.js';
import Stats from "../Stats.js"
import UserContext from "../../context/user/UserContext";
import GameContext from "../../context/game/GameContext";

function byId(a, b) {return a.id-b.id};

const Game = (props) => {

    const [playerStats, setPlayerStats] = useState({});
    const [isStatModalOpen, setStatModalOpen] = useState(false);

    const { user } = useContext(UserContext);
    const { game, setGame } = useContext(GameContext);

    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         status: 'PLAYING',
    //         code: '',
    //         player: props.router.location.state.player,
    //         playable : {
    //             color: null,
    //             noColorCardsLeft: false
    //         },
    //         flick: true,
    //         cards : {
    //             pool: [],
    //             hand: [],
    //             original: []
    //         },
    //         highest : {
    //             id:-1,
    //             number:-1,
    //             color: null
    //         },
    //         flickSize: 5,
    //         mustPlay: UserProfile.nametag(),
    //         currentPlayerInformation: {},
    //         cursedCard: "",
    //         playerScores : []
    //     };
    //     this.handleClick = this.handleClick.bind(this);
    //     this.handleFlick = this.handleFlick.bind(this);
    //     this.handleClear = this.handleClear.bind(this);
    // }

    useEffect(() => {
        socketFunction();
        let flickSize, hand = [...game.hand.hand];
        switch(game.player.length){
            case 3: case 4 : flickSize = 5; break;
            case 5 : flickSize = 4; break;
            case 6: case 7: case 8: flickSize = 3; break;
        }
        setGame({
            ...game,
            cards: {
                hand: playable(hand.sort(byId)),
                pool: [],
                original: game.hand.hand
            },
            flickSize: flickSize
        });
    }, []);

    const handleModalStatsOpen = (id) => {
        if(id != null) {
            setPlayerStats(game.player[id]);
        }
        setStatModalOpen(!isStatModalOpen);
    }

    const setCursedCard = (id) => {
        switch(id) {
            case 26 :
                setGame({
                    ...game,
                    cursedCard: "pique"
                });
                break;
            case 36 :
                setGame({
                    ...game,
                    cursedCard: "coeur"
                });
                break;
            case 46 :
                setGame({
                    ...game,
                    cursedCard: "carreau"
                });
                break;
            case 56 :
                setGame({
                    ...game,
                    cursedCard: "trefle"
                });
                break;
        }
    }

    const searchHandForColor = (color) => {
        let found = false;
        game.cards.hand.forEach((card, i) => {
            found = (card.color === color || found);
        });
        return found;
    }

    const playable = (cards) => {
        cards.forEach((card, i) => {
            cards[i] = {
                ...card,
                playable:
                    (!game.playable.color
                        || game.playable.color === card.color
                        || !game.playable.noColorCardsLeft
                        || game.flick
                    ) && ((game.flick && game.cards.pool.length < game.flickSize)
                        || !game.flick
                    ) && (UserProfile.nametag() == game.mustPlay || game.flick)
            }
        });
        return cards;
    }
    const handleClick = (event) => {
        let id, color = game.playable.color,
        {hand, pool} = game.cards;
        if (event.target)
            id = event.target.closest(".card-container").id;
        else if (event.destination && event.destination.droppableId === "pool")
            id = event.draggableId;
        else return;

        let cardIndex = hand.findIndex((card) => card.id == id);
        let card = hand[cardIndex];
        if (card.playable){
            if (!game.flick) {
                user.socket.emit('play', {gameCode: game.code, card: card});
            }
            delete hand[cardIndex];
            if (!pool.length) color = card.color;
            pool.push(card);
            let newHighest = game.highest;
            if (card.color === color && card.number>newHighest.number) newHighest = card;
            let playable = {
               color: null,
               noColorCardsLeft: false
            }
            if (!game.flick) playable = {
                color: color,
                noColorCardsLeft: searchHandForColor(color)
            }
            setGame({
                ...game,
                playable,
                cards: {
                    ...game.cards,
                    hand: playable(hand.sort(byId)),
                    pool: pool,
                },
                highest: newHighest
            });
        }

    }
    const handleFlick = (event) => {
        user.socket.emit('flick', {gameCode: game.code, cards: game.cards.pool});
    }
    const handleClear = (event) => {
        let hand = [...game.cards.original];

        setGame({
            ...game,
            cards: {
                ...game.cards,
                hand: playable(hand.sort(byId)),
                pool: [],
            }
        });
    }

    const socketFunction = (event) => {
        user.socket.on("notify", (arg)=> {
            const newGameState = JSON.parse(arg);
            if (newGameState.status !== 'ENDING') {
                let color, last = newGameState.pool.slice(-1);
                if (last.length) { color = newGameState.pool[0].color}
                setGame({
                    ...game,
                    status: newGameState.status,
                    flick: !newGameState.flicked,
                    mustPlay: newGameState.mustPlay,
                    playable : {
                        color: color,
                        noColorCardsLeft: searchHandForColor(color)
                    },
                    player: newGameState.player,
                    playerScores: newGameState.playerScores,
                    cards: {
                        ...game.cards,
                        hand: playable(newGameState.hand.hand.sort(byId)),
                        pool: newGameState.pool
                    }
                });


                setCursedCard(newGameState.IdCursedCard);
            }
            else {
                this.setState({
                   status: newGameState.status,
                   playerScores: newGameState.playerScores
                })
            }
        });
    }
    const getScore = (index) => {
        let player = game.playerScores[index];
        if(player != null) {
            return player.score;
        }
        return 0;
    }

    let navbar = document.getElementsByClassName("navbar")[0];
    if (navbar) navbar.style.display = "none";
    return (
        <div>
            <div className="opponent-wrapper">
            {
                game.player.map((p, index) =>
                    <div className={[(UserProfile.nametag(p) === game.mustPlay) ? "must-play":"", "player-wrapper"].join(' ')} >
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
                    (!game.flick) ?
                    <div>
                        Couleur demandée:
                            <div className={[(game.playable.color) ? game.playable.color : "indefini", "playable"].join(' ')}>‎</div>
                    </div>:
                        (game.cards.pool.length < game.flickSize) ?
                        <div className="buttonHolder">
                            Cartes défaussées: ({game.cards.pool.length}/{game.flickSize})
                            {
                                (game.cards.pool.length > 0) ? <button class="btn btn-danger" onClick={handleClear}>X</button>:""
                            }
                        </div>:
                        <div className="buttonHolder">
                            <button class="btn btn-success" onClick={handleFlick}>Valider la défausse</button>
                            <button class="btn btn-danger" onClick={handleClear}>X</button>
                        </div>

                }
                {
                    game.cursedCard == '' ? "" :
                    <div>
                        Carte Maudite : <div className={[game.cursedCard, "maudite"].join(' ')}>7</div>
                    </div>
                }
            </div>
            <DragDropContext onDragEnd={handleClick}>
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
                        game.cards.pool.map((card) =>
                            <Card
                                index={card.id}
                                key={card.id}
                                card={card}
                                playable={false}
                                context={"pool"}
                                highest={game.highest.id == card.id}
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
                        game.cards.hand.map((card) =>
                            <Card
                                index={card.id}
                                key={card.id}
                                card={card}
                                playable={card.playable}
                                context={"hand"}
                                handleClick={handleClick}
                            />
                        )
                    }
                    {provided.placeholder}
                    </div>
                }
                </Droppable>
            </DragDropContext>
            <Stats
                isModalOpen={isStatModalOpen}
                toggleModal={handleModalStatsOpen}
                player={playerStats}
            />
        </div>
    );
}

export default Game;
