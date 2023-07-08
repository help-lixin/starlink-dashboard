export const getEnv = function (key:string) {
    const value = import.meta.env[key];
    return value || "";
}

export const GATEWAY_BASE_URL = getEnv("VITE_GATEWAY_API_PREFIX_PATH");

