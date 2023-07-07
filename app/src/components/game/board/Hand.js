import { useContext } from "react";
import { nametag }  from '../../../utils/tools';
import Card from "./Card";
import GameContext from "../../../context/game/GameContext";
import UserContext from "../../../context/user/UserContext";

const Hand = ({ hand, playableCard }) => {
    const { game } = useContext(GameContext);
    const { user } = useContext(UserContext);

    const isPlayable = (card) => {
        if (game.mutual.discarding) {
            return game.mutual.pool.length < game.mutual.discardSize;
        }

        const isPlayerTurn = nametag(user) == game.mutual.mustPlay;
        const isRequiredColor = playableCard.requiredColor == null || playableCard.requiredColor === card.color || playableCard.noColorCardsLeft;
        return isPlayerTurn && isRequiredColor;
    }

    return (
        <div id="hand" className="hand-wrapper">
            {
                hand.map((card) =>
                    <Card
                        index={card.id}
                        key={card.id}
                        card={card}
                        context={"hand"}
                        isPlayable={isPlayable(card)}
                    />
                )
            }
        </div>
    )
};

export default Hand;