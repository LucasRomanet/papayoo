import React, { Component } from "react";
import "../style/classement.css";
import nametag from '../utils/tools';
import {getAllUsers} from "../api";

function byGames(a, b) {return a.games-b.games};
function byScore(a, b) {return a.score-b.score};
function byAvg(a, b) {return a.score/a.games-b.score/b.games};
function byNoGames(a) {return a.games >= 5};

class Classement extends Component{
    constructor(props) {
        super(props);
        this.state = {
            classement: []
        }
    }
    handleSortGames = event => {
        this.handleSort(byGames)
    }
    handleSortScore = event => {
        this.handleSort(byScore)
    }
    handleSortAvg = event => {
        this.handleSort(byAvg)
    }
    handleSort(sortFct) {
        this.setState({
            classement: this.state.classement.sort(sortFct)
        })
    }
    componentDidMount(){
        getAllUsers().then(response => {
            let everyone = response.data.sort(byGames);
            let indexOfFirstPlayer = everyone.findIndex(byNoGames);
            let playedOnce = everyone.slice(indexOfFirstPlayer);
            this.setState({
                classement: playedOnce.sort(byAvg)
            })
        }).catch(error => {
        if (error.response)
           console.error(error.message);
        });
    }
    render() {
        return (
            
            <div className="classement-wrapper">
                <h1>Classement des joueurs</h1>
                <p>Seul les joueurs comptabilisants 5 parties ou plus sont affichés.</p>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Joueur</th>
                                <th className="sort" onClick={this.handleSortGames}>Nombre de parties jouées</th>
                                <th className="sort" onClick={this.handleSortScore}>Score cumulé total</th>
                                <th className="sort" onClick={this.handleSortAvg}>Moyenne par partie</th>
                            </tr>
                        </thead>
                        {
                            this.state.classement.map((joueur, index) =>
                                <tbody>
                                    <tr key={index} className="joueur-classement">
                                        <td>{index+1}. </td>
                                        <td>
                                            {nametag(joueur)}
                                        </td>
                                        <td>
                                            {joueur.games}
                                        </td>
                                        <td>
                                            {joueur.score}
                                        </td>
                                        <td>
                                            {Math.floor((joueur.score/joueur.games)*10)/10}
                                        </td>
                                    </tr>
                                </tbody>
                            )
                        }
                    </table>
            </div>
            
        );
    }
}
export default Classement;
