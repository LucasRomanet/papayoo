import { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Chat from "../components/game/Chat";
import Lobby from "../components/game/Lobby";
import Board from "../components/game/Board";
import End from "../components/game/End";
import UserContext from "../context/user/UserContext";
import GameContext from "../context/game/GameContext";
import { END_ROUND_DELAY } from "../utils/consts";

import { joinGame } from "../endpoint";
import { leaveGame } from "../endpoint";


const Game = () => {
    const navigate = useNavigate();

    const [code, setCode] = useState(null);
    const [roundResults, setRoundResults] = useState(null);

    const { user } = useContext(UserContext);
    const { game, setGame } = useContext(GameContext);

    const params = useParams();
    // Réduire l'accès à certaines page aux joueurs connecté
    useEffect(() => {

        function onNotify(gameDTO) {
            setGame(JSON.parse(gameDTO));
        }

        function onResults(results) {
            setRoundResults(JSON.parse(results));
            setTimeout(() => {
                setRoundResults(null);
            }, END_ROUND_DELAY)
        }
        
        setCode(params.code);

        user.socket.on('notify', onNotify);
        user.socket.on('results', onResults);

        return () => {
            user.socket.off('notify', onNotify);
            user.socket.off('results', onResults);
        }

        
    }, []);

    useEffect(() => {
        if (!code) {
            return;
        }
        
        joinGame(code, user.token).then(response => {
            setGame(response.data);
        }).catch(error => {
            if (error.response)
                switch (error.response.status) {
                    case 400:
                        console.error("Requete malformée, paramètre(s) manquant(s)");
                        break;
                    case 401:
                        console.error(`Le joueur ${user.name} n'est pas reconnu par le serveur`);
                        break;
                    case 402:
                        console.error("Le joueur est déjà dans une partie");
                        break;
                    case 403:
                        console.error("Erreur token");
                        break;
                    case 404:
                        console.error("Partie complète");
                    default:
                        console.error(error.message);
                        break;
                }
            else console.error(error.message);
        });
    }, [code]);

    const leave = () => {
        leaveGame(user.token);
        navigate('/');
    }

    // Au lancement : récupère la partie à partir du code (url)
    //      -> si code invalide => go to accueil
    // Sinon, etat partie :
    // 1. Lobby => rejoindre le lobby
    // 2. En cours => passer en spectateur
    // 3. Terminée => ?


    // Life cycle de la partie
    // - avoir une liste de spectateurs
    // - Passe de TERMINEE = LOBBY => passer les spectateurs dans joueurs

    return (
        <div className="game-wrapper">
            
            {(!game) 
                ? <p>Loading</p>
                : (
                    <div>
                        <button onClick={leave} className="btn btn-danger">
                            Quitter
                        </button>
                        {(game.mutual.status === "WAITING") && <Lobby />}
                        {(game.mutual.status === "PLAYING") && <Board roundResults={roundResults} />}
                        {(game.mutual.status === "ENDING") && <End />}
                        <Chat />
                    </div>
                )}
            
        </div>
    );
}

export default Game;