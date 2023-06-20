import io from 'socket.io-client';
import Domain from './Domain';

class UserProfile {
    static token;
    static socket;
    static player;
    static logged;
    
    static _initialize(){
        this.socket = io(Domain.scheme+'://'+Domain.host, {path: Domain.base+'/api/ws'});
        this.player = {
            name: "Guest",
            tag: "0000",
            games: "0",
            score: "0"
        }
        this.logged = false;
    }
    static getSocket() {
        return this.socket;
    };
    static getToken() {
        return this.token;
    };
    static getPlayer() {
        return this.player;
    };
    static setToken(t) {
        this.token = t;
    };
    static setPlayer(p) {
        this.logged = true;
        this.player = p;
    };
    static loggedIn() {
        return this.logged;
    };
    static nametag(nt = null){
       if (nt === null) {
           return this.player.name+'#'+this.player.tag;
       }
       return nt.name+'#'+nt.tag;
   };
}

export default UserProfile;
