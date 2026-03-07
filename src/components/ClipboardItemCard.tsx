import { useState, useRef, useEffect } from "react";
import type { ClipboardItem } from "../types/clipboard";
import { pasteItem, pinItem, deleteItem } from "../lib/tauri";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Pin, PinOff, Trash2 } from "lucide-react";

interface Props {
	item: ClipboardItem;
	onUpdate: () => void;
	isSelected?: boolean;
	dataIndex?: number;
	compact?: boolean;
}

export default function ClipboardItemCard({ item, onUpdate, isSelected, dataIndex, compact }: Props) {
	const [showMenu, setShowMenu] = useState(false);
	const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!showMenu) return;
		const handler = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setShowMenu(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [showMenu]);

	const handleClick = async () => {
		try {
			await pasteItem(item.id);
		} catch (err) {
			console.error("Paste failed:", err);
		}
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		setMenuPos({ x: e.clientX, y: e.clientY });
		setShowMenu(true);
	};

	const handlePin = async () => {
		setShowMenu(false);
		await pinItem(item.id);
		onUpdate();
	};

	const handleDelete = async () => {
		setShowMenu(false);
		await deleteItem(item.id);
		onUpdate();
	};

	const formatTime = (dateStr: string) => {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays}d ago`;
	};

	const displayText = item.preview || item.text_content || "";

	return (
		<>
			<div data-index={dataIndex} onClick={handleClick} onContextMenu={handleContextMenu} className={`clip-item group relative cursor-pointer rounded-(--radius-card) border ${compact ? "px-4 py-3" : "px-0 py-2"} transition-colors ${isSelected ? "bg-bg-card-hover border-accent/40" : "bg-bg-card hover:bg-bg-card-hover hover:border-border-subtle border-transparent"}`}>
				<div className="flex flex-row items-start justify-between">
					<div className="px-3">
						{/* Pin indicator */}
						{item.pinned && (
							<span className="text-pin absolute top-1.5 right-2 opacity-80">
								<Pin size={10} />
							</span>
						)}

						{item.content_type === "text" ? <p className={`text-text-primary selectable ${compact ? "line-clamp-4 text-[13px] leading-relaxed" : "line-clamp-3 text-[12px] leading-normal"} pr-4 wrap-break-word`}>{displayText}</p> : item.image_path && <img src={convertFileSrc(item.image_path)} alt="Clipboard image" className={`${compact ? "max-h-40" : "max-h-28"} w-full rounded object-cover`} />}

						{/* Footer: time + action icons on hover */}
						<div className={`${compact ? "mt-2" : "mt-1.5"} flex flex-row items-center justify-between`}>
							<span className="text-text-muted text-[10px]">{formatTime(item.created_at)}</span>
						</div>
					</div>

					<div className="flex flex-col items-end justify-start gap-1 px-1 opacity-50 transition-opacity group-hover:opacity-100">
						<button
							onClick={(e) => {
								e.stopPropagation();
								handlePin();
							}}
							className="hover:bg-bg-active text-text-secondary hover:text-text-primary cursor-pointer rounded p-1.5 transition-colors"
							title={item.pinned ? "Unpin" : "Pin"}
						>
							{item.pinned ? <PinOff size={12} /> : <Pin size={12} />}
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleDelete();
							}}
							className="text-text-secondary hover:text-danger cursor-pointer rounded p-1.5 transition-colors hover:bg-red-500/20"
							title="Delete"
						>
							<Trash2 size={12} />
						</button>
					</div>
				</div>
			</div>

			{/* Context menu */}
			{showMenu && (
				<div ref={menuRef} className="bg-bg-card border-border fixed z-50 min-w-37.5 rounded-(--radius-card) border py-1 shadow-2xl" style={{ left: menuPos.x, top: menuPos.y }}>
					<button onClick={handlePin} className="text-text-primary hover:bg-bg-hover flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors">
						{item.pinned ? <PinOff size={12} /> : <Pin size={12} />}
						{item.pinned ? "Unpin" : "Pin to top"}
					</button>
					<button onClick={handleDelete} className="text-danger hover:bg-bg-hover flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors">
						<Trash2 size={12} />
						Delete
					</button>
				</div>
			)}
		</>
	);
}
