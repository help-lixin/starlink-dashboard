export const getEnv = function (key:string) {
    const value = import.meta.env[key];
    return value || "";
}

const getKey = function (key:string) {
    const value = import.meta.env[key];
    return value || "";
}

const getSystemService = function(gateway:string,serviceName:string){
    const prefix = getKey(gateway);
    const serviceNamePrefix = getKey(serviceName);
    return prefix + serviceNamePrefix;
}

export const GATEWAY_BASE_URL = getEnv("VITE_GATEWAY_API_PREFIX_PATH");

export const MESSAGE_SERVICE = getEnv("VITE_MESSAGE_SERVICE");

export const SYSTEM_SERVICE = getSystemService("VITE_GATEWAY_API_PREFIX_PATH","VITE_SYSTEM_SERVICE");

export const STARLINK_SERVICE = getSystemService("VITE_GATEWAY_API_PREFIX_PATH","VITE_STARLINK_SERVICE");

export const PASSPORT_SERVICE = getSystemService("VITE_GATEWAY_API_PREFIX_PATH","VITE_PASSPORT_SERVICE");

