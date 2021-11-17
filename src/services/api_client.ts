import EventBus from '@/utils/EventBus';

export enum ApiBusEvents {
    BEFORE_API_REQUEST = 'before_api_request',
    AFTER_API_REQUEST = 'after_api_request',
    ON_API_CRASH = 'un_reachable_api',
}

const ApiClient = (() => {
    interface Config {
        host: string;
        port: string;
        protocol: string;
    }

    async function getFileConfig(): Promise<Config> {
        const response = await fetch('/config.json')
        if (!response || response.status != 200) {
            throw 'Unable to retrieve configuration file/ Invalid config.json'
        }
        const data = await response.json()
        sessionStorage.setItem("apiURL", data.apiURL);
        sessionStorage.setItem("apiPort", data.apiPort);
        sessionStorage.setItem("apiProtocol", data.apiProtocol);
        return {
            host: data.apiUrl,
            port: data.apiPort,
            protocol: data.apiProtocol
        }
    }

    function getLocalConfig(): Config | null {
        const host = localStorage.apiURL;
        const port = localStorage.apiURL;
        const protocol = localStorage.apiProtocol;
        return (host && port && protocol) 
            ? { host, port, protocol }
            : null
    }

    function getSessionConfig(): Config | null {
        const host = sessionStorage.apiURL
        const port = sessionStorage.apiPort
        const protocol = sessionStorage.apiProtocol

        return (host && port && protocol) 
            ? { host, port, protocol }
            : null
    }

    function getConfig(): Promise<Config> | Config {
        const localConfig: Config | null = getLocalConfig()
        const sessionConfig: Config | null = getSessionConfig()

        if (localStorage.useLocalStorage && localConfig)
            return localConfig

        if (sessionConfig) return sessionConfig

        return getFileConfig()
    }

    async function expandPath(resourcePath: string) {
        const config: Promise<Config> | Config = await getConfig();
        return `${config.protocol}://${config.host}:${config.port}/api/v1/${resourcePath}`
    }

    function headers() {
        return {
            'Authorization': sessionStorage.apiKey,
            'Content-Type': 'application/json'
        };
    }

    function setLocalStorage(protocol: string, ipAddress: string, port: string) {
        localStorage.setItem('useLocalStorage', 'true');
        localStorage.setItem('apiURL', ipAddress);
        localStorage.setItem('apiPort', port);
        localStorage.setItem('apiProtocol', protocol);
    }

    function removeOnly(inclusions: string[]) {
        inclusions.forEach(element => {
           inclusions.includes(element) && localStorage.removeItem(element)
        })
    }

    async function execFetch(uri: string, params: any) {        
        params = { ...params, mode: 'cors' };
        
        if (!('headers' in params)) {
            params = { ...params, headers: headers() };
        }
        
        try {
            const url = await expandPath(uri)

            EventBus.emit(ApiBusEvents.BEFORE_API_REQUEST, uri)

            const response = await fetch(url, params);
            EventBus.emit(ApiBusEvents.AFTER_API_REQUEST, response)            
            return response
        } catch (e) {
            EventBus.emit(ApiBusEvents.ON_API_CRASH, e)
        }
    }
    
    // /**
    //  * Perform a POST request on the API
    //  * 
    //  * @param {string} uri Path to resource being accessed. 
    //  * @param {Object} data Parameters to send to API.
    //  * 
    //  * Example:
    //  *   const response = post('people', {given_name: 'Foo', family_name: 'Bar}).then((response) => console.log(response));
    //  */
    const get = (uri: string) => execFetch(uri, { method: 'GET' })
    const post = (uri: string, data: object) => execFetch(uri, { method: 'POST', body: JSON.stringify(data) });
    const remove = (uri: string, data: object) => execFetch(uri, { method: 'DELETE', body: JSON.stringify(data)});
    const put = (uri: string, data: object) => execFetch(uri, { method: 'PUT', body: JSON.stringify(data) });
    const healthCheck = () => get('_health')
    return { get, post, put, remove, getConfig, setLocalStorage, removeOnly, healthCheck };
})();

export default ApiClient;
