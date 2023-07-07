import { useState } from 'react';
import UserContext from './UserContext';
import io from 'socket.io-client';
import Domain from '../../utils/Domain';

export default function UserProvider( { children }) {
    const [user, setUser] = useState({
        socket: io(Domain.getWSBaseURL(), {path: '/api/ws'})
    });

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    )
}