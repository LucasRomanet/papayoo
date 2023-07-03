import { useContext, useState, useEffect } from "react";
import Card from "./Card.js";
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import '../../style/partie.css';
import UserProfile from '../../utils/UserProfile.js';
import Stats from "../Stats.js"
import UserContext from "../../context/user/UserContext";
import GameContext from "../../context/game/GameContext.js";

function byId(a, b) {return a.id-b.id};

const Game = () => {

    const [userStats, setUserStats] = useState({});
    const [isStatModalOpen, setStatModalOpen] = useState(false);
    const [playableCard, setPlayableCard] = useState({
        color: null,
        noColorCardsLeft: false
    });
    const [highest, setHighest] = useState({
        id:-1,
        number:-1,
        color: null
    });

    const { user } = useContext(UserContext);
    const { game, setGame } = useContext(GameContext);

    useEffect(() => {
        if (game.mutual.status !== 'ENDING') {
            let color, last = game.mutual.pool.slice(-1);
            if (last.length) { color = game.mutual.pool[0].color }

            setPlayableCard({
                color: color,
                noColorCardsLeft: searchHandForColor(color)
            });

            setCursedCard(game.mutual.cursedCardId);
        }
        console.log(game);
    }, [game]);

    

    const handleModalStatsOpen = (id) => {
        if(id != null) {
            setUserStats(game.mutual.players[id].user);
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
        game.individual.hand.forEach((card, _) => {
            found = (card.color === color || found);
        });
        return found;
    }

    const isPlayable = (card) => {
        if (game.mutual.flicked) {
            return game.mutual.pool.length < game.mutual.flickSize;
        }

        const isPlayerTurn = UserProfile.nametag(user) == game.mutual.mustPlay;
        const isRequiredColor = playableCard.color === card.color || playableCard.noColorCardsLeft;

        return isPlayerTurn && isRequiredColor;
    }

    const handleClick = (event) => {
        let id, color = playableCard.color;
        if (event.target)
            id = event.target.closest(".card-container").id;
        else if (event.destination && event.destination.droppableId === "pool")
            id = event.draggableId;
        else return;


        const cardIndex = game.individual.hand.findIndex((card) => card.id == id);
        const card = game.individual.hand[cardIndex];
        if (isPlayable(card)){
            if (!game.mutual.flicked) {
                user.socket.emit('play', {gameCode: game.mutual.code, card: card});
            }
            delete game.individual.hand[cardIndex];
            if (!game.mutual.pool.length) color = card.color;
            game.mutual.pool.push(card);
            if (card.color === color && card.number > highest.number) setHighest(card);
            let playable = {
               color: null,
               noColorCardsLeft: false
            }
            if (!game.mutual.flicked) playable = {
                color: color,
                noColorCardsLeft: searchHandForColor(color)
            }
            setPlayableCard(playable);
        }

    }

    const handleFlick = (event) => {
        user.socket.emit('flick', {gameCode: game.mutual.code, cards: game.mutual.pool});
    }
    const handleClear = (event) => {
        game.individual.hand = [...game.individual.hand, ...game.mutual.pool]
        setGame(game);
    }

    const getPoints = (index) => {
        let player = game.mutual.players[index];
        if(player != null) {
            return player.points;
        }
        return 0;
    }

    let navbar = document.getElementsByClassName("navbar")[0];
    if (navbar) navbar.style.display = "none";
    return (
        <div>
            <div className="opponent-wrapper">
            {
                game.mutual.players.map((player, index) =>
                    <div className={[(UserProfile.nametag(player.user) === game.mutual.mustPlay) ? "must-play":"", "player-wrapper"].join(' ')} >
                        <div className="opponent" index={index}>
                            <a key={index} onClick={() => handleModalStatsOpen(index)} style={{cursor: 'pointer'}} >{player.user.name}#{player.user.tag}</a>
                        </div>
                        <div className="opponent" index={index}>
                            <p>Score : {getPoints(index)}</p>
                        </div>
                    </div>
                )
            }
            </div>
            <div className="table-wrapper">
                {
                    (!game.mutual.flicked) ?
                    <div>
                        Couleur demandée:
                            <div className={[(playableCard.color) ? playableCard.color : "indefini", "playable"].join(' ')}>‎</div>
                    </div>:
                        (game.mutual.pool.length < game.mutual.flickSize) ?
                        <div className="buttonHolder">
                            Cartes défaussées: ({game.mutual.pool.length}/{game.mutual.flickSize})
                            {
                                (game.mutual.pool.length > 0) ? <button class="btn btn-danger" onClick={handleClear}>X</button>:""
                            }
                        </div>:
                        <div className="buttonHolder">
                            <button class="btn btn-success" onClick={handleFlick}>Valider la défausse</button>
                            <button class="btn btn-danger" onClick={handleClear}>X</button>
                        </div>

                }
                {
                    game.mutual.cursedCard  ? "" :
                    <div>
                        Carte Maudite : <div className={[game.mutual.cursedCard, "maudite"].join(' ')}>7</div>
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
                            game.mutual.pool.map((card) =>
                                <Card
                                    index={card.id}
                                    key={card.id}
                                    card={card}
                                    playable={false}
                                    context={"pool"}
                                    isHighest={highest.id == card.id}
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
                        game.individual.hand.map((card) =>
                            <Card
                                index={card.id}
                                key={card.id}
                                card={card}
                                playable={isPlayable(card)}
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
                user={userStats}
            />
        </div>
    );
}

export default Game;
