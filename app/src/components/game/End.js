import { useContext } from "react";
import GameContext from "../../context/game/GameContext.js";
import { nametag }  from '../../utils/tools.js';

function byScore(a, b) {return a.points - b.points};

const End = () => {

    const { game } = useContext(GameContext);

    // let navbar = document.getElementsByClassName("navbar")[0];
    // if (navbar) navbar.style.display = "flex";

    return (
        <div className="end-wrapper">
            <h1>Fin de la partie</h1>
            <h2>Résultats:</h2>
            {
                game.players.map((player, index) =>
                    <div>
                        <h3>{index+1}</h3>
                        <h4>{nametag(player.user)}: {player.points} points</h4>
                    </div>
                )
            }
        </div>
    );
}

export default End;
