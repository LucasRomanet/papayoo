import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';

import UserProfile from './utils/UserProfile';

class PlayerProfile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "Guest",
            tag: "0000",
            games: 0,
            score: 0
        }
    }

    render () {
        return (
            <Modal show={this.props.modalOpen} onHide={this.props.handleModalOpen}>
                <Modal.Header closeButton>
                    <Modal.Title><h2>Description du joueur</h2></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Pseudo : {this.props.player.name}
                    <br />
                    Tag : {this.props.player.tag}
                    <br />
                    Nombre de parties jouées : {this.props.player.games}
                    <br />
                    Score cumulé : {this.props.player.score}
                </Modal.Body>
          </Modal>
        );
    }
}

export default PlayerProfile;
