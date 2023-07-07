import { useContext, useState } from "react";
import GameContext from "../../../context/game/GameContext";
import UserContext from "../../../context/user/UserContext";

const Discard = () => {
    const [hasDiscarded, setDiscarded] = useState(false);

    const { user } = useContext(UserContext);
    const { game, setGame } = useContext(GameContext);


    const handleDiscard = () => {
        user.socket.emit('discard', {gameCode: game.mutual.code, cards: game.mutual.pool});
        setDiscarded(true);
    }

    const handleClear = () => {
        const hand = game.individual.hand;
        const pool = game.mutual.pool;

        setGame({
            individual: {
                ...game.individual,
                hand: [...hand, ...pool]
            },
            mutual: {
                ...game.mutual,
                pool: []
            }
        })
    }

    return (
        <div className="buttonHolder">
            
            <button 
                class="btn btn-success"
                onClick={handleDiscard}
                disabled={hasDiscarded || (game.mutual.pool.length < game.mutual.discardSize)}
            >
                {
                (game.mutual.pool.length < game.mutual.discardSize) ? 
                    `${game.mutual.pool.length}/${game.mutual.discardSize}`:
                    "Valider la défausse" 
                }
            </button>
            {game.individual.neighbor}
            <button
                class="btn btn-danger"
                onClick={handleClear}
                disabled={hasDiscarded}
            >
                X
            </button>
        </div>
    );
};

export default Discard;