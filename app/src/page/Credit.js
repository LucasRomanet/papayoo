const Credit = () => {
    return (
        <div class="contact-wrapper">
            <h1>Crédits:</h1>
            <p>Jeu de Papayoo distribué par <a href="https://www.gigamic.com/">Gigamic</a></p>
            <p>Projet réalisé dans le cadre d'un travail de programmation universitaire, avec l'autorisation de l'ayant droit de la version originale.</p>
            <h5>Technologies utilisée:</h5>
            <ul>
                <li>
                    Interface web: <a href="https://react.dev/">React</a>
                </li>
                <li>
                    API: <a href="https://nodejs.org/">Node.js</a>
                </li>
            </ul>
            <p>contact@{process.env.REACT_APP_HOST}</p>
        </div>
    );

}

export default Credit;
