"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";

interface ConfirmStepProps {
	title: string;
	description: string;
	confirmLabel: string;
	destructive?: boolean;
	pending: boolean;
	/** The request's own error, shown inside the step. */
	error?: string;
	/** Ask for a note (recorded in the audit log) before confirming. */
	note?: { label: string; max: number; required?: boolean };
	/** The exact text to type before the confirm button works — for the irreversible actions. */
	typeToConfirm?: string;
	onConfirm: (note: string) => void;
	onBack: () => void;
}

/**
 * The "are you sure" step the console shows inside a dialog before it does anything that
 * changes or removes data: what will happen, an optional note for the audit log, an optional
 * "type this to confirm" guard, then Back / confirm. Keeping it inside the dialog (rather than
 * stacking another modal) means one place to look and one way out.
 */
function ConfirmStep({ title, description, confirmLabel, destructive, pending, error, note, typeToConfirm, onConfirm, onBack }: ConfirmStepProps) {
	const [text, setText] = useState("");
	const [typed, setTyped] = useState("");
	const noteMissing = Boolean(note?.required) && text.trim().length === 0;
	const typedWrong = typeToConfirm !== undefined && typed.trim() !== typeToConfirm;

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-1.5">
				<p className="text-b1 font-medium text-foreground">{title}</p>
				<p className="text-b3 text-neutral-500 lg:text-b1">{description}</p>
			</div>

			{note && (
				<div className="flex flex-col gap-2">
					<label htmlFor="confirm-note" className="text-b3 font-medium text-foreground lg:text-b1">
						{note.label}
						{!note.required && <span className="font-normal text-neutral-500"> (optional)</span>}
					</label>
					<Textarea id="confirm-note" value={text} onChange={(event) => setText(event.target.value)} maxLength={note.max} rows={3} className="min-h-24 resize-none" />
					<p className="text-right text-c1 text-neutral-500 tabular-nums">
						{text.length}/{note.max}
					</p>
				</div>
			)}

			{typeToConfirm !== undefined && (
				<div className="flex flex-col gap-2">
					<label htmlFor="confirm-typed" className="text-b3 font-medium text-foreground lg:text-b1">
						Type <span className="font-semibold break-all">{typeToConfirm}</span> to confirm
					</label>
					<Input id="confirm-typed" value={typed} onChange={(event) => setTyped(event.target.value)} autoComplete="off" spellCheck={false} placeholder={typeToConfirm} />
				</div>
			)}

			{error && (
				<p role="alert" className="text-b3 text-danger-600">
					{error}
				</p>
			)}

			<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<Button type="button" variant="outline" size="large" className="w-full sm:w-auto sm:px-8" disabled={pending} onClick={onBack}>
					Back
				</Button>
				<Button
					type="button"
					variant={destructive ? "destructive" : "primary"}
					size="large"
					className="w-full sm:w-auto sm:px-8"
					loading={pending}
					disabled={noteMissing || typedWrong}
					onClick={() => onConfirm(text.trim())}
				>
					{confirmLabel}
				</Button>
			</div>
		</div>
	);
}

export { ConfirmStep };
