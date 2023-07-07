import "../style/rules.css";

const Rules = () => {
    return (
        <div>
            <div className="rules-wrapper">
            <br />
            <h2>Règles du jeu</h2>


            <table>
                <thead>
                    <tr>
                        <th>Nombre de Joueurs</th>
                        <th>Cartes absentes du jeu</th>
                        <th>Nombre de cartes par joueurs</th>
                        <th>Écart</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>3</td><td>aucune</td><td>20</td><td>5</td>
                    </tr>
                </tbody>
                <tbody>
                    <tr>
                        <td>4</td><td>aucune</td><td>15</td><td>5</td>
                    </tr>
                </tbody>
                <tbody>
                    <tr>
                        <td>5</td><td>aucune</td><td>12</td><td>4</td>
                    </tr>
                </tbody>
                <tbody>
                    <tr>
                        <td>6</td><td>aucune</td><td>10</td><td>3</td>
                    </tr>
                </tbody>
                <tbody>
                    <tr>
                        <td>7</td><td>1 de Pique, Coeur, Carreau et de Trèfle</td><td>8</td><td>3</td>
                    </tr>
                </tbody>
                <tbody>
                    <tr>
                        <td>8</td><td>1 de Pique, Coeur, Carreau et de Trèfle</td><td>7</td><td>3</td>
                    </tr>
                </tbody>
 
            </table>

            <br/>


            <p>Après distribution, les joueurs procèdent à l'écart: chacun se débarrasse des cartes de son choix en retirant
                de son jeu le nombre de cartes précisé sur le tableau et défausse à son voisin de gauche;</p>

            <p>Quand tous les joueurs ont procédé à l'écart, on détermine aléatoirement la couleur du Papayoo.
                Le Papayoo est toujours la carte 7 de cette couleur et vaut 40 points.</p>

            <p>Le donneur entame le premier pli en jouant la carte de son choix au centre de la table.
                Les autres joueurs jouent ensuite chacun à leur tour en suivant impérativement la couleur demandée par le premier
                (mais il n'est pas impératif de jouer une carte de plus forte valeur).</p>

            <p>Le Payoo doit être considéré comme une cinquième couleur.
                Si un joueur n'a pas en main la couleur demandée, il se défausse de toute autre carte de son choix.
                Celui qui a joué la plus forte carte dans la couleur demandée ramasse le pli et entame le pli suivant.</p>

            <p>A l'issue du dernier pli, les joueurs comptent leurs points. Chaque Payoo vaut sa propre valeur, le Papayoo vaut 40 points et les autres cartes ne valent rien.
                Le total des scores de la manche doit faire 250.</p>

            <p>Les joueurs fixent en début de partie le nombre de manches qu'ils souhaitent jouer (4 manches durent environ 30 minutes).
            Celui qui a le moins de points à l'issue de la dernière manche est déclaré vainqueur.</p>
            </div>
        </div>
    );

}

export default Rules;