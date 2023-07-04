import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import { useMemo } from 'react';

const DEFAULT_USER = {
    name: "Guest",
    tag: "0000",
    gamesPlayed: 0,
    score: 0
};

const Stats = ({ user, isModalOpen, toggleModal }) => {

    const { name, tag, gamesPlayed, score } = useMemo(() => {
        if (user) {
            return user;
        }
        return DEFAULT_USER;
    }, [user]);

    return (
        <Modal show={isModalOpen} onHide={toggleModal}>
            <Modal.Header closeButton>
                <Modal.Title><h2>Statistiques du joueur</h2></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Pseudo : {name}
                <br />
                Tag : {tag}
                <br />
                Nombre de parties jouées : {gamesPlayed}
                <br />
                Score cumulé : {score}
            </Modal.Body>
        </Modal>
    );
}

export default Stats;
