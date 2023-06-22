class Domain {
    static base = process.env.REACT_APP_BASE;
    static host = process.env.REACT_APP_HOST;
    static port = {
        app: process.env.REACT_APP_PORT,
        api: process.env.REACT_APP_PORT_API
    };
    static getURL() {
        return this.host+':'+this.port.app+this.base;
    }
    static getAPI() {
        let scheme = this.port.api === 443 ? 'https://' : 'http://' ;
        return scheme+this.host+':'+this.port.api+'/api';
    }
    static getWSBaseURL() {
        let scheme = this.port.api === 443 ? 'https://' : 'http://' ;
        return scheme+this.host+':'+this.port.api;
    }
}


export default Domain;
