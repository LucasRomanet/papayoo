import axios from "axios";
import Domain from "../utils/Domain";

export const register = (player) => {
    return axios.post(Domain.getAPI() + '/player/register', player);
}

export const login = (player) => {
    return axios.post(Domain.getAPI() + '/player/login', player);
}

export const getAllPlayers = () => {
    console.log(Domain.getAPI()+'/player/');
    return axios.get(Domain.getAPI()+'/player/');
}

export const getPlayer = (name, tag) => {
    return axios.get(Domain.getAPI() + '/player/' + name + '/' + tag);
}

export const createGame = (token) => {
    return axios.post(Domain.getAPI() + '/game/', null, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export const joinGame = (code, token) => {
    return axios.post(Domain.getAPI() + '/game/' + code, null, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}