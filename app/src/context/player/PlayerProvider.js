import { useState } from 'react';
import PlayerContext from './PlayerContext';

export function PlayerProvider( { children }) {
    const [player, setPlayer] = useState(defaultPlayer);

    return (
        <PlayerContext.Provider value={{player, setPlayer}}>
            {children}
        </PlayerContext.Provider>
    )
}

export function withPlayer(Component) {

}