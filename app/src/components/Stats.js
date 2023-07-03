import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';

const Stats = (props) => {
    let user = {
        name: "Guest",
        tag: "0000",
        gamesPlayed: 0,
        score: 0
    };
    if (props.user) user = props.user;
    const { name, tag, gamesPlayed, score } = user;

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
                Nombre de parties jouées : {gamesPlayed}
                <br />
                Score cumulé : {score}
            </Modal.Body>
        </Modal>
    );
}

export default Stats;
