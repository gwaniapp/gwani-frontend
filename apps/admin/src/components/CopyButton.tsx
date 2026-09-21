"use client";

import { Copy } from "lucide-react";
import { toast } from "@repo/ui/sonner";

/** A tiny copy-to-clipboard icon button (ids, hashes). */
function CopyButton({ value, label }: { value: string; label: string }) {
	return (
		<button
			type="button"
			aria-label={`Copy ${label}`}
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(value);
					toast.success(`${label} copied`);
				} catch {
					toast.error("Couldn't copy that");
				}
			}}
			className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-neutral-500 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary-300"
		>
			<Copy className="size-3.5" aria-hidden="true" />
		</button>
	);
}

/** An id/hash in monospace with its copy button. */
function IdValue({ value, label }: { value: string; label: string }) {
	return (
		<span className="inline-flex max-w-full items-center gap-1.5">
			<code className="truncate text-c1 lg:text-b3">{value}</code>
			<CopyButton value={value} label={label} />
		</span>
	);
}

export { CopyButton, IdValue };
