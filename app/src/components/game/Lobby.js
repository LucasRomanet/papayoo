import React, { Component } from "react";
import Chat from "../Chat.js";
import { joinGame } from "../../api";
import Stats from "./Stats.js";
import UserProfile from '../../utils/UserProfile.js';
const socket = UserProfile.getSocket();

class Lobby extends Component {
    constructor(props) {
        super(props)
        let code = '';
        if (props.router.params && props.router.params.code) {
            code = props.router.params.code;
        }
        this.state = {
            status: 'STANDBY',
            maxplayer: 0,
            code: code,
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
    handleModalStatsOpen = (id) => {
        if(id != null) {
            this.setState({currentPlayerInformation : this.state.player[id]})
        }
        this.setState((prevState) => {
            return {
                modalStatsOpen: !prevState.modalStatsOpen
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
                if (this.state.status == 'PLAYING') {
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
                            if (this.state.countdown.remaining < 0 && this.state.status == 'PLAYING') {
                                clearInterval(cd);
                            }
                        })
                    }, 100)
                }
            });
         });
    }
    componentDidMount() {
        this.socketFunction();
    }
    render() {
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
                        <h4><a key={index} onClick={() => this.handleModalStatsOpen(index)} style={{cursor: 'pointer'}}>{joueur.name}#{joueur.tag} {(index==0 && !this.state.countdown.start) ? "[Host]" : ''}</a></h4>
                    )
                }
                {
                    (this.state.countdown.remaining) ?
                    <div>La partie va démarrer dans: {this.state.countdown.remaining}</div>:
                    <button class="btn btn-primary" disabled={this.state.player.length < 3 || this.state.countdown.start} style={{display: (this.state.host) ? '' : 'none'}} onClick={this.handleSubmit}>Démarrer la partie</button>
                }
                <Stats
                    modalOpen={this.state.modalStatsOpen}
                    handleModalOpen={this.handleModalStatsOpen}
                    player={this.state.currentPlayerInformation}
                />
                <Chat code={this.state.code}/>
            </div>
        );
    }
}
export default Lobby;
