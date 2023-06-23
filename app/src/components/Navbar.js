import { Link } from "react-router-dom";


const Navbar = (props) => {

    return (
        <div>
            <div className="navbar-wrapper">
                <div className="navbar">
                    <h2><Link to="/">Accueil</Link></h2>
                    {(props.loggedIn) ? <h2><Link to="/jouer">Jouer en ligne</Link></h2> : ""}
                    <h2><Link to="/classement">Classement</Link></h2>
                    <h2><Link to="/rules">Règles</Link></h2>
                    <h2><Link to="/contact">Contact</Link></h2>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
