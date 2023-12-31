import { useState } from 'react';
import GameContext from './GameContext';

export default function GameProvider( { children }) {
    const [game, setGame] = useState(null);

    return (
        <GameContext.Provider value={{game, setGame}}>
            {children}
        </GameContext.Provider>
    )
}