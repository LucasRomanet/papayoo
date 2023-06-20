import React, { Component } from "react";
import Connexion from "./components/Session/Connexion"
import PlayerProfile from "./PlayerProfile"
import Inscription from "./components/Session/Inscription"
import Navbar from "./Navbar.js";
import "./style/profile.css";

import Domain from './utils/Domain';
import UserProfile from './utils/UserProfile';
UserProfile.constructor();

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
             modalConnexionOpen: false,
             modalInscriptionnOpen: false,
             modalPlayerProfilOpen: false,
             player: {},
             loggedIn: false
        }
        this.handleModalConnexionOpen = this.handleModalConnexionOpen.bind(this);
        this.handleModalInscriptionOpen = this.handleModalInscriptionOpen.bind(this);
        this.notify = this.notify.bind(this)
        this.handleModalPlayerProfileOpen = this.handleModalPlayerProfileOpen.bind(this);
      };

      componentDidMount() {
          if (UserProfile.loggedIn()) this.setState({
              player: UserProfile.getPlayer()
          })
      };
      handleModalPlayerProfileOpen() {
        this.setState((prevState) => {
            return {
                modalPlayerProfilOpen: !prevState.modalPlayerProfilOpen
            }
        });
      }
      handleModalConnexionOpen() {
         this.setState((prevState) => {
            return{
               modalConnexionOpen: !prevState.modalConnexionOpen
            }
        });
      };
      handleModalInscriptionOpen() {
         this.setState((prevState) => {
            return{
               modalInscriptionOpen: !prevState.modalInscriptionOpen
            }
        });
      };
      handleDeconnexion(){
        window.location.replace(Domain.getURL());
      };
      notify() {
          this.setState({
              player: UserProfile.getPlayer(),
              loggedIn: UserProfile.loggedIn()
          });
      }
      render() {
            let welcome = "Vous n'êtes pas connecté";
            if (this.state.loggedIn) welcome = "Bienvenue "+this.state.player.name+"#"+this.state.player.tag+"!";
            return (
                <div className="login-wrapper">
                    <div className="profile-wrapper">
                        <div className="profile-card">
                            {welcome}
                            { (!this.state.loggedIn)
                                ? <div>
                                    <button onClick={this.handleModalConnexionOpen} className="btn btn-danger">
                                        Connexion
                                    </button>
                                    <button onClick={this.handleModalInscriptionOpen} className="btn btn-danger">
                                        Inscription
                                    </button>
                                </div>
                                : <div>
                                    <button onClick={this.handleModalPlayerProfileOpen} className="btn btn-danger">
                                        Profil
                                    </button>
                                    <button onClick={this.handleDeconnexion} className="btn btn-danger">
                                        Deconnexion
                                    </button>
                                </div>
                            }

                        </div>
                        <Connexion
                           modalOpen={this.state.modalConnexionOpen}
                           handleModalOpen={this.handleModalConnexionOpen}
                           notify={this.notify}
                        />
                        <Inscription
                           modalOpen={this.state.modalInscriptionOpen}
                           handleModalOpen={this.handleModalInscriptionOpen}
                           notify={this.notify}
                        />
                        <PlayerProfile
                            modalOpen={this.state.modalPlayerProfilOpen}
                            handleModalOpen={this.handleModalPlayerProfileOpen}
                            player={this.state.player}
                        />
                    </div>
                    <Navbar loggedIn={this.state.loggedIn}/>
                </div>
            );
      }
}

export default Profile;
