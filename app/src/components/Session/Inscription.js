import React, {Component} from "react";

import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';

import {getPlayer, register} from '../../api';


import UserProfile from '../../utils/UserProfile';

class Inscription extends Component {

    constructor(props) {
        super(props)
        this.state = {
            name: '',
            password: '',
            tag: '',
            registered: false,
            loading: false
        }

        this.handleSignup = this.handleSignup.bind(this);
        this.setPlayer = this.setPlayer.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleInput(event) {
        const newState = {...this.state};
        newState[`${event.target.id}`] = event.target.value;
        this.setState(newState);
    }

    async handleKeyPress(event) {
        if (event.key === 'Enter') {
            await this.handleSignup(event);
        }
    }

    async handleSignup(event) {
        event.preventDefault();

        if (this.state.loading || this.state.registered || this.state.name.length === 0 || this.state.password.length === 0)
            return;

        const socket = await UserProfile.getSocket();

        const sentPlayer = {
            name: this.state.name,
            password: this.state.password
        };

        this.setState({loading: true});

        register(sentPlayer).then(async response => {
            const {tag, token} = response.data;

            this.setState({
                tag,
                registered: true
            });

            UserProfile.setToken(token);

            socket.emit('login', {name: this.state.name, tag: this.state.tag, token});

            await this.setPlayer();
        }).catch(error => {
            if (error.response) console.error(error.message);
            this.setState({loading: false});
        });
    }

    async setPlayer() {
        getPlayer(this.state.name, this.state.tag).then(response => {
            const realPlayer = {
                name: this.state.name,
                tag: this.state.tag,
                games: response.data[0].games,
                score: response.data[0].score
            }
            UserProfile.setPlayer(realPlayer);
            this.props.notify();
            this.setState({loading: false});
        }).catch(error => {
            if (error.response) console.error(error.message);
            this.setState({loading: false});
        });
    }

    render() {
        if (this.state.registered) {
            return (
                <div>
                    <br/>
                    <p>Votre compte a bien été créé !</p>
                    <p>Votre login est {this.state.name}#{this.state.tag}</p>
                </div>
            );
        }
        return (
            <Modal show={this.props.modalOpen} onHide={this.props.handleModalOpen}>
                <Modal.Header closeButton>
                    <Modal.Title><h2>Formulaire d'inscription</h2></Modal.Title>
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
                                onClick={this.handleSignup}
                                disabled={this.state.loading}>S'inscrire
                        </button>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn-red" onClick={this.props.handleModalOpen}>
                        Cancel
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default Inscription;
