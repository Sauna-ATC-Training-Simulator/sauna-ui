// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod local_store;
mod child_guard;
mod utils;
mod tauri_app_state;

use std::fs::File;
use std::{io};
use std::io::{BufReader, Cursor};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::{Manager};
use zip::ZipArchive;
use crate::tauri_app_state::{ApiConnectionPayload, AppState};

pub struct AppStateWrapper(pub Mutex<AppState>);


fn main() {
    let app = tauri::Builder::default()
        .manage(AppStateWrapper(Mutex::new(AppState::new())))
        .invoke_handler(tauri::generate_handler![extract_zip, store_set, store_get, store_save, download_file, get_sauna_api_builtin, get_sauna_api_conn_details, launch_radar])
        .setup(|app| {
            // Send Sauna API Built In event
            app.emit_all("sauna-api-builtin", true).unwrap();

            // Get app state
            let binding = app.state::<AppStateWrapper>();
            let mut app_state_guard = binding.0.lock().unwrap();

            // Initialize Store
            app_state_guard.init(&app.path_resolver().app_data_dir().unwrap().join("config.json"));

            // Start Sauna API
            app_state_guard.start_sauna_api(&app.path_resolver().resource_dir().unwrap().join("sauna-api")).ok();

            // Send Sauna API Built In event
            app.emit_all("sauna-api-builtin", app_state_guard.api_builtin).unwrap();
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application");
    app.run(|_app_handle, event | match event {
        tauri::RunEvent::Exit {..} | tauri::RunEvent::ExitRequested {..} => {

            // Get app state
            let binding = _app_handle.state::<AppStateWrapper>();
            let mut app_state_guard = binding.0.lock().unwrap();

            // Save local store
            if let Some(local_store) = app_state_guard.local_store.as_ref() {
                local_store.save().ok();
            }

            // Stop sauna API

            app_state_guard.stop_sauna_api();

            // Stop Sauna Radar
            app_state_guard.stop_sauna_radar();
        }
        _ => {}
    });
}

#[tauri::command]
fn get_sauna_api_builtin(app_state: tauri::State<AppStateWrapper>) -> Result<bool, String> {
    let app_state_guard = app_state.0.lock().unwrap();
    return Ok(app_state_guard.api_builtin);
}

#[tauri::command]
fn get_sauna_api_conn_details(app_state: tauri::State<AppStateWrapper>) -> Result<ApiConnectionPayload, String> {
    let mut app_state_guard = app_state.0.lock().unwrap();
    return Ok(app_state_guard.get_api_conn_details());
}

#[tauri::command]
fn download_file(url: &str, dir: &str) -> Result<String, String> {
    // Get filename from url
    let parsed_url = reqwest::Url::parse(url).map_err(|error| error.to_string())?;
    let filename = parsed_url.path_segments().map_or_else(std::path::PathBuf::new, |f| std::path::PathBuf::from(f.last().unwrap_or("")));

    // Download file
    let resp = reqwest::blocking::get(url).map_err(|error| error.to_string())?;
    let mut out = File::create(Path::new(dir).join(&filename)).map_err(|error| error.to_string())?;
    let mut content = Cursor::new(resp.bytes().map_err(|error| error.to_string())?);
    io::copy(&mut content, &mut out).map_err(|error| error.to_string())?;

    Ok(filename.file_name().ok_or("Failed to get file name".to_string())?.to_str().ok_or("Failed to get file name".to_string())?.to_string())
}

#[tauri::command]
fn extract_zip(dir: &str, zip_file_name: &str) -> Result<Vec<String>, String> {
    let filename = PathBuf::from(dir).join(zip_file_name);
    let file_reader = BufReader::new(File::open(filename).map_err(|error| error.to_string())?);
    let mut zip_archive = ZipArchive::new(file_reader).map_err(|error| error.to_string())?;

    // Get files in zip
    let files_in_zip = zip_archive.file_names().map(|x| {
        x.to_owned()
    }).collect::<Vec<_>>();

    zip_archive.extract(dir).map_err(|error| error.to_string())?;

    return Ok(files_in_zip);
}

#[tauri::command]
fn store_save(app_state: tauri::State<AppStateWrapper>) -> Result<(), String> {
    let mut app_state_guard = app_state.0.lock().unwrap();
    if let Some(local_store) = app_state_guard.local_store.as_mut() {
        local_store.save()
    } else {
        Err("Local Store is null".to_owned())
    }
}

#[tauri::command]
fn store_get(key: &str, app_state: tauri::State<AppStateWrapper>) -> Result<serde_json::Value, String> {
    let mut app_state_guard = app_state.0.lock().unwrap();
    if let Some(local_store) = app_state_guard.local_store.as_mut() {
        local_store.get(key).ok_or("Error getting value from local store".to_owned())
    } else {
        Err("Local Store is null".to_owned())
    }
}

#[tauri::command]
fn store_set(key: &str, value: serde_json::Value, app_state: tauri::State<AppStateWrapper>) -> Result<(), String> {
    let mut app_state_guard = app_state.0.lock().unwrap();
    if let Some(local_store) = app_state_guard.local_store.as_mut() {
        local_store.set(key, value)
    } else {
        Err("Local Store is null".to_owned())
    }
}

#[tauri::command]
fn launch_radar(app_state: tauri::State<AppStateWrapper>, app_handle: tauri::AppHandle) -> Result<(), String> {
    let sauna_radar_dir = app_handle.path_resolver().resource_dir().unwrap().join("sauna-radar");
    let mut app_state_guard = app_state.0.lock().unwrap();
    app_state_guard.start_sauna_radar(sauna_radar_dir)
    
}