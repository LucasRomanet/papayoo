import { useContext, useState, useEffect } from "react";
import Stats from "../Stats.js";
import UserContext from "../../context/user/UserContext";
import GameContext from "../../context/game/GameContext.js";

const MIN_PLAYER_TO_START = process.env.NODE_ENV === 'development' ? 1 : 3;

const Lobby = () => {

    const [userStats, setUserStats] = useState({});
    const [isStatModalOpen, setStatModalOpen] = useState(false);

    const { user } = useContext(UserContext);
    const { game } = useContext(GameContext);
    

    const handleCopyCode = () => {
        let copyTextarea = document.querySelector('.js-copytextarea');
        copyTextarea.focus();
        copyTextarea.select();
        document.execCommand('copy');
        let btn = document.querySelector('.js-textareacopybtn');
        btn.classList.remove("btn-info");
        btn.classList.add("btn-success");
    }

    const handleSubmit = (event) => {
        user.socket.emit('start', {gameCode: game.mutual.code});
    }
    
    const handleModalStatsOpen = (id) => {
        if(id != null && game != null && game.mutual != null) {
            const player = game.mutual.players[id];
            if (player != null) {
                setUserStats(player.user);
            }
        }
        setStatModalOpen(!isStatModalOpen);
    }
    
    return (
        <div className="jouer-wrapper">
            {
            (game.mutual.players.length < MIN_PLAYER_TO_START ) ?
                <h2>En attente d'autres joueurs...</h2>:
                <h2>En attente du démarrage de la partie...</h2>

            }
            <div class="row justify-content-center" style={{'align-items': 'center'}}>
                <h3>Code de la partie: </h3>
                <button onClick={handleCopyCode} style={{'margin-left' : '5px'}} class="btn btn-info js-textareacopybtn">Copier</button>
                <input class="js-copytextarea" type="text"  value={game.mutual.code}></input>
            </div>
            <h3>Nombre de joueurs connecté {game.mutual.players.length}/{game.mutual.maxPlayer}</h3>
            {
                game.mutual.players.map((player, index) =>
                    <h4>
                        <a key={index} onClick={() => handleModalStatsOpen(index)} style={{cursor: 'pointer'}}>{player.user.name}#{player.user.tag} {player.isHost ? "[Host]" : ''}</a>
                    </h4>
                )
            }

            <button class="btn btn-primary" disabled={game.mutual.players.length < MIN_PLAYER_TO_START} 
                    style={{display: (game.individual.isHost) ? 'block' : 'none'}} 
                    onClick={handleSubmit}>
                        Démarrer la partie
            </button>
            
            <Stats
                isModalOpen={isStatModalOpen}
                toggleModal={handleModalStatsOpen}
                user={userStats}
            />
        </div>
    );
}

export default Lobby;
