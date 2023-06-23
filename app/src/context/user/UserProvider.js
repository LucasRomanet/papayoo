import { useState } from 'react';
import UserContext from './UserContext';
import io from 'socket.io-client';
import Domain from '../../utils/Domain';

export default function UserProvider( { children }) {
    const [user, setUser] = useState({
        socket: io(Domain.getWSBaseURL(), {path: '/api/ws'}),
        player: {
            name: "Guest",
            tag: "0000",
            games: "0",
            score: "0"
        }
    });

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    )
}