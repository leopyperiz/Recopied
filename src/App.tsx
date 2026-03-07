import { useEffect, useCallback, useState } from "react";
import { hideWindow, setWindowMode } from "./lib/tauri";
import ClipboardPopup from "./components/ClipboardPopup";

function App() {
	const [isFullscreen, setIsFullscreen] = useState(false);

	const handleEscape = useCallback(async (e: KeyboardEvent) => {
		if (e.key === "Escape") {
			await hideWindow();
		}
	}, []);

	useEffect(() => {
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [handleEscape]);

	const toggleFullscreen = async () => {
		const next = !isFullscreen;
		setIsFullscreen(next);
		await setWindowMode(next);
	};

	if (isFullscreen) {
		return (
			<div className="h-full w-full bg-black/80">
				<div className="flex h-full w-full flex-col overflow-hidden">
					<ClipboardPopup isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />
				</div>
			</div>
		);
	}

	return (
		<div className="h-full w-full p-2">
			<div className="bg-bg-primary border-border animate-slide-up flex h-full w-full flex-col overflow-hidden rounded-xl border shadow-2xl">
				<ClipboardPopup isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />
			</div>
		</div>
	);
}

export default App;
