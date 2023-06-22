import { useState } from 'react';
import PlayerContext from './PlayerContext';

export default function PlayerProvider( { children }) {
    const [player, setPlayer] = useState('test');

    return (
        <PlayerContext.Provider value={{player, setPlayer}}>
            {children}
        </PlayerContext.Provider>
    )
}