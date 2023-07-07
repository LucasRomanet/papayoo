import Draggable from 'react-draggable';
import { useContext, useState } from "react";
import UserContext from "../../../context/user/UserContext";
import GameContext from "../../../context/game/GameContext";
import DroppableContext from "../../../context/droppable/DroppableContext";
import { pointIntersects }  from '../../../utils/tools';

// Highest amount of movement (in px) not considered
const noMovementEpsilon = 5;

function Card({index, card, context, isPlayable}) {

    const { user } = useContext(UserContext);
    const { game, setGame } = useContext(GameContext);
    
    const { droppable } = useContext(DroppableContext);
    const [position, setPosition] = useState(null);


    const handlePickUp = () => {
        setPosition({ x: 0, y: 0 })
    }

    const handleDrop = (event, data) => {
        if (!isPlayable) {
            return;
        }

        const poolBoundingRect = droppable.current.getBoundingClientRect();
        const landingPosition = { x: event.clientX, y: event.clientY};
        const relativePosition = { x: data.x, y: data.y };
        const almostNoMovement = relativePosition.x <= noMovementEpsilon && relativePosition.y <= noMovementEpsilon;

        if (!pointIntersects(landingPosition, poolBoundingRect) && !almostNoMovement) {
            setPosition({ x: 0, y: 0 });
            return;
        }
        
        // Let the API handle the game state
        if (!game.mutual.discarding) {
            user.socket.emit('play', { gameCode: game.mutual.code, card: card });
            return;
        }

        // Handle the game state locally
        if (almostNoMovement) {
            setPosition({ x: 0, y: 0 });
        } else {
            setPosition(relativePosition);
        }
        
        const hand = game.individual.hand;
        const pool = game.mutual.pool;

        const cardIndex = hand.indexOf(card);
        if (cardIndex > -1) {
            hand.splice(cardIndex, 1);
        }
        
        pool.push(card);

        setGame({
            individual: {
                ...game.individual,
                hand: hand
            },
            mutual: {
                ...game.mutual,
                pool: pool
            }
        });
        
    }

    return (
        <Draggable
            position={position} 
            onStart={handlePickUp}
            onStop={handleDrop}
            disabled={!isPlayable}
        >
            <div
                style={{
                        userSelect: "none",
                        marginLeft: (context==="hand")
                            ? "-35px"
                            : "-20px"
                        }
                    }
                id={index}
                className={[card.color, "card-container"].join(' ')}>
                <div
                    className="card-overlay"
                    style={{
                        background: isPlayable || context==="pool" ?
                            "":
                            "rgba(160,160,160,.5)"
                    }}>
                    <p className="top-left">{card.number}</p>
                    <p className="bottom-right">{card.number}</p>
                </div>
            </div>
        </Draggable>
    )
}
export default Card;
