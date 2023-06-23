import { useContext, useState, useEffect } from "react";
import Connexion from "../components/session/Connexion";
import Inscription from "../components/session/Inscription";
import Stats from "./Stats"
import UserContext from "../context/user/UserContext";
import Navbar from "./Navbar.js";
import "../style/profile.css";

import UserProfile from '../utils/UserProfile';
UserProfile.constructor();

const Profile = () => {
    const [GET, SET] = [0, 1];

    const isModalOpen = {
        login: useState(false),
        register: useState(false),
        stats: useState(false)
    }

    const [player, setPlayer] = useState({});

    const { user } = useContext(UserContext);

    useEffect(() => {
        if (user) setPlayer(user.player);
    }, [user]);

    const toggleModal = (context) => {
        switch (context) {
            case 'login':
                isModalOpen.login[SET](!isModalOpen.login[GET])
                break;
            case 'register':
                isModalOpen.register[SET](!isModalOpen.register[GET])
                break;
            case 'stats':
                isModalOpen.stats[SET](!isModalOpen.stats[GET])
                break;
            default:
                break;
        }
    }
    const logout = () => {
        // TODO
        return;
    };
    console.log(user);
    let welcome = "Vous n'êtes pas connecté";
    if (player) welcome = "Bienvenue "+player.name+"#"+player.tag+"!";
    return (
        <div className="login-wrapper">
            <div className="profile-wrapper">
                <div className="profile-card">
                    {welcome}
                    { (!player)
                        ? <div>
                            <button onClick={() => toggleModal('login')} className="btn btn-danger">
                                Connexion
                            </button>
                            <button onClick={() => toggleModal('register')} className="btn btn-danger">
                                Inscription
                            </button>
                        </div>
                        : <div>
                            <button onClick={() => toggleModal('stats')} className="btn btn-danger">
                                Profil
                            </button>
                            <button onClick={logout} className="btn btn-danger">
                                Déconnexion
                            </button>
                        </div>
                    }

                </div>
                <Connexion
                    isModalOpen={isModalOpen.login[GET]}
                    toggleModal={() => toggleModal('login')}
                />
                <Inscription
                    isModalOpen={isModalOpen.register[GET]}
                    toggleModal={() => toggleModal('register')}
                />
                <Stats
                    isModalOpen={isModalOpen.stats[GET]}
                    toggleModal={() => toggleModal('stats')}
                    player={player}
                />
            </div>
            <Navbar loggedIn={ user.token != null }/>
        </div>
    );
}

export default Profile;
