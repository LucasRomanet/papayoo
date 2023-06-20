import React, { Component } from "react";
import {
  redirect
} from "react-router-dom";
import Chat from "./Chat.js";
import PlayerProfile from "./PlayerProfile.js";

import UserProfile from './utils/UserProfile.js';
const socket = UserProfile.getSocket();

class Lobby extends Component {
    constructor(props) {
        super(props)
        this.state = {
            status: {value : 1, name : "standby"},
            maxplayer: 0,
            code: '',
            player: [],
            hand: {
                flicked :false,
                hand:[]
            },
            countdown: {
                start: false,
                init: 0,
                remaining: 0,
            },
            host: false,
            redirect: false,
            currentPlayerInformation: {},
        }
    }
    handleCopyCode(){
        let copyTextarea = document.querySelector('.js-copytextarea');
        copyTextarea.focus();
        copyTextarea.select();
        document.execCommand('copy');
        let btn = document.querySelector('.js-textareacopybtn');
        btn.classList.remove("btn-info");
        btn.classList.add("btn-success");
    }
    handleSubmit = (event) => {
        socket.emit('start', {gameCode: this.state.code});
    }
    handleModalPlayerProfileOpen = (id) => {
        if(id != null) {
            this.setState({currentPlayerInformation : this.state.player[id]})
        }
        this.setState((prevState) => {
            return {
                modalPlayerProfilOpen: !prevState.modalPlayerProfilOpen
            }
        });
    }
    socketFunction = (event) => {
        socket.on("notify", (arg)=> {
            const newState = JSON.parse(arg);
            let player = this.state.player;
            this.setState({
                ...newState
            }, ()=> {
                if (this.state.status.value == 2) {
                    this.setState({
                        countdown: {
                            start: true,
                            init: new Date().getTime(),
                            remaining: 6
                        }
                    })
                    let cd = setInterval(()=> {
                        this.setState({
                           countdown:{
                               ...this.state.countdown,
                               remaining: Math.floor((this.state.countdown.init-new Date().getTime()+5000)/1000)
                           }
                       },()=> {
                           if (this.state.countdown.remaining < 0 && this.state.status.value == 2) {
                               this.setState({redirect: true});
                               clearInterval(cd);
                           }
                       })
                    }, 100)
                }
            });
         });
    }
    componentDidMount() {
        this.setState({
            ...this.props.location.state
        });
        this.socketFunction();
    }
    render() {
        if (!this.state.redirect)
            return (
                    <div className="jouer-wrapper">
                        {
                        (this.state.player.length < 3 ) ?
                            <h2>En attente d'autres joueurs...</h2>:
                            <h2>En attente du démarrage de la partie...</h2>

                        }
                        <div class="row justify-content-center" style={{'align-items': 'center'}}>
                            <h3>Code de la partie: </h3>
                            <button onClick={this.handleCopyCode} style={{'margin-left' : '5px'}} class="btn btn-info js-textareacopybtn">Copier</button>
                            <input class="js-copytextarea" type="text"  value={this.state.code}></input>
                        </div>
                        <h3>Nombre de joueurs connecté {this.state.player.length}/{this.state.maxPlayer}</h3>
                        {
                            this.state.player.map((joueur, index) =>
                                <h4><a key={index} onClick={() => this.handleModalPlayerProfileOpen(index)} style={{cursor: 'pointer'}}>{joueur.name}#{joueur.tag} {(index==0 && !this.state.countdown.start) ? "[Host]" : ''}</a></h4>
                            )
                        }
                        {
                            (this.state.countdown.remaining) ?
                            <div>La partie va démarrer dans: {this.state.countdown.remaining}</div>:
                            <button class="btn btn-primary" disabled={this.state.player.length < 3 || this.state.countdown.start} style={{display: (this.state.host) ? '' : 'none'}} onClick={this.handleSubmit}>Démarrer la partie</button>
                        }
                        <PlayerProfile
                            modalOpen={this.state.modalPlayerProfilOpen}
                            handleModalOpen={this.handleModalPlayerProfileOpen}
                            player={this.state.currentPlayerInformation}
                        />
                        <Chat code={this.props.location.state.code}/>
                    </div>
                );
            return (
                <redirect to={{
                    pathname: "/partie",
                    state: {
                        hand: this.state.hand,
                        player: this.state.player,
                        status: this.state.status,
                        code: this.state.code
                    }
                }}/>
            )
        }

    }

export default Lobby;
