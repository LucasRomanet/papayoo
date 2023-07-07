import { useContext, useState, useEffect } from "react";
import Pool from "./board/Pool";
import Hand from "./board/Hand";
import Results from "./board/Results";
import Opponents from "./board/Opponents";
import Discard from "./board/Discard";
import RequiredColor from "./board/RequiredColor";
import CursedCard from "./board/CursedCard";

import '../../style/game.css';
import { byId }  from '../../utils/tools';
import GameContext from "../../context/game/GameContext";

const Board = ({ roundResults} ) => {

    const [playableCard, setPlayableCard] = useState({
        requiredColor: null,
        noColorCardsLeft: false
    });

    const { game } = useContext(GameContext);

    useEffect(() => {
        let color = null;

        if (!game.mutual.discarding) {
            if (game.mutual.pool.length > 0) {
                color = game.mutual.pool[0].color;
            }
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

    

    const header = document.getElementsByClassName("header-wrapper")[0];
    if (header) header.style.display = "none";
    return (
        <div>
            <Opponents />

            <div className="game-info-wrapper">
                {
                    game.mutual.discarding
                        ? <Discard />
                        : roundResults != null
                            ? <Results roundResults={roundResults}/>
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

export default Board;
