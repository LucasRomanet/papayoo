class Domain {
    static base = process.env.REACT_APP_BASE;
    static host = process.env.REACT_APP_HOST;
    static port = {
        app: 3000,
        api: 3001
    };
    static getURL() {
        return this.host+this.base;
    }
    static getAPI() {
        return this.host+this.base+'/api';
    }
}


window.addEventListener('load', function (e) {
    if(window.location.pathname !== Domain.base
        && window.location.pathname !== Domain.base+"/rules"
        && window.location.pathname !== Domain.base+"/contact"
        && window.location.pathname !== Domain.base+"/classement"){
       window.location.replace(Domain.base);
    }
});

export default Domain;
