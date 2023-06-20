import React, { Component } from "react";
import {
    redirect
} from "react-router-dom";
import axios from 'axios';
import './style/jouer.css';
import UserProfile from './utils/UserProfile';
import Domain from './utils/Domain';
import {createGame, joinGame} from "./api";
const socket = UserProfile.getSocket();

class Jouer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            token: false,
            joueur: {},
            gameCode: '',
            gameRoom: {},
            host: false,
            redirect: false,
        };
        this.enterFunction = this.enterFunction.bind(this);
    }


    handleChangeCode = (event) => {
        let code = event.target.value;
        if (code.length <= 6) {
            this.setState({gameCode: code});
        }
        else {
            this.handleSubmit(this.state.gameCode);
        }
    }
    handleSubmit(code='') {
        code = code.toUpperCase();
        joinGame(code, {
            ...this.state.joueur,
            token: this.state.token
        }).then(response => {
            this.setState({
                gameRoom: response.data,
                host: (!code.length),
                redirect: true
            })

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
    }
    handleCreate = (event) => {
        this.handleSubmit()
    }
    handleJoin = (event) => {
        if (this.state.gameCode) this.handleSubmit(this.state.gameCode)
    }
    enterFunction = (event) => {
        if (event.charCode === 13) {
            if (this.state.gameCode) this.handleSubmit(this.state.gameCode);
        }
    }
    socketFunction = (event) => {

        socket.on("notify", (arg)=> {
            const newState = JSON.parse(arg);
            this.setState({
                gameRoom: newState,
                host: UserProfile.nametag(newState.player[0])==UserProfile.nametag(),
                redirect: true
            })
         });
    }
    componentDidMount() {
        this.setState({
            token: UserProfile.getToken(),
            joueur: UserProfile.getPlayer()
        });
        this.socketFunction();
        socket.emit('ask');
    }
    render() {
        if (!this.state.redirect) {
            return (
                    <div className="jouer-wrapper">
                        <div className="jouer-form">
                            <div className="divHolder">
                            <button class="btn btn-primary" onClick={this.handleCreate}>Créer une partie</button>
                            </div>
                            <div className="divHolder" >
                                <h3>OU</h3>
                            </div>
                            <div className="divHolder" >
                                <div class="form-inline">
                                    <div className="blank">&#8203;</div>
                                <input class="form-control" type="text" placeholder="Code de Partie" autoFocus value={this.state.gameCode} onChange={this.handleChangeCode} onKeyPress={this.enterFunction} />

                                <button class="btn btn-warning" onClick={this.handleJoin}>Rejoindre</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
        return (
            <redirect to={{
                pathname: "/lobby",
                state: {
                    ...this.state.gameRoom,
                    joueur: this.state.joueur,
                    host: this.state.host
                }
            }}/>
        )
    }
}

export default Jouer;
