import { useState, useContext, useEffect } from "react";
import ChatContext from "../context/chat/ChatContext";
import UserContext from "../context/user/UserContext";
import "../style/chat.css";



const Chat = (props) => {
    const [chatInput, setChatInput] = useState('');

    const { chat, setChat } = useContext(ChatContext);
    const { user } = useContext(UserContext);

    useEffect(() => {
        socketFunction();
    }, []);

    const handleMessage = (event) => {
        if (chatInput) user.socket.emit('message', {gameCode: props.code, text: chatInput});
        setChatInput('');
    }
    const enterFunction = (event) => {
        if (event.charCode === 13) {
            handleMessage();
        }
    }
    const socketFunction = (event) => {
        user.socket.on("message", (arg)=> {
            const newMessage = JSON.parse(arg);
            setChat([...chat, newMessage]);
         });
    }

    return (
        <div className="chat-wrapper">
            <div className="chat-header">
                Discutez avec le salon
            </div>
            <div className="chat-content">
            {
                chat.map((message, index) =>
                    <div key={index} className="chat-post"><div>{message.player}</div><div>{message.text}</div></div>
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
