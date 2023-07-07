import axios from "axios";
import Domain from "../utils/Domain";

export const register = (user) => {
    return axios.post(Domain.getAPI() + '/user/register', user);
}

export const login = (user) => {
    return axios.post(Domain.getAPI() + '/user/login', user);
}

export const getAllUsers = () => {
    return axios.get(Domain.getAPI()+'/user/');
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

export const leaveGame = (token) => {
    return axios.post(Domain.getAPI() + '/game/leave', null, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}