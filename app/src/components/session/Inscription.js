import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/user/UserContext";
import UserForm from './UserForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import { CLOSE_AFTER_SUCCESS_DELAY } from "../../utils/consts";

import { register } from '../../endpoint';


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
    const [success, setSuccess] = useState(false);

    const { user, setUser } = useContext(UserContext);

    const submitValue = () => {
        const formValues = {
            'name' : name,
            'tag' : tag,
            'password' : password
        }
        
        const socket = user.socket;

        register(formValues).then(loginResponse => {
            if (loginResponse.status !== 200) {
                return;
            }
        
            const { name, tag, token } = loginResponse.data;

            const loggedUser = {...user, ...loginResponse.data};
            setUser(loggedUser);

            socket.emit('login', { name, tag, token });
            
            setSuccess(true);
            setTimeout(() => {
                props.toggleModal();
                setTimeout(() => {
                    setSuccess(false);
                    setPassword('');
                }, (200));
            }, CLOSE_AFTER_SUCCESS_DELAY);
            
            navigate('/jouer'); 
        }).catch(error => {
            if (error.loginResponse) console.error(error.message);
        });
        
    }

    return (
        <Modal show={props.isModalOpen} onHide={props.toggleModal}>
            <Modal.Header closeButton>
                <Modal.Title><h2>Inscription</h2></Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {
                success ?
                <div>
                    <h3>Bienvenue {name}#{tag}!</h3>
                </div>
                :
                <UserForm
                    placeholder={{name, tag, password}}
                    mutator={{setName, setTag, setPassword}}
                    submit={submitValue}
                />
            }
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
