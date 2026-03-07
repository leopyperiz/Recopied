import { Search, Clipboard } from "lucide-react";

interface Props {
	hasSearch: boolean;
}

export default function EmptyState({ hasSearch }: Props) {
	return (
		<div className="flex h-48 flex-col items-center justify-center px-6 text-center">
			<div className="text-text-muted mb-2 opacity-60">{hasSearch ? <Search size={28} /> : <Clipboard size={28} />}</div>
			<p className="text-text-secondary text-[12px]">{hasSearch ? "No items match your search" : "Your clipboard history is empty"}</p>
			<p className="text-text-muted mt-1 text-[10px]">{hasSearch ? "Try a different search term" : "Copy something to get started"}</p>
		</div>
	);
}
