import axios from "axios";
import Domain from "../utils/Domain";

export const register = (player) => {
    return axios.post(Domain.getAPI() + '/player/add', player);
}

export const getAllPlayers = () => {
    console.log(Domain.getAPI()+'/player/');
    return axios.get(Domain.getAPI()+'/player/');
}

export const getPlayer = (name, tag) => {
    return axios.get(Domain.getAPI() + '/player/' + name + '/' + tag);
}

export const login = (player) => {
    return axios.post(Domain.getAPI() + '/player/login', player);
}

export const createGame = (data) => {
    return axios.post(Domain.getAPI() + '/game/', data);
}

export const joinGame = (code, data) => {
    return axios.post(Domain.getAPI() + '/game/' + code, data);
}