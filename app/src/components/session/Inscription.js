import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/user/UserContext";
import UserForm from './UserForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';

import {getPlayer, register} from '../../api';


import UserProfile from '../../utils/UserProfile';

const Inscription = (props) => {
    
    const placeholder = {
        name: '',
        tag: '0001',
        password: ''
    };

    const navigate = useNavigate();
    
    const [name, setName] = useState(placeholder.name);
    const [tag, setTag] = useState(placeholder.tag);
    const [password, setPassword] = useState(placeholder.password);

    const { setUser } = useContext(UserContext);


    const submitValue = async () => {
        const formValues = {
            'name' : name,
            'tag' : tag,
            'password' : password
        }
        
        const socket = await UserProfile.getSocket();

        register(formValues).then(loginResponse => {
            if (loginResponse.status !== 200)
                return;
            
            getPlayer(name, tag).then(statResponse => {
                const loggedUser = {
                    player: {
                        name: name,
                        tag: tag,
                        games: statResponse.data[0].games,
                        score: statResponse.data[0].score
                    },
                    token: loginResponse.data
                }
                setUser(loggedUser);
                props.notify();
                socket.emit('login', loggedUser);
                navigate('/jouer');
            }).catch(error => {
                if (error.statResponse) console.error(error.message);
            });
        }).catch(error => {
            if (error.loginResponse) console.error(error.message);
        });
        
    }

    return (
        <Modal show={props.isModalOpen} onHide={props.toggleModal}>
            <Modal.Header closeButton>
                <Modal.Title><h2>Formulaire d'inscription</h2></Modal.Title>
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
                    Cancel
                </button>
            </Modal.Footer>
        </Modal>
    );

}

export default Inscription;
