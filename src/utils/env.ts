export const getEnv = function (key) {
    console.log(import.meta.env);
    const value = import.meta.env[key];
    return value || "";
}

export const PASSPORT_BASE_URL = getEnv("VITE_PASSPORT_API_PREFIX_PATH");

export const GATEWAY_BASE_URL = getEnv("VITE_GATEWAY_API_PREFIX_PATH");

