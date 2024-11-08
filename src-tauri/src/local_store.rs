use std::fs;
use std::fs::File;
use std::ops::IndexMut;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use std::io::Write;

pub struct StoreContainer {
    pub store: LocalStore,
    pub path: PathBuf
}

impl StoreContainer {
    pub fn new(path: &Path) -> StoreContainer {
        // Try to load store from path, otherwise generate default store
        StoreContainer {
            path: path.to_owned(),
            store: std::fs::read_to_string(path).ok().and_then(|file_string| {
                serde_json::from_str::<LocalStore>(&file_string).ok()
            }).unwrap_or_default()
        }
    }

    pub fn get(&self, key: &str) -> Option<serde_json::Value> {
        let json = serde_json::to_value(&self.store).ok()?;
        let split_keys = key.split('.');
        let mut ret_val = &json;
        for key in split_keys {
            if let Some(val) = ret_val.get(key) {
                ret_val = val;
            } else {
                return None;
            }
        }

        Some(ret_val.clone())
    }

    pub fn set(&mut self, key: &str, value: serde_json::Value) -> Result<(), String> {
        let mut json = serde_json::to_value(&self.store).map_err(|error| error.to_string())?;
        let split_keys = key.split('.');
        let mut ret_val = &mut json;
        for key in split_keys {
            ret_val = ret_val.index_mut(key);
        }

        *ret_val = value.clone();
        self.store = serde_json::from_value::<LocalStore>(json).map_err(|error| error.to_string())?;

        Ok(())
    }

    pub fn save(&self) -> Result<(), String> {
        // Serialize to string
        let json_str = serde_json::to_string_pretty(&self.store).map_err(|error| error.to_string())?;

        // Create directory
        if let Some(parent_path) = self.path.parent() {
            fs::create_dir_all(parent_path).map_err(|error| error.to_string())?;
        }

        // Save to file
        let mut file = File::create(&self.path).map_err(|error| error.to_string())?;

        write!(file, "{}", json_str).map_err(|error| error.to_string())?;

        Ok(())
    }
}

impl Drop for StoreContainer {
    fn drop(&mut self) {
        let json_str = match serde_json::to_string(&self.store) {
            Ok(value) => value,
            Err(error) => {
                println!("{}", error.to_string());

                panic!("LOL")
            }
        };

        // Save to file
        let mut file = match File::create(&self.path) {
            Ok(value) => value,
            Err(error) => {
                println!("{}", error.to_string());

                panic!("Failed at creating file")
            }
        };

        match write!(file, "{}", json_str) {
            Ok(value) => value,
            Err(error) => println!("{}", error.to_string())
        };
    }
}

#[derive(Serialize, Deserialize, Default)]
pub struct LocalStore {
    #[serde(default)]
    pub settings: Settings,
    #[serde(default)]
    pub navigraph: NavigraphSettings
}

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    #[serde(default)]
    pub api_server: ApiServerSettings,
    #[serde(default)]
    pub api_settings: ApiSettings,
    #[serde(default)]
    pub fsd_connection: FsdConnectionSettings,
    #[serde(default)]
    pub radar_settings: RadarSettings
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiServerSettings {
    #[serde(default = "default_api_host_name")]
    pub host_name: String,
    #[serde(default = "default_api_port")]
    pub port: u16
}
impl Default for ApiServerSettings {
    fn default() -> Self {
        ApiServerSettings {
            host_name: default_api_host_name(),
            port: default_api_port()
        }
    }
}

fn default_api_host_name() -> String {"localhost".to_string()}
fn default_api_port() -> u16 {5000}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiSettings {
    #[serde(default = "default_api_pos_calc_rate")]
    pub pos_calc_rate: u16,
    #[serde(default = "default_api_command_freq")]
    pub command_frequency: String
}
impl Default for ApiSettings {
    fn default() -> Self {
        ApiSettings {
            pos_calc_rate: default_api_pos_calc_rate(),
            command_frequency: default_api_command_freq()
        }
    }
}

fn default_api_pos_calc_rate() -> u16 {100}
fn default_api_command_freq() -> String {"199.998".to_string()}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FsdConnectionSettings {
    #[serde(default)]
    pub network_id: String,
    #[serde(default)]
    pub password: String,
    #[serde(default)]
    pub hostname: String,
    #[serde(default = "default_fsd_port")]
    pub port: u16,
    #[serde(default = "default_fsd_protocol")]
    pub protocol: String
}
impl Default for FsdConnectionSettings {
    fn default() -> Self {
        FsdConnectionSettings{
            network_id: "".to_string(),
            password: "".to_string(),
            hostname: "".to_string(),
            port: default_fsd_port(),
            protocol: default_fsd_protocol()
        }
    }
}
fn default_fsd_port() -> u16 {6809}
fn default_fsd_protocol() -> String {"Classic".to_string()}

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RadarSettings {
    #[serde(default)]
    pub sector_file_path: PathBuf,
    #[serde(default)]
    pub symbology_file_path: PathBuf,
    #[serde(default)]
    pub asr_file_path: PathBuf,
    #[serde(default)]
    pub center_lat: f32,
    #[serde(default)]
    pub center_lon: f32,
    #[serde(default)]
    pub zoom_level: f32,
}


#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NavigraphSettings {
    #[serde(default)]
    pub authenticated: bool,
    #[serde(default)]
    pub refresh_token: String,
    #[serde(default)]
    pub package: NavigraphPackageSettings
}

#[derive(Serialize, Deserialize, Default)]
pub struct NavigraphPackageSettings {
    #[serde(default)]
    pub package_id: String,
    #[serde(default)]
    pub cycle: String,
    #[serde(default)]
    pub revision: String,
    #[serde(default)]
    pub filename: String,
    #[serde(default)]
    pub current: bool
}