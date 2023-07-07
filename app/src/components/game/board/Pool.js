import { useRef, useContext } from "react";
import Card from "./Card";
import DroppableContext from "../../../context/droppable/DroppableContext";

const Pool = ({ pool }) => {
    
    const { setDroppable } = useContext(DroppableContext);
    const poolRef = useRef(null);
    setDroppable(poolRef);

    return (
        <div ref={poolRef} 
            id="pool"
            className="pool-wrapper"
        >
            {
                pool.map((card) =>
                    <Card
                        index={card.id}
                        key={card.id}
                        card={card}
                        playable={false}
                        context={"pool"}
                    />
                )
            }
        </div>
    )
};

export default Pool;