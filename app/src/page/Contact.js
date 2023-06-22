import React, { Component } from "react";

class Contact extends Component {
  render() {
    return (
        <div class="contact-wrapper">
            <h4>Crédits:</h4>
            <p>Jeu de Papayoo distribué par <a href="https://www.gigamic.com/">Gigamic</a></p>
            <h4>Contact:</h4>
            <p>contact@{process.env.REACT_APP_HOST}</p>
        </div>
    );
  }
}
export default Contact;
