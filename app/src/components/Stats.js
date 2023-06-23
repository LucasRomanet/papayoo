import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';

const Stats = (props) => {
    let player = {
        name: "Guest",
        tag: "0000",
        games: 0,
        score: 0
    }
    if (props.player) player = props.player;
    const { name, tag, games, score } = player;
    return (
        <Modal show={props.isModalOpen} onHide={props.toggleModal}>
            <Modal.Header closeButton>
                <Modal.Title><h2>Statistiques du joueur</h2></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Pseudo : {name}
                <br />
                Tag : {tag}
                <br />
                Nombre de parties jouées : {games}
                <br />
                Score cumulé : {score}
            </Modal.Body>
        </Modal>
    );
}

export default Stats;
