import { useContext } from 'react';
import { PlayerContext } from './PlayerContext';

export default function withPlayer(Component) {
    const {player, setPlayer} = useContext(PlayerContext);

    function ComponentWithPlayerProp(props) {
        return <Component {...props} 
        />
    }

    return ComponentWithPlayerProp;
}