import { Search, X } from "lucide-react";

interface Props {
	value: string;
	onChange: (value: string) => void;
	large?: boolean;
}

export default function SearchBar({ value, onChange, large }: Props) {
	return (
		<div className="relative">
			<Search className={`text-text-muted pointer-events-none absolute top-1/2 -translate-y-1/2 ${large ? "left-3" : "left-2.5"}`} size={large ? 16 : 14} />
			<input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search clipboard history" className={`selectable bg-bg-secondary text-text-primary border-border focus:border-accent placeholder:text-text-muted w-full rounded-(--radius-card) border transition-colors focus:outline-none ${large ? "py-2.5 pr-10 pl-10 text-[14px]" : "py-1.5 pr-8 pl-8 text-[12px]"}`} />
			{value && (
				<button onClick={() => onChange("")} className={`text-text-muted hover:text-text-primary absolute top-1/2 -translate-y-1/2 cursor-pointer ${large ? "right-3" : "right-2.5"}`}>
					<X size={large ? 14 : 12} />
				</button>
			)}
		</div>
	);
}
