import { useContext } from 'react';
import PlayerContext from './PlayerContext';

export function withPlayer(Component) {

    function ComponentWithPlayerProp(props) {
        const { player, setPlayer } = useContext(PlayerContext);

        return <Component {...props} player={{player, setPlayer}}/>
    }

    return ComponentWithPlayerProp;
}