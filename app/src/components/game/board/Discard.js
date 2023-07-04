import { useContext } from "react";
import GameContext from "../../../context/game/GameContext.js";

const Discard = ({ handleClear, handleDiscard, poolCardsAmount }) => {

    const { game } = useContext(GameContext);

    return poolCardsAmount < game.mutual.discardSize ? (
            <div className="buttonHolder">
                Cartes défaussées: {poolCardsAmount}/{game.mutual.discardSize}
                {poolCardsAmount > 0 && <button class="btn btn-danger" onClick={handleClear}>X</button>}
            </div>
        ) : (
            <div className="buttonHolder">
                <button class="btn btn-success" onClick={handleDiscard}>Valider la défausse</button>
                <button class="btn btn-danger" onClick={handleClear}>X</button>
            </div>
        );
};

export default Discard;