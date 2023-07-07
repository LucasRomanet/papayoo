const User = require('../bo/User.js');

class UserStore {
    constructor() {
        // key: nametag
        // value: Map => (key: token, value: user)
        this.users = new Map();
    }

    getUser(name, tag, token) {
        if (name == null || tag == null || token == null) {
            return;
        }

        const usersOfNameTag = this.users.get(User.nametag({ name, tag }));
        if (!(usersOfNameTag instanceof Map)) {
            return null;
        }
        return usersOfNameTag.get(token);
    }

    addUser(user) {
        if (user == null || user.name == null || user.tag == null || user.token == null) {
            return false;
        }

        const userNameTag = user.nametag();
        let usersOfNameTag = this.users.get(userNameTag);
        if (!(usersOfNameTag instanceof Map)) {
            usersOfNameTag = new Map(); 
            this.users.set(userNameTag, usersOfNameTag);
        }
        
        if (usersOfNameTag.has(user.token)) {
            return false;
        }
        usersOfNameTag.set(user.token, user);
        
        return true;
    }

    removeUser(user) {
        if (user == null || user.name == null || user.tag == null || user.token == null) {
            return false;
        }

        const userNameTag = user.nametag();
        let usersOfNameTag = this.users.get(userNameTag);
        if (!(usersOfNameTag instanceof Map)) {
            usersOfNameTag = new Map(); 
            this.users.set(userNameTag, usersOfNameTag);
        }
        
        if (!usersOfNameTag.has(user.token)) {
            return false;
        }
        usersOfNameTag.delete(user.token);

        if (usersOfNameTag.length === 0) {
            this.users.delete(userNameTag);
        }
        return true;
    }
}

module.exports = UserStore;