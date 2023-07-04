import { useState, useContext, useEffect } from "react";
import UserContext from "../../context/user/UserContext";
import GameContext from "../../context/game/GameContext";
import "../../style/chat.css";

const Chat = () => {
    const [chatInput, setChatInput] = useState('');

    const [chat, setChat] = useState([]);
    const { user } = useContext(UserContext);
    const { game } = useContext(GameContext);

    useEffect(() => {
        function onMessageReceived(receivedMessage) {
            const newMessage = JSON.parse(receivedMessage);
            setChat((chatState) => [...chatState, newMessage]);
        }

        user.socket.on('message', onMessageReceived);
        
        return () => {
            user.socket.off('message', onMessageReceived);
        };
    }, []);

    const handleMessage = (event) => {
        if (chatInput) user.socket.emit('message', {gameCode: game.mutual.code, text: chatInput});
        setChatInput('');
    }
    const enterFunction = (event) => {
        if (event.charCode === 13) {
            handleMessage();
        }
    }

    return (
        <div className="chat-wrapper">
            <div className="chat-header">
                Discutez avec le salon
            </div>
            <div className="chat-content">
            {
                chat.map((message, index) =>
                    <div key={index} className="chat-post"><div>{message.userNameTag}</div><div>{message.text}</div></div>
                )
            }
                <div className="chat-input">
                    <input type="text" autoFocus name="chat" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={enterFunction}/>
                    <button className="btn btn-primary" onClick={handleMessage}>Envoyer</button>
                </div>
            </div>
        </div>
    );

}
export default Chat;
