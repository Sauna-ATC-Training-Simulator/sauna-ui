import {invoke} from "@tauri-apps/api";

export async function launchRadar() {
    return await invoke('launch_radar', {});
}