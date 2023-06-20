import React, {Component} from "react";

import Modal from 'react-bootstrap/Modal';

import UserProfile from '../../utils/UserProfile';
import {getPlayer, login} from "../../api";

class Connexion extends Component {

    constructor(props) {
        super(props);
        if (process.env.NODE_ENV = 'development') {
            this.state = {
                name: 'Jeremy#0001',
                password: 'Jeremy',
                logged: false,
                loading: false
            }
        } else {
            this.state = {
                name: '',
                password: '',
                logged: false,
                loading: false
            }
        }
        

        this.handleInput = this.handleInput.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleSign = this.handleSign.bind(this);
        this.loginPlayer = this.loginPlayer.bind(this);
        this.setPlayer = this.setPlayer.bind(this);
    }

    handleInput(event) {
        const newState = {...this.state};
        newState[`${event.target.id}`] = event.target.value;
        this.setState(newState);
    }

    async handleKeyPress(event) {
        if (event.key === 'Enter') {
            await this.handleSign(event);
        }
    }

    async handleSign (event) {
        event.preventDefault();

        const splitName = this.state.name.split('#');
        if (this.state.loading || this.state.logged || splitName.length < 2 || this.state.password.length === 0)
            return;

        await this.loginPlayer(splitName[0], splitName[1], this.state.password);
    }

    async loginPlayer(name, tag, password) {
        const socket = await UserProfile.getSocket();
        this.setState({ loading: true });

        const sentPlayer = {name, tag, password};
        login(sentPlayer).then(async response => {
            if (response.status !== 200)
                return;

            const token = response.data;

            UserProfile.setToken(token);

            const player = {
                name: sentPlayer.name,
                tag: sentPlayer.tag
            };
            UserProfile.setPlayer(player);
            socket.emit('login', {...player, token});
            await this.setPlayer(sentPlayer.name, sentPlayer.tag);
        }).catch(error => {
            if (error.response) console.error(error.message);
            this.setState({ loading: false });
        });
    }

    async setPlayer(name, tag) {
        getPlayer(name, tag).then(response => {
            const realPlayer = {
                name: name,
                tag: tag,
                games: response.data[0].games,
                score: response.data[0].score
            }
            UserProfile.setPlayer(realPlayer);
            this.props.notify();

            this.setState({
                logged: true,
                loading: false
            });
        }).catch(error => {
            if (error.response) console.error(error.message);
            this.setState({ loading: false });
        });
    }

    render() {
        if (this.state.logged) {
            return (
                <redirect to={{
                    pathname: "/jouer",
                }}/>
            )
        }
        return (
            <Modal show={this.props.modalOpen} onHide={this.props.handleModalOpen}>
                <Modal.Header closeButton>
                    <Modal.Title><h2>Formulaire de Connexion</h2></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="form-part">
                            <label htmlFor="name">
                                Nom de joueur :
                            </label>
                            <input type="text"
                                   id="name"
                                   placeholder="Pseudonyme"
                                   value={this.state.name}
                                   readOnly={this.state.loading}
                                   onChange={this.handleInput}
                                   onKeyPress={this.handleKeyPress}/>
                        </div>
                        <div className="form-part">
                            <label htmlFor="password">
                                Mot de passe :
                            </label>
                            <input type="password"
                                   id="password"
                                   placeholder="Mot de passe"
                                   value={this.state.password}
                                   readOnly={this.state.loading}
                                   onChange={this.handleInput}
                                   onKeyPress={this.handleKeyPress}/>
                        </div>
                        <button className="btn-blue"
                                type="submit"
                                onClick={this.handleSign}
                                disabled={this.state.loading}>Connexion
                        </button>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-red" onClick={this.props.handleModalOpen}>
                        Annuler
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}


export default Connexion;
