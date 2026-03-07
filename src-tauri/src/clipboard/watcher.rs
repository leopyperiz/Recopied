use sha2::{Digest, Sha256};
use std::process::Command;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use log::{info, error, debug};

use crate::clipboard::types::NewClipboardItem;
use crate::db;

#[derive(Debug, Clone, Copy, PartialEq)]
enum DisplayServer {
    X11,
    Wayland,
}

fn detect_display_server() -> DisplayServer {
    if std::env::var("WAYLAND_DISPLAY").is_ok() {
        DisplayServer::Wayland
    } else {
        DisplayServer::X11
    }
}

pub struct ClipboardWatcher {
    last_hash: Arc<Mutex<String>>,
}

impl ClipboardWatcher {
    pub fn new() -> Self {
        Self {
            last_hash: Arc::new(Mutex::new(String::new())),
        }
    }

    pub fn start(&self, db_path: String) {
        let last_hash = self.last_hash.clone();

        thread::spawn(move || {
            let display = detect_display_server();
            info!("Clipboard watcher started (display server: {:?})", display);

            loop {
                // Read text clipboard
                match read_clipboard_text(display) {
                    Ok(text) if !text.is_empty() => {
                        let hash = compute_hash(text.as_bytes());
                        let mut last = last_hash.lock().unwrap();
                        if *last != hash {
                            *last = hash.clone();
                            drop(last);

                            debug!("New clipboard text captured ({} chars)", text.len());

                            let preview = if text.len() > 200 {
                                Some(text[..200].to_string())
                            } else {
                                Some(text.clone())
                            };

                            let item = NewClipboardItem {
                                content_type: "text".to_string(),
                                text_content: Some(text),
                                image_path: None,
                                preview,
                                hash,
                            };

                            if let Err(e) = db::queries::insert_item(&db_path, &item) {
                                error!("Failed to save clipboard item: {}", e);
                            }
                        }
                    }
                    Ok(_) => {} // empty clipboard
                    Err(e) => {
                        debug!("Clipboard read error (normal if no text): {}", e);
                    }
                }

                // Read image clipboard
                match read_clipboard_image(display) {
                    Ok(image_bytes) if !image_bytes.is_empty() => {
                        let hash = compute_hash(&image_bytes);
                        let mut last = last_hash.lock().unwrap();
                        if *last != hash {
                            *last = hash.clone();
                            drop(last);

                            debug!("New clipboard image captured ({} bytes)", image_bytes.len());

                            match save_image_bytes(&hash, &image_bytes) {
                                Ok(image_path) => {
                                    let item = NewClipboardItem {
                                        content_type: "image".to_string(),
                                        text_content: None,
                                        image_path: Some(image_path),
                                        preview: None,
                                        hash,
                                    };

                                    if let Err(e) = db::queries::insert_item(&db_path, &item) {
                                        error!("Failed to save clipboard image: {}", e);
                                    }
                                }
                                Err(e) => {
                                    error!("Failed to save image to disk: {}", e);
                                }
                            }
                        }
                    }
                    Ok(_) => {} // no image
                    Err(_) => {} // normal — no image on clipboard
                }

                thread::sleep(Duration::from_millis(500));
            }
        });
    }
}

/// Read text from clipboard (supports X11 via xclip and Wayland via wl-paste)
fn read_clipboard_text(display: DisplayServer) -> Result<String, Box<dyn std::error::Error>> {
    let output = match display {
        DisplayServer::X11 => Command::new("xclip")
            .args(["-selection", "clipboard", "-o"])
            .output()?,
        DisplayServer::Wayland => Command::new("wl-paste")
            .args(["--no-newline", "--type", "text/plain"])
            .output()?,
    };

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err("Clipboard read returned non-zero status".into())
    }
}

/// Read image from clipboard (PNG format, supports X11 and Wayland)
fn read_clipboard_image(display: DisplayServer) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let output = match display {
        DisplayServer::X11 => Command::new("xclip")
            .args(["-selection", "clipboard", "-t", "image/png", "-o"])
            .output()?,
        DisplayServer::Wayland => Command::new("wl-paste")
            .args(["--no-newline", "--type", "image/png"])
            .output()?,
    };

    if output.status.success() && !output.stdout.is_empty() {
        Ok(output.stdout)
    } else {
        Err("No image on clipboard".into())
    }
}

fn compute_hash(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    format!("{:x}", hasher.finalize())
}

fn save_image_bytes(
    hash: &str,
    png_bytes: &[u8],
) -> Result<String, Box<dyn std::error::Error>> {
    let data_dir = dirs::data_dir()
        .ok_or("Could not find data directory")?
        .join("recopied")
        .join("images");
    std::fs::create_dir_all(&data_dir)?;

    let file_path = data_dir.join(format!("{}.png", hash));
    let file_path_str = file_path.to_string_lossy().to_string();

    if file_path.exists() {
        return Ok(file_path_str);
    }

    std::fs::write(&file_path, png_bytes)?;

    info!("Saved clipboard image: {}", file_path_str);
    Ok(file_path_str)
}
