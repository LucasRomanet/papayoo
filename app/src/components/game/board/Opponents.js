import { useContext } from "react";
import GameContext from "../../../context/game/GameContext.js";
import { nametag }  from '../../../utils/tools.js';

const Opponents = ({ handleModalStatsOpen }) => {

    const { game } = useContext(GameContext);

    const getPoints = (index) => {
        let player = game.mutual.players[index];
        if (player != null) {
            return player.points;
        }
        return 0;
    }

    

    return <div className="information">
        <div className="opponent-wrapper">
            {
                game.mutual.players.map((player, index) =>
                    <div className={[(nametag(player.user) === game.mutual.mustPlay) ? "must-play":"", "player-wrapper"].join(' ')} >
                        <div className="opponent" index={index}>
                            <a key={index} onClick={() => handleModalStatsOpen(index)} style={{cursor: 'pointer'}} >{player.user.name}#{player.user.tag}</a>
                        </div>
                        <div className="opponent" index={index}>
                            <p>Points : {getPoints(index)}</p>
                        </div>
                    </div>
                )
            }
        </div>
    </div>;
};

export default Opponents;