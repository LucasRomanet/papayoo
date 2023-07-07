import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/user/UserContext";
import UserForm from './UserForm';
import Modal from 'react-bootstrap/Modal';

import { login } from "../../endpoint";

const Connexion = (props) => {
    
    let placeholder = {
        name: '',
        tag: '0001',
        password: ''
    };

    if (process.env.NODE_ENV === 'development') {
        placeholder = {
            name: 'Jeremy',
            tag: '0001',
            password: 'Jeremy'
        }
    }

    const navigate = useNavigate();
    
    const [name, setName] = useState(placeholder.name);
    const [tag, setTag] = useState(placeholder.tag);
    const [password, setPassword] = useState(placeholder.password);

    const { user, setUser } = useContext(UserContext);

    const submitValue = () => {
        const formValues = {
            'name' : name,
            'tag' : tag,
            'password' : password
        }
        
        const socket = user.socket;

        login(formValues).then(loginResponse => {
            if (loginResponse.status !== 200) {
                return;
            }
            const { name, tag, token } = loginResponse.data;

            const loggedUser = {...user, ...loginResponse.data};
            setUser(loggedUser);

            socket.emit('login', { name, tag, token });
            
            navigate('/jouer');
        }).catch(error => {
            if (error.loginResponse) console.error(error.message);
        });
        
    }

    return (
        <Modal show={props.isModalOpen} onHide={props.toggleModal}>
            <Modal.Header closeButton>
                <Modal.Title><h2>Formulaire de Connexion</h2></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <UserForm
                    placeholder={{name, tag, password}}
                    mutator={{setName, setTag, setPassword}}
                    submit={submitValue}
                />
            </Modal.Body>
            <Modal.Footer>
                <button className="btn-red" onClick={props.handleModalOpen}>
                    Annuler
                </button>
            </Modal.Footer>
        </Modal>
    );
}


export default Connexion;
