import { useContext, useState } from "react";
import GameContext from "../../../context/game/GameContext";
import { nametag }  from '../../../utils/tools';
import Stats from "../../Stats"

const Opponents = () => {

    const [userStats, setUserStats] = useState({});
    const [isStatModalOpen, setStatModalOpen] = useState(false);

    const { game } = useContext(GameContext);

    const handleModalStatsOpen = (id) => {
        if(id != null) {
            setUserStats(game.mutual.players[id].user);
        }
        setStatModalOpen(!isStatModalOpen);
    }

    const getPoints = (index) => {
        let player = game.mutual.players[index];
        if (player != null) {
            return player.points;
        }
        return 0;
    }

    return <div className="opponent-wrapper">
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
            <Stats
                isModalOpen={isStatModalOpen}
                toggleModal={handleModalStatsOpen}
                user={userStats}
            />
        </div>
};

export default Opponents;