import { cn } from "@repo/ui/lib/utils";

/** A white rounded card on the tinted page — the console's basic surface (filters, tables, empty states). */
function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
	return <div className={cn("rounded-2xl border border-border bg-white shadow-[0_2px_12px_rgb(0_0_0/0.03)]", className)}>{children}</div>;
}

export { Panel };
