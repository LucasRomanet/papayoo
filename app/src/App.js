import {
    BrowserRouter as Router,
    Route,
    Routes
} from "react-router-dom";

import Header from "./components/Header";
import Home from "./page/Home";
import Rules from "./page/Rules";
import Credit from "./page/Credit";
import Play from "./page/Play";
import Game from './page/Game';
import Ranking from './page/Ranking';
import NotFoundPage from './components/error/404';
import GameProvider from './context/game/GameProvider'
import UserProvider from './context/user/UserProvider'
import DroppableProvider from './context/droppable/DroppableProvider'

function App() {
    return (
        <GameProvider>
            <UserProvider>
                <Router basename={process.env.REACT_APP_BASE}>
                    <Header/>
                    <Routes>
                        <Route path="/credit" element={<Credit/>}/>
                        <Route path="/partie/:code" element={
                            <DroppableProvider>
                                <Game/>
                            </DroppableProvider>
                        }/>
                        <Route path="/rules" element={<Rules/>}/>
                        <Route path="/jouer" element={<Play/>}/>
                        <Route path="/classement" element={<Ranking/>}/>
                        <Route path="/" element={<Home/>}/>
                        <Route element={<NotFoundPage/>}/>
                    </Routes>
                </Router>
            </UserProvider>
        </GameProvider>
    );
}

export default App;
