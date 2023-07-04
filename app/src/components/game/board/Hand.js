import { Droppable } from 'react-beautiful-dnd';
import Card from "./Card.js";

const Hand = ({ hand, isPlayable, handleClick }) => {

    return <Droppable droppableId="hand" key="hand" direction="horizontal">
    {(provided, snapshot) =>
        <div
            className="hand-wrapper"
            ref={provided.innerRef}
        >
        {
            hand.map((card) =>
                <Card
                    index={card.id}
                    key={card.id}
                    card={card}
                    playable={isPlayable(card)}
                    context={"hand"}
                    handleClick={handleClick}
                />
            )
        }
        {provided.placeholder}
        </div>
    }
    </Droppable>
};

export default Hand;