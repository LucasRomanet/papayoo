import React, { Component } from "react";

function byScore(a, b) {return a.points - b.points};

class End extends Component {
    constructor(props) {
        super(props)
        this.state = {
            playerScores: []
        }
    }
    componentDidMount() {
        this.setState({
            playerScores: this.state.playerScores.sort(byScore)
        });
    }
    render() {
        let navbar = document.getElementsByClassName("navbar")[0];
        if (navbar) navbar.style.display = "flex";
        return (
            <div className="end-wrapper">
                <h1>Fin de la partie</h1>
                <h2>Résultats:</h2>
                {
                    this.state.playerScores.map((joueur, index) =>
                        <div>
                            <h3>{index+1}</h3><h4>{joueur.player}: {joueur.points} points</h4>
                        </div>
                    )
                }
            </div>
        );
    }
}

export default End;
