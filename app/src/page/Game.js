import React, { Component } from "react";
import withRouter from "../utils/withRouter.js";
import UserProfile from '../utils/UserProfile.js';
import { joinGame } from "../api";
import Chat from "../components/Chat.js";
import Lobby from "../components/game/Lobby.js";
import Board from "../components/game/Board.js";
import End from "../components/game/End.js";

class Game extends Component {

    constructor(props) {
        super(props);

        this.state = {
            code: props.router.params.code
        }

    }

    // Réduire l'accès à certaines page aux joueurs connecté

    componentDidMount() {
        joinGame(this.state.code, {
            ...UserProfile.getPlayer(),
            token: UserProfile.getToken()
        }).then(response => {
            this.setState({
                game: response.data
            });
        }).catch(error => {
            if (error.response)
                switch (error.response.status) {
                    case 400:
                        console.error("Requete malformée, paramètre(s) manquant(s)");
                        break;
                    case 401:
                        console.error("Le joueur "+this.state.joueur.name+" n'est pas reconnu par le serveur");
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
        this.socketFunction();
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

    render() {
        return (
            <div className="game-wrapper">
                {(!this.state.game) 
                    ? <p>Loading</p>
                    : (
                        <div>
                            {(this.state.game.status === "WAITING") && <Lobby />}
                            {(this.state.game.status === "PLAYING") && <Board />}
                            {(this.state.game.status === "ENDING") && <End />}
                            <Chat code={this.state.code}/>
                        </div>
                    )}
                
            </div>
        );
    }
}

export default withRouter(Game);