import { useState } from 'react';
import DroppableContext from './DroppableContext';

export default function DroppableProvider( { children }) {
    const [droppable, setDroppable] = useState();

    return (
        <DroppableContext.Provider value={{droppable, setDroppable}}>
            {children}
        </DroppableContext.Provider>
    )
}