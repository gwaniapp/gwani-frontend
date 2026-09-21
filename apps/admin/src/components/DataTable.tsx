import { cn } from "@repo/ui/lib/utils";

/**
 * Small table primitives in the console's look: a bordered rounded frame that scrolls sideways
 * on narrow screens instead of squashing its columns, a quiet header row and hairline row dividers.
 */
function TableFrame({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<div className={cn("overflow-x-auto rounded-2xl border border-border bg-white [contain:paint]", className)}>
			<table className="w-full min-w-176 border-collapse text-left text-b3 lg:text-b1">{children}</table>
		</div>
	);
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
	return (
		<th scope="col" className={cn("border-b border-border bg-muted/60 px-4 py-3 text-c1 font-medium whitespace-nowrap text-neutral-600 lg:px-5", className)}>
			{children}
		</th>
	);
}

function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
	return <td className={cn("border-b border-border px-4 py-3.5 align-middle text-foreground last:border-b-0 lg:px-5", className)}>{children}</td>;
}

export { TableFrame, Td, Th };
