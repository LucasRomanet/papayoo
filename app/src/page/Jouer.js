import React, { Component } from "react";
import withRouter from "../utils/withRouter.js";
import '../style/jouer.css';
import UserProfile from '../utils/UserProfile';
import { createGame } from "../api";
const socket = UserProfile.getSocket();

class Jouer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            token: false,
            joueur: {},
            gameCode: '',
            host: false,
        };
        this.enterFunction = this.enterFunction.bind(this);
        this.navigate = props.router.navigate;
    }

    componentDidMount() {
        this.setState({
            token: UserProfile.getToken(),
            joueur: UserProfile.getPlayer()
        });
        this.socketFunction();
        socket.emit('ask');
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
        this.navigate(`/partie/${code.toUpperCase()}`);
    }
    
    handleCreate = (event) => {
        createGame({
            ...UserProfile.getPlayer(),
            token: UserProfile.getToken()
        }).then(response => {
            this.handleSubmit(response.data.code);
        }).catch(error => {
            if (error.response)
                console.error(error.response.status) 
            else console.error(error.message);
        });
        
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
                host: UserProfile.nametag(newState.player[0]) === UserProfile.nametag(),
            })
        });
    }
    
    render() {
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
}

export default withRouter(Jouer);
