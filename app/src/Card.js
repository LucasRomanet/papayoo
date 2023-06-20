import { Draggable } from 'react-beautiful-dnd';

function Card({index, card, playable, context, highest, handleClick}) {
    let overlay =
        "card-overlay"+
        (highest ? " highest" : '');
    return (
        <Draggable index={index} draggableId={index.toString()}>
            {(provided, snapshot) =>
                <div
                    ref={provided.innerRef}
                    {...(playable && context==="hand") ? provided.draggableProps:""}
                    {...provided.dragHandleProps}
                    style={{
                          userSelect: "none",
                          marginLeft: (context==="hand")
                            ? "-35px"
                            : "-20px",
                          ...(playable || context==="pool" ? provided.draggableProps.style: null : '')
                          }
                        }
                    id={card.id}
                    className={[card.color, "card-container"].join(' ')}
                    onClick={handleClick}>
                    <div
                        className={overlay}
                        style={{
                            background: playable || context==="pool" ?
                                "":
                                "rgba(160,160,160,.5)"
                        }}>
                        <p className="top-left">{card.number}</p>
                        <p className="bottom-right">{card.number}</p>
                    </div>
                </div>
            }
        </Draggable>
    );
}
export default Card;
