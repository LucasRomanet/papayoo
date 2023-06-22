import React, { Component } from "react";
import "../style/chat.css";

import UserChat from '../utils/UserChat';
import UserProfile from '../utils/UserProfile';
const socket = UserProfile.getSocket();

class Chat extends Component{
    constructor(props) {
        super(props);
        this.state = {
            code: '',
            message: [],
            chatInput: ''
        }
        this.enterFunction = this.enterFunction.bind(this);
    }
    handleChat = (event) => {
        this.setState({chatInput: event.target.value})
    }
    handleMessage = (event) => {
        this.setState({chatInput: ''});
        if (this.state.chatInput) socket.emit('message', {gameCode: this.state.code, text: this.state.chatInput});
    }
    enterFunction = (event) => {
        if (event.charCode === 13) {
            this.handleMessage();
        }
    }
    socketFunction = (event) => {
        socket.on("message", (arg)=> {
            const newMessage = JSON.parse(arg);
            UserChat.setMessage(newMessage);
            this.setState({
                message: [...this.state.message, newMessage]
            })
         });
    }
    componentDidMount(){
        this.setState({
            code: this.props.code,
            message: UserChat.getConversation()
        })
        this.socketFunction();
    }
    render() {
        return (
            <div className="chat-wrapper">
                <div className="chat-header">
                    Discutez avec le salon
                </div>
                <div className="chat-content">
                {
                    this.state.message.map((message, index) =>
                        <p key={index} className="chat-post"><div>{message.player}</div><div>{message.text}</div></p>
                    )
                }
                    <div className="chat-input">
                        <input type="text" autoFocus name="chat" value={this.state.chatInput} onChange={this.handleChat} onKeyPress={this.enterFunction}/>
                        <button className="btn btn-primary" onClick={this.handleMessage}>Envoyer</button>
                    </div>
                </div>
            </div>
        );
    }
}
export default Chat;
