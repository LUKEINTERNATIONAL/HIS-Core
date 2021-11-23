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
        if (!response.ok) {
            throw 'Unable to retrieve configuration file/ Invalid config.json'
        }
        const { apiURL, apiPort, apiProtocol } = await response.json()
        sessionStorage.setItem("apiURL", apiURL);
        sessionStorage.setItem("apiPort", apiPort);
        sessionStorage.setItem("apiProtocol", apiProtocol);
        return {
            host: apiURL,
            port: apiPort,
            protocol: apiProtocol
        }
    }

    function getLocalConfig(): Config | undefined {
        const host = localStorage.apiURL;
        const port = localStorage.apiPort;
        const protocol = localStorage.apiProtocol;
        if ((host && port && protocol))
            return { host, port, protocol }
    }

    function getSessionConfig(): Config | undefined {
        const host = sessionStorage.apiURL
        const port = sessionStorage.apiPort
        const protocol = sessionStorage.apiProtocol
        if ((host && port && protocol))
            return { host, port, protocol }
    }

    function getConfig(): Promise<Config> | Config {
        const localConfig: Config | undefined = getLocalConfig()
        const sessionConfig: Config | undefined = getSessionConfig()

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

        const url = await expandPath(uri)

        try {
            EventBus.emit(ApiBusEvents.BEFORE_API_REQUEST, uri)
            const response = await fetch(url, params);
            EventBus.emit(ApiBusEvents.AFTER_API_REQUEST, response)            
            return response
        } catch (e) {
            console.error(e)
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
