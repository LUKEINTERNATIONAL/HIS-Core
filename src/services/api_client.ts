import EventBus from '@/utils/EventBus';

export enum ApiBusEvents {
    BEFORE_API_REQUEST = 'before_api_request',
    AFTER_API_REQUEST = 'after_api_request',
    ON_API_CRASH = 'un_reachable_api',
}

const ApiClient = (() => {
    interface Config {
        protocol?: string;
        host?: string;
        port?: string;
        apiVersion?: string;
        username?: string;
        password?: string;
        version?: string;
        source?: string;
    }
    async function getConfig(): Promise<{ status: string; data?: Config | undefined; message?: string }> {
        try {
            const config: Config = {};
            if(localStorage.useLocalStorage) {
                config.host = localStorage.apiURL;
                config.port = localStorage.apiPort;
                config.protocol = localStorage.apiProtocol;
                config.source = JSON.stringify(localStorage);
            }else {
                const response = await fetch('/config.json');

                if (response.status !== 200) {
                    const message = `Looks like there was a problem. Status Code: ${response.status}`;
                    return { status: "error", message:  message};
                }
                const data = await response.json();
                sessionStorage.setItem("apiURL", data.apiURL);
                config.host = data.apiURL;
                sessionStorage.setItem("apiPort", data.apiPort);
                config.port = data.apiPort;
                sessionStorage.setItem("apiProtocol", data.apiProtocol);
                config.protocol = data.apiProtocol;
                config.version = data.version;
                config.source = data;
            }
            return { status: "complete", data: config };
        } catch (err) {
            return { status: "error" };
        }
    }
    async function expandPath(resourcePath: string) {
        const config = await getConfig();
        if(config.message) {
            throw config.message
        }

        if (config.data) {
            return {
                status: "complete",
                url: `${config.data.protocol}://${config.data.host}:${config.data.port}/api/v1/${resourcePath}`
            };
        } else {
            return {
                status: "failed",
                url: "/"
            };
        }
    }

    function headers() {
        return {
            'Authorization': sessionStorage.apiKey,
            'Content-Type': 'application/json'
        };
    }
    function setLocalStorage(ipAddress: string, port: string) {
        localStorage.setItem('useLocalStorage', 'true');
        localStorage.setItem('apiURL', ipAddress);
        localStorage.setItem('apiPort', port);
        localStorage.setItem('apiProtocol', 'http');
    }
    function removeOnly(inclusions: string[]) {
        inclusions.forEach(element => {
           inclusions.includes(element) && localStorage.removeItem(element)
        });
    }

    async function execFetch(uri: string, params: any, noRedirectCodes: number[] = []) {
        const pathData = await expandPath(uri)

        if (pathData.status == "complete") {
            const url = pathData.url;
            params = { ...params, mode: 'cors' };

            if (!('headers' in params)) {
                params = { ...params, headers: headers() };
            }

            let response;

            try {
                EventBus.emit(ApiBusEvents.BEFORE_API_REQUEST, uri)

                response = await fetch(url, params);

                EventBus.emit(ApiBusEvents.AFTER_API_REQUEST, response)
                
                return response
            } catch (e) {
                EventBus.emit(ApiBusEvents.ON_API_CRASH, e)
            }
        } else {
            throw 'could not configure services'
        }
    }
    

    const get = (uri: string, options = []) => execFetch(uri, { method: 'GET' }, options)

    // /**
    //  * Perform a POST request on the API
    //  * 
    //  * @param {string} uri Path to resource being accessed. 
    //  * @param {Object} data Parameters to send to API.
    //  * 
    //  * Example:
    //  *   const response = post('people', {given_name: 'Foo', family_name: 'Bar}).then((response) => console.log(response));
    //  */
    const post = (uri: string, data: object, options = []) => execFetch(uri, { method: 'POST', body: JSON.stringify(data) }, options);
    const remove = (uri: string, data: object, options = []) => execFetch(uri, { method: 'DELETE', body: JSON.stringify(data) }, options);
    const put = (uri: string, data: object, options = []) => execFetch(uri, { method: 'PUT', body: JSON.stringify(data) }, options);
    const healthCheck = () => get('_health')
    return { get, post, put, remove, getConfig, setLocalStorage, removeOnly, healthCheck };
})();

export default ApiClient;
