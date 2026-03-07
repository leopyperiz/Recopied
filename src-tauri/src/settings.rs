use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

const DEFAULT_SHORTCUT: &str = "Ctrl+Shift+V";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub shortcut: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            shortcut: DEFAULT_SHORTCUT.to_string(),
        }
    }
}

fn settings_path() -> PathBuf {
    let data_dir = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("clipit");
    fs::create_dir_all(&data_dir).ok();
    data_dir.join("settings.json")
}

pub fn load_settings() -> AppSettings {
    let path = settings_path();
    if path.exists() {
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(settings) = serde_json::from_str::<AppSettings>(&data) {
                return settings;
            }
        }
    }
    let defaults = AppSettings::default();
    save_settings(&defaults).ok();
    defaults
}

pub fn save_settings(settings: &AppSettings) -> Result<(), String> {
    let path = settings_path();
    let json = serde_json::to_string_pretty(settings).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())
}
