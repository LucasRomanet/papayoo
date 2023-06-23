import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../style/jouer.css';
import UserContext from "../context/user/UserContext";
import { createGame } from "../api";

const Jouer = () => {
    
    const [code, setCode] = useState(null);

    const { user } = useContext(UserContext);
    console.log(user);
    const navigate = useNavigate();

    useEffect(() => {
        user.socket.emit('ask');
    }, []);

    const handleChangeCode = (event) => {
        let codeInput = event.target.value;
        if (codeInput.length <= 6) {
            setCode(codeInput);
        }
        else {
            handleSubmit(codeInput);
        }
    }
    const handleSubmit = (code='') => {
        navigate(`/partie/${code.toUpperCase()}`);
    }
    
    const handleCreate = (event) => {
        createGame(user.token)
        .then(response => {
            handleSubmit(response.data.code);
        }).catch(error => {
            if (error.response)
                console.error(error.response.status) 
            else console.error(error.message);
        });
        
    }
    const handleJoin = (event) => {
        if (code) handleSubmit(code)
    }
    const enterFunction = (event) => {
        if (event.charCode === 13) {
            if (code) handleSubmit(code);
        }
    }
    
    return (
        <div className="jouer-wrapper">
            <div className="jouer-form">
                <div className="divHolder">
                <button class="btn btn-primary" onClick={handleCreate}>Créer une partie</button>
                </div>
                <div className="divHolder" >
                    <h3>OU</h3>
                </div>
                <div className="divHolder" >
                    <div class="form-inline">
                        <div className="blank">&#8203;</div>
                    <input class="form-control" type="text" placeholder="Code de Partie" autoFocus value={code} onChange={handleChangeCode} onKeyPress={enterFunction} />

                    <button class="btn btn-warning" onClick={handleJoin}>Rejoindre</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Jouer;
