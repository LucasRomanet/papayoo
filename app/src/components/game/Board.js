import { useContext, useState, useEffect } from "react";
import Pool from "./board/Pool";
import Hand from "./board/Hand";
import Opponents from "./board/Opponents";
import Discard from "./board/Discard";
import RequiredColor from "./board/RequiredColor";
import CursedCard from "./board/CursedCard";

import '../../style/game.css';
import { byId }  from '../../utils/tools';
import GameContext from "../../context/game/GameContext";

const Game = () => {

    const [playableCard, setPlayableCard] = useState({
        requiredColor: null,
        noColorCardsLeft: false
    });

    const { game } = useContext(GameContext);

    useEffect(() => {
        const last = game.mutual.pool.slice(-1);
        if (!last.length) {
            return;
        }

        let color = null;
        if (game.mutual.pool.length < game.mutual.players.length && !game.mutual.discarding) {
            color = game.mutual.pool[0].color;
        }

        setPlayableCard({
            requiredColor: color,
            noColorCardsLeft: !isColorInHand(color)
        });

    }, [game]);
    

    const isColorInHand = (color) => {
        for (const card of game.individual.hand) {
            if (card.color === color) return true;
        }
        return false;
    }



    return (
        <div>
            <Opponents />

            <div className="game-info-wrapper">
                {
                    game.mutual.discarding 
                        ? <Discard />
                        : <RequiredColor color={playableCard.requiredColor} />
                }
                {
                    game.mutual.cursedCard && <CursedCard color={game.mutual.cursedCard.color} />
                }
            </div>

            <div className="table-wrapper">
                <Pool 
                    pool={game.mutual.pool}
                />
                <Hand
                    hand={game.individual.hand.sort(byId)}
                    playableCard={playableCard}
                />
            </div>
            
        </div>
    );
}

export default Game;
