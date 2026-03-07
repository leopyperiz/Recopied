use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipboardItem {
    pub id: i64,
    pub content_type: String,       // "text" or "image"
    pub text_content: Option<String>,
    pub image_path: Option<String>,
    pub preview: Option<String>,
    pub pinned: bool,
    pub created_at: String,
    pub hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewClipboardItem {
    pub content_type: String,
    pub text_content: Option<String>,
    pub image_path: Option<String>,
    pub preview: Option<String>,
    pub hash: String,
}
