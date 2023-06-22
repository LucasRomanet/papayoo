import {
    BrowserRouter as Router,
    Route,
    Routes
} from "react-router-dom";

import Header from "./components/Header";
import Accueil from "./page/Accueil";
import Rules from "./page/Rules";
import Contact from "./page/Contact";
import Jouer from "./page/Jouer";
import Game from './page/Game';
import Classement from './page/Classement';
import NotFoundPage from './components/error/404';
import { PlayerProvider } from './context/player/PlayerContext'

function App() {
    return (
        <PlayerProvider>
            <Router basename={process.env.REACT_APP_BASE}>
                <Header/>
                <Routes>
                    <Route path="/contact" element={<Contact/>}/>
                    <Route path="/partie/:code" element={<Game/>}/>
                    <Route path="/rules" element={<Rules/>}/>
                    <Route path="/jouer" element={<Jouer/>}/>
                    <Route path="/classement" element={<Classement/>}/>
                    <Route path="/" element={<Accueil/>}/>
                    <Route element={<NotFoundPage/>}/>
                </Routes>
            </Router>
        </PlayerProvider>
    );
}

export default App;
