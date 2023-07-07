import { useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Connexion from "../components/session/Connexion";
import Inscription from "../components/session/Inscription";
import Stats from "./Stats"
import UserContext from "../context/user/UserContext";
import "../style/profile.css";

const Profile = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

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
        setUser({ socket: user.socket });
        navigate('/');
    };

    return (
        <div className="login-wrapper">
            <div className="profile-wrapper">
                <div className="profile-card">
                    {
                        user.token 
                            ? (
                                <div>
                                    <button onClick={toggleStatsModal} className="btn btn-danger">
                                        Profil
                                    </button>
                                    <button onClick={logout} className="btn btn-danger">
                                        Déconnexion
                                    </button>
                                </div>
                            )
                            : (
                                <div>
                                    <button onClick={toggleLoginModal} className="btn btn-danger">
                                        Connexion
                                    </button>
                                    <button onClick={toggleRegisterModal} className="btn btn-danger">
                                        Inscription
                                    </button>
                                </div>
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
    
        </div>
    );
}

export default Profile;
