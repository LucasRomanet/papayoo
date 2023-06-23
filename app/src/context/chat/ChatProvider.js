import { useState } from 'react';
import ChatContext from './ChatContext';

export default function ChatProvider( { children }) {
    const [chat, setChat] = useState([]);

    return (
        <ChatContext.Provider value={{chat, setChat}}>
            {children}
        </ChatContext.Provider>
    )
}