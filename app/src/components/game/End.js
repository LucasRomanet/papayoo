import { useContext } from "react";
import GameContext from "../../context/game/GameContext";
import { nametag , byPoints }  from '../../utils/tools';

const End = () => {

    const { game } = useContext(GameContext);

    return (
        <div className="end-wrapper">
            <h1>Fin de la partie!</h1>
            <h2>Résultats:</h2>
            {
                game.mutual.players.sort(byPoints).map((player, index) =>
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
