import { useState, useEffect } from "react";
import "../style/ranking.css";
import { nametag, byGames, byScore, byAvg } from '../utils/tools';
import { getAllUsers } from "../endpoint";

function notEnoughGames(a) {return a.games <= 5};

const Ranking = () =>{
    const [ ranking, setRanking ] = useState([]);

    useEffect(() => {
        getAllUsers().then(response => {
            let everyone = response.data.sort(byGames);
            let indexOfFirstPlayer = everyone.findIndex(notEnoughGames);
            let playedOnce = everyone.slice(0, indexOfFirstPlayer);
            setRanking(playedOnce.sort(byAvg));
        }).catch(error => {
        if (error.response)
           console.error(error.message);
        });
    }, []);

    const handleSort = (byAttribute) => {
        setRanking([...ranking].sort(byAttribute));
    }

    return (
        <div className="ranking-wrapper">
            <h1>Classement des joueurs</h1>
            <p>Seul les joueurs comptabilisants 5 parties ou plus sont affichés.</p>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Joueur</th>
                            <th className="sort" onClick={() => handleSort(byGames)}>Nombre de parties jouées</th>
                            <th className="sort" onClick={() => handleSort(byScore)}>Score cumulé total</th>
                            <th className="sort" onClick={() => handleSort(byAvg)}>Moyenne par partie</th>
                        </tr>
                    </thead>
                    {
                        ranking.map((player, index) =>
                            <tbody>
                                <tr key={index} className="player-ranking">
                                    <td>{index+1}. </td>
                                    <td>
                                        {nametag(player)}
                                    </td>
                                    <td>
                                        {player.games}
                                    </td>
                                    <td>
                                        {player.score}
                                    </td>
                                    <td>
                                        {Math.floor((player.score/player.games)*10)/10}
                                    </td>
                                </tr>
                            </tbody>
                        )
                    }
                </table>
        </div>
        
    );
}
export default Ranking;
