import { useContext, useState, useEffect, useCallback } from "react";
import Connexion from "../components/session/Connexion";
import Inscription from "../components/session/Inscription";
import Stats from "./Stats"
import UserContext from "../context/user/UserContext";
import Navbar from "./Navbar.js";
import "../style/profile.css";

const Profile = () => {
    const { user } = useContext(UserContext);

    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [isStatsModalOpen, setStatsModalOpen] = useState(false);

    const toggleLoginModal = useCallback(() => {
        setLoginModalOpen(!isLoginModalOpen);
    }, [isLoginModalOpen, setLoginModalOpen]);

    const toggleRegisterModal = useCallback(() => {
        setRegisterModalOpen(!isRegisterModalOpen);
    }, [isRegisterModalOpen, setRegisterModalOpen]);

    const toggleStatsModal = useCallback(() => {
        setStatsModalOpen(!isStatsModalOpen);
    }, [isStatsModalOpen, setStatsModalOpen]);

    const logout = () => {
        // TODO
        return;
    };

    return (
        <div className="login-wrapper">
            <div className="profile-wrapper">
                <div className="profile-card">
                    {
                        user.token 
                            ? (
                                <>
                                    Bienvenue {user.name}#{user.tag}!
                                    <div>
                                        <button onClick={toggleStatsModal} className="btn btn-danger">
                                            Profil
                                        </button>
                                        <button onClick={logout} className="btn btn-danger">
                                            Déconnexion
                                        </button>
                                    </div>
                                </>
                            )
                            : (
                                <>
                                    Vous n'êtes pas connecté
                                    <div>
                                        <button onClick={toggleLoginModal} className="btn btn-danger">
                                            Connexion
                                        </button>
                                        <button onClick={toggleRegisterModal} className="btn btn-danger">
                                            Inscription
                                        </button>
                                    </div>
                                </>
                            )
                    }
                </div>
                <Connexion
                    isModalOpen={isLoginModalOpen}
                    toggleModal={toggleLoginModal}
                />
                <Inscription
                    isModalOpen={isRegisterModalOpen}
                    toggleModal={toggleRegisterModal}
                />
                <Stats
                    isModalOpen={isStatsModalOpen}
                    toggleModal={toggleStatsModal}
                    user={user}
                />
            </div>
            <Navbar loggedIn={ user.token != null }/>
        </div>
    );
}

export default Profile;
