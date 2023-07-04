import { useContext, useState, useEffect } from "react";
import Pool from "./board/Pool.js";
import Hand from "./board/Hand.js";
import Opponents from "./board/Opponents.js";
import Discard from "./board/Discard.js";
import RequiredColor from "./board/RequiredColor.js";
import CursedCard from "./board/CursedCard.js";
import { DragDropContext } from 'react-beautiful-dnd';
import '../../style/partie.css';
import { nametag, byId }  from '../../utils/tools.js';
import Stats from "../Stats.js"
import UserContext from "../../context/user/UserContext";
import GameContext from "../../context/game/GameContext.js";

const Game = () => {
    const [hand, setHand] = useState([]);
    const [pool, setPool] = useState([]);

    const [userStats, setUserStats] = useState({});
    const [isStatModalOpen, setStatModalOpen] = useState(false);
    const [playableCard, setPlayableCard] = useState({
        askedColor: null,
        noColorCardsLeft: false
    });

    const [highest, setHighest] = useState({
        id:-1,
        number:-1,
        color: null
    });

    const { user } = useContext(UserContext);
    const { game } = useContext(GameContext);

    useEffect(() => {
        setHand(game.individual.hand.sort(byId));
        setPool(game.mutual.pool);

        const last = pool.slice(-1);
        if (!last.length) {
            return;
        }

        const color = pool[0].color;

        setPlayableCard({
            askedColor: color,
            noColorCardsLeft: !isColorInHand(color)
        });

    }, [game]);

    

    const handleModalStatsOpen = (id) => {
        if(id != null) {
            setUserStats(game.mutual.players[id].user);
        }
        setStatModalOpen(!isStatModalOpen);
    }

    const isColorInHand = (color) => {
        for (const card of hand) {
            if (card.color === color) return true;
        }
        return false;
    }

    const isPlayable = (card) => {
        if (game.mutual.discarding) {
            return pool.length < game.mutual.discardSize;
        }

        const isPlayerTurn = nametag(user) == game.mutual.mustPlay;
        const isRequiredColor = playableCard.askedColor === card.color || playableCard.noColorCardsLeft;

        return isPlayerTurn && isRequiredColor;
    }

    const handleClick = (event) => {
        let playable = {
            askedColor: null,
            noColorCardsLeft: false
        }

        let id
        if (event.target) {
            id = event.target.closest(".card-container").id;
        }
        else if (event.destination && event.destination.droppableId === "pool") {
            id = event.draggableId;
        }
            
        else return;

        const cardIndex = hand.findIndex(card => card.id == id);
        const card = hand.splice(cardIndex, 1)[0];

        if (!isPlayable(card)) {
            return;
        }

        if (!game.mutual.discarding) {
            user.socket.emit('play', {gameCode: game.mutual.code, card: card});
        }

        if (!pool.length) {
            playable.askedColor = card.color;
        }

        pool.push(card);

        if (card.color === playableCard.askedColor && card.number > highest.number) setHighest(card);
        
        if (!game.mutual.discarding) {
            playable = {
                askedColor: playableCard.askedColor,
                noColorCardsLeft: !isColorInHand(playableCard.askedColor)
            }
        }

        setPlayableCard(playable);
    }

    const handleDiscard = (event) => {
        user.socket.emit('discard', {gameCode: game.mutual.code, cards: pool});
    }

    const handleClear = (event) => {
        setHand([...hand, ...pool].sort(byId));
        setPool([]);
    }

    return (
        <div>
            
            <Opponents handleModalStatsOpen={handleModalStatsOpen} />

            <div className="table-wrapper">
                {
                    game.mutual.discarding 
                        ? <Discard handleClear={handleClear} handleDiscard={handleDiscard} poolCardsAmount={pool.length} />
                        : <RequiredColor askedColor={playableCard.askedColor} />
                }
                {
                    game.mutual.cursedCard && <CursedCard cursedCardColor={game.mutual.cursedCard.color} />
                }
            </div>

            <DragDropContext onDragEnd={handleClick}>
                <Pool 
                    pool={pool}
                    highest={highest}
                />
                <Hand
                    hand={hand}
                    isPlayable={isPlayable}
                    handleClick={handleClick}
                />
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
