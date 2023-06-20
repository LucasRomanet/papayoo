import {
    BrowserRouter as Router,
    Route,
    Routes
} from "react-router-dom";

import Header from "../Header.js";
import Accueil from "../Accueil.js";
import Rules from "../Rules.js";
import Contact from "../Contact.js";
import Jouer from "../Jouer.js";
import Lobby from '../Lobby.js';
import Partie from '../Partie.js';
import PartieOffline from '../PartieOffline.js';
import End from '../End.js';
import Classement from '../Classement.js';
import NotFoundPage from './Errors/404.js';

function App() {
    return (
        <Router basename={process.env.REACT_APP_BASE}>
            <Header/>
            <Routes>
                <Route exact path="/contact" element={<Contact/>}/>
                <Route exact path="/partie" element={<Partie/>}/>
                <Route exact path="/partie-offline" element={<PartieOffline/>}/>
                <Route exact path="/rules" element={<Rules/>}/>
                <Route exact path="/jouer" element={<Jouer/>}/>
                <Route exact path="/lobby" element={<Lobby/>}/>
                <Route exact path="/game-over" element={<End/>}/>
                <Route exact path="/classement" element={<Classement/>}/>
                <Route exact path="/" element={<Accueil/>}/>
                <Route element={<NotFoundPage/>}/>
            </Routes>
        </Router>
    );
}

export default App;
