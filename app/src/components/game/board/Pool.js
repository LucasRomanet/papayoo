import { Droppable } from 'react-beautiful-dnd';
import Card from "./Card.js";

const Pool = ({ pool, highest }) => {

    return <Droppable droppableId="pool" key="pool" direction="horizontal">
    {(provided, snapshot) =>
        <div
            className="pool-wrapper"
            ref={provided.innerRef}
            style={{
                background: snapshot.isDraggingOver
                ? "rgba(10,10,10,.3)"
                : null
            }}
        >
            {
                pool.map((card) =>
                    <Card
                        index={card.id}
                        key={card.id}
                        card={card}
                        playable={false}
                        context={"pool"}
                        isHighest={highest.id == card.id}
                    />
                )
            }
        {provided.placeholder}
        </div>
    }
    </Droppable> 
};

export default Pool;