import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../style/play.css';
import UserContext from "../context/user/UserContext";
import { createGame } from "../endpoint";

const Play = () => {
    
    const [code, setCode] = useState(null);

    const { user } = useContext(UserContext);
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
    
    const handleCreate = () => {
        createGame(user.token)
        .then(response => {
            handleSubmit(response.data);
        }).catch(error => {
            if (error.response)
                console.error(error.response.status) 
            else console.error(error.message);
        });
        
    }
    const handleJoin = () => {
        if (code) handleSubmit(code)
    }
    const enterFunction = (event) => {
        if (event.charCode === 13) {
            if (code) handleSubmit(code);
        }
    }
    
    return (
        <div className="play-wrapper">
            <div className="play-form">
                <div className="divHolder">
                <button class="btn btn-primary" onClick={handleCreate}>Créer une partie</button>
                </div>
                <div className="divHolder" >
                    <h3>OU</h3>
                </div>
                <div className="divHolder" >
                    <div class="form-inline">
                        <div className="blank">&#8203;</div>
                    <input class="form-control" type="text" placeholder="Code de Partie" autoFocus value={code} onChange={handleChangeCode} onKeyDown={enterFunction} />

                    <button class="btn btn-warning" onClick={handleJoin}>Rejoindre</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Play;
