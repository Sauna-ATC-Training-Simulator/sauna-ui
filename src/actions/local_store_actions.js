export function getStoreItem(key){
    return window.electron.electronStore.get(key);
}

export function setStoreItem(key, value){
    window.electron.electronStore.set(key, value);
}

export function getUiSettings(){
    return getStoreItem("settings");
}

export function saveUiSettings(uiSettings){
    setStoreItem("settings", uiSettings);
}

export function getApiHostname(){
    return getStoreItem("settings.apiServer.hostName");
}

export function getApiPort(){
    return getStoreItem("settings.apiServer.port");
}

export function getApiUrl(){
    return `http://${getApiHostname()}:${getApiPort()}/api`;
}