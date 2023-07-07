import { useContext } from "react";
import logo from "../img/logo_transparent.svg";
import "../style/header.css";
import Profile from "./Profile";
import Navbar from "./Navbar";
import UserContext from "../context/user/UserContext";
import GameContext from "../context/game/GameContext";

const Header = () => {
    const { user } = useContext(UserContext);
    const { game } = useContext(GameContext);

    return (
        
        <div className="header-wrapper">
            <img src={logo} alt="Logo" />
            <Profile />

            {(game == null) && <Navbar loggedIn={ user.token != null }/>}
        </div>
    )
}

export default Header;
