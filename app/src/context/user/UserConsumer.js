import { useContext } from 'react';
import UserContext from './UserContext';

export function withUser(Component) {

    function ComponentWithUserProp(props) {
        const { user, setUser } = useContext(UserContext);

        return <Component {...props} user={{user, setUser}}/>
    }

    return ComponentWithUserProp;
}