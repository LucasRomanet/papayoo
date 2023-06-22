import React, { Component } from "react";
import logo from "../img/logo_transparent.svg";
import "../style/header.css";
import Profile from "./Profile";
import Domain from '../utils/Domain';
Domain.constructor();

class Header extends Component {
      render() {
            return (
                <div className="header-wrapper">
                    <img src={logo} alt="Logo" />
                    <Profile ref={this.ref}/>
                </div>

            );
      }
}

export default Header;
