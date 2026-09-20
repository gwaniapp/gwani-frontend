"use client";

import { useState } from "react";
import { Input } from "@repo/ui/input";
import { FormActions } from "@/features/settings/components/formParts";
import { useRequestAccountDeletion } from "@/features/settings/hooks/useSettings";

const CONFIRM_WORD = "DELETE";

/**
 * The body of the Delete Account sheet (no mock for it, so it follows the other
 * sheets). Deliberately a *request* (see `useRequestAccountDeletion`): jobs in
 * progress and funds held in escrow have to be settled first, and the backend
 * only erases accounts from the admin side. Typing the word keeps it from being
 * a stray tap.
 */
function DeleteAccount({ onDone }: { onDone: () => void }) {
	const [typed, setTyped] = useState("");
	const request = useRequestAccountDeletion();

	return (
		<form
			noValidate
			onSubmit={(event) => {
				event.preventDefault();
				if (typed === CONFIRM_WORD) request.mutate(undefined, { onSuccess: onDone });
			}}
			className="flex flex-col gap-5"
		>
			<p className="text-b3 text-neutral-500 sm:text-b1">
				Your personal details will be erased and you&apos;ll lose access to your jobs and history. Jobs that are in
				progress, or payments still held in escrow, need to be settled first. This can&apos;t be undone.
			</p>
			<div className="flex flex-col gap-2">
				<label htmlFor="delete-confirm" className="text-b1 text-foreground">
					Type <span className="font-semibold">{CONFIRM_WORD}</span> to confirm
				</label>
				<Input
					id="delete-confirm"
					value={typed}
					onChange={(event) => setTyped(event.target.value)}
					autoComplete="off"
					placeholder={CONFIRM_WORD}
					className="h-11 rounded-xl"
				/>
			</div>
			<FormActions
				layout="sheet"
				destructive
				submitLabel="Request deletion"
				loading={request.isPending}
				disabled={typed !== CONFIRM_WORD}
				onCancel={onDone}
			/>
		</form>
	);
}

export { DeleteAccount };
