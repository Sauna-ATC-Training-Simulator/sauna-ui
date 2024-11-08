use std::path::Path;
use crate::child_guard::ChildGuard;
use crate::local_store::StoreContainer;
use crate::utils::port_finder::get_available_port;


#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiConnectionPayload {
    pub hostname: String,
    pub port: u16
}

pub struct AppState {
    pub api_hostname: String,
    pub api_port: u16,
    pub api_builtin: bool,
    pub api_process: ChildGuard,
    pub radar_process: ChildGuard,
    pub local_store: Option<StoreContainer>
}

impl AppState {
    pub fn new() -> AppState {
        AppState{
            api_hostname: "localhost".into(),
            api_port: 5000,
            api_builtin: true,
            api_process: ChildGuard(None),
            radar_process: ChildGuard(None),
            local_store: None
        }
    }

    pub fn init(&mut self, local_store_path: &Path) {
        self.local_store = Some(StoreContainer::new(local_store_path));
    }

    pub fn start_sauna_api(&mut self, sauna_api_dir: &Path) -> Result<(), String> {
        // Get a port
        self.api_hostname = "localhost".to_owned();
        self.api_port = get_available_port().ok_or_else(|| "Could not find available port".to_owned())?;
        self.api_builtin = true;

        self.api_process.start_child(
            sauna_api_dir.join("SaunaApi"),
            Some(sauna_api_dir),
            &["-p".to_owned(), self.api_port.to_string()]
        );

        // Check to make sure api started
        if self.api_process.0.is_none() {
            self.api_builtin = false;
            if let Some(local_store) = &self.local_store {
                self.api_hostname = local_store.store.settings.api_server.host_name.clone();
                self.api_port = local_store.store.settings.api_server.port;
            }
        }

        Ok(())
    }



    pub fn stop_sauna_api(&mut self){
        if let Some(mut child) = self.api_process.0.take() {

            let ApiConnectionPayload { hostname, port} = self.get_api_conn_details();

            reqwest::blocking::Client::new()
                .post(format! {"http://{}:{}/api/server/shutdown", hostname, port})
                .send()
                .ok();
            child.wait().ok();
            
            self.api_process = ChildGuard(None);
        }
    }

    pub fn start_sauna_radar(&mut self, sauna_radar_dir: impl AsRef<Path>) -> Result<(), String> {
        let local_store = self.local_store.as_ref().ok_or_else(|| String::from("Local store not yet initialised"))?;
        
        let args = [
            "-h".to_string(),
            self.api_hostname.clone(),
            "-p".to_string(),
            self.api_port.to_string(),
            "-t".to_string(),
            "-s".to_string(),
            local_store.store.settings.radar_settings.sector_file_path.to_string_lossy().into_owned(),
            "-c".to_string(),
            local_store.store.settings.radar_settings.symbology_file_path.to_string_lossy().into_owned(),
            "-a".to_string(),
            local_store.store.settings.radar_settings.asr_file_path.to_string_lossy().into_owned(),
            "-y".to_string(),
            local_store.store.settings.radar_settings.center_lat.to_string(),
            "-x".to_string(),
            local_store.store.settings.radar_settings.center_lon.to_string(),
            "-z".to_string(),
            local_store.store.settings.radar_settings.zoom_level.to_string()
        ];

        if let Some(radar_process) = &mut self.radar_process.0 {
            match radar_process.try_wait() {
                Ok(None) => return Err(String::from("Radar is already running")),
                _ => radar_process.wait().ok(),
            };
        }

        self.radar_process.start_child(&sauna_radar_dir.as_ref().join("radar-viewer"), Some(sauna_radar_dir.as_ref()), &args);

        Ok(())
    }

    pub fn stop_sauna_radar(&mut self) {
        if let Some(sauna_radar_process) = &mut self.radar_process.0 {
            sauna_radar_process.wait().ok();
        }
        self.radar_process = ChildGuard(None);
    }
    

    pub fn get_api_conn_details(&mut self) -> ApiConnectionPayload {
        if self.api_builtin {
            return ApiConnectionPayload {
                hostname: self.api_hostname.clone(),
                port: self.api_port
            }
        }

        if let Some(local_store) = &self.local_store {
            return ApiConnectionPayload {
                hostname: local_store.store.settings.api_server.host_name.clone(),
                port: local_store.store.settings.api_server.port
            }
        }

        return ApiConnectionPayload {
            hostname: "localhost".to_string(),
            port: 5000
        }
    }
}