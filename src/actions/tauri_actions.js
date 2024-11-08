import {createDir} from "@tauri-apps/api/fs";
import {invoke} from "@tauri-apps/api";
import {getAll, WebviewWindow} from "@tauri-apps/api/window";
import {storeSave} from "./local_store_actions";
import {listen} from "@tauri-apps/api/event";
import {store as reduxStore} from "../redux/store";
import {onBuiltInChange} from "../redux/slices/apiSlice";

// Register window close event for main window
const webview = new WebviewWindow("main");
webview.once("tauri://close-requested", async function (e) {
    await storeSave();
    for (const window of getAll()){
        await window.close();
    }
});

// Listen to sauna api builtin events
updateSaunaApiBuiltIn().then(() => {})
listen("sauna-api-builtin", (event) => {
    reduxStore.dispatch(onBuiltInChange(event.payload));
    console.log(event);
}).then(() => {});

export async function updateSaunaApiBuiltIn(){
    const builtIn = await invoke('get_sauna_api_builtin', {});
    reduxStore.dispatch(onBuiltInChange(builtIn));
}

export async function getSaunaApiConnectionDetails(){
    return await invoke("get_sauna_api_conn_details", {});
}

export async function downloadFileFromUrl(url, location){
    // Create directory
    await createDir(location, {recursive: true});
    // Invoke Rust command
    return await invoke('download_file', {
        dir: location,
        url
    });
}

export async function extractZipFile(zipfile, dir){
    // Invoke Rust command
    return await invoke('extract_zip', {
        dir: dir,
        zipFileName: zipfile
    });
}

