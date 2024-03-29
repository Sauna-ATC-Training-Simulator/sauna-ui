import {axiosSaunaApi} from "./api_connection_handler";
import {getApiUrl} from "./local_store_actions";

export async function getAircraftList(withFms = false){
    const url = `${await getApiUrl()}/aircraft/getAll${withFms ? "WithFms": ""}`;
    return (await axiosSaunaApi.get(url)).data;
}

export async function getSimState(){
    const url = `${await getApiUrl()}/aircraft/all/simState`;
    return (await axiosSaunaApi.get(url)).data;
}

export async function pauseall(){
    const url = `${await getApiUrl()}/aircraft/all/pause`;
    return (await axiosSaunaApi.post(url, {})).data;
}

export async function unpauseall(){
    const url = `${await getApiUrl()}/aircraft/all/unpause`;
    return (await axiosSaunaApi.post(url, {})).data;
}

export async function setAllSimRate(simrate){
    const url = `${await getApiUrl()}/aircraft/all/simrate`;
    return (await axiosSaunaApi.post(url, {
        simRate: simrate,
        paused: true // This is currently useless
    })).data;
}

export async function pauseAircraft(callsign){
    const url = `${await getApiUrl()}/aircraft/byCallsign/${callsign}/pause`;
    return (await axiosSaunaApi.post(url, {})).data;
}

export async function unpauseAircraft(callsign){
    const url = `${await getApiUrl()}/aircraft/byCallsign/${callsign}/unpause`;
    return (await axiosSaunaApi.post(url, {})).data;
}

export async function setAircraftSimRate(callsign, simrate){
    const url = `${await getApiUrl()}/aircraft/byCallsign/${callsign}/simrate`;
    return (await axiosSaunaApi.post(url, {
        simRate: simrate,
        paused: true // This is currently useless
    })).data;
}

export async function removeAllAircraft(){
    const url = `${await getApiUrl()}/aircraft/all/remove`;
    return (await axiosSaunaApi.delete(url)).data;
}