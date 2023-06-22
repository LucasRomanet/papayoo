import React, { useContext, useState, useEffect } from "react";
import Chat from "../Chat.js";
import Stats from "./Stats.js";
import UserProfile from '../../utils/UserProfile.js';
import PlayerContext from "../../context/player/PlayerContext";
import GameContext from "../../context/game/GameContext";
const socket = UserProfile.getSocket();


const Lobby = (props) => {
    const [playerStat, setPlayerStat] = useState({});

    const [isStatModalOpen, setStatModalOpen] = useState(false);

    const { player } = useContext(PlayerContext);
    const { game, setGame } = useContext(GameContext);

    useEffect(() => {
        socket.on("notify", (arg) => {
            const newGameState = JSON.parse(arg);
            setGame(newGameState);
        });
    }, []);

    useEffect(() => {
        console.log("Lobby : changement détecté !");
    }, [game]);

        // state = {
        //     status: 'STANDBY',
        //     maxplayer: 0,
        //     code: '',
        //     player: [],
        //     hand: {
        //         flicked :false,
        //         hand:[]
        //     },
        //     countdown: {
        //         start: false,
        //         init: 0,
        //         remaining: 0,
        //     },
        //     host: false,
        //     currentPlayerInformation: {},
        // }
    
    const isHost = () => {
        return UserProfile.nametag(game.player[0]) === UserProfile.nametag(player);
    }

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
        socket.emit('start', {gameCode: game.code});
    }
    
    const handleModalStatsOpen = (id) => {
        if(id != null) {
            setPlayerStat(game.player[id]);
        }
        setStatModalOpen(!isStatModalOpen);
    }
    
    return (
        <div className="jouer-wrapper">
            {
            (game.player.length < 3 ) ?
                <h2>En attente d'autres joueurs...</h2>:
                <h2>En attente du démarrage de la partie...</h2>

            }
            <div class="row justify-content-center" style={{'align-items': 'center'}}>
                <h3>Code de la partie: </h3>
                <button onClick={handleCopyCode} style={{'margin-left' : '5px'}} class="btn btn-info js-textareacopybtn">Copier</button>
                <input class="js-copytextarea" type="text"  value={game.code}></input>
            </div>
            <h3>Nombre de joueurs connecté {game.player.length}/{game.maxPlayer}</h3>
            {
                game.player.map((joueur, index) =>
                    <h4>
                        <a key={index} onClick={() => handleModalStatsOpen(index)} style={{cursor: 'pointer'}}>{joueur.name}#{joueur.tag} {(index===0) ? "[Host]" : ''}</a>
                    </h4>
                )
            }

            <button class="btn btn-primary" disabled={game.player.length < 3} 
                    style={{display: (isHost()) ? 'block' : 'none'}} 
                    onClick={handleSubmit}>
                        Démarrer la partie
            </button>
            <Stats
                modalOpen={isStatModalOpen}
                handleModalOpen={handleModalStatsOpen}
                player={playerStat}
            />
            <Chat code={game.code}/>
        </div>
    );
}

export default Lobby;
