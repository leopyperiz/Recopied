export interface ClipboardItem {
	id: number;
	content_type: "text" | "image";
	text_content: string | null;
	image_path: string | null;
	preview: string | null;
	pinned: boolean;
	created_at: string;
}

export interface Settings {
	max_history: number;
	polling_interval_ms: number;
}
