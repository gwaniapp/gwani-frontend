"use client";

import { Button } from "@repo/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { SUPPORT_EMAIL } from "@/lib/site";

/**
 * The body of the Delete Account sheet. **The backend has no self-service
 * deletion** (erasure exists only on the admin side), so instead of a button
 * that pretends to delete, this explains what deleting involves and opens an
 * email to support, prefilled with the account's address.
 */
function DeleteAccount({ onDone }: { onDone: () => void }) {
	const { user } = useCurrentUser();
	const subject = encodeURIComponent("Delete my Gwani account");
	const body = encodeURIComponent(`Please delete the Gwani account for ${user?.email ?? "my email address"}.`);

	return (
		<div className="flex flex-col gap-5">
			<p className="text-b3 text-neutral-500 sm:text-b1">
				You can&apos;t delete your account from here yet — our team does it for you. Your personal details are erased and you lose access to your jobs and
				history. Jobs that are in progress, or payments still held in escrow, need to be settled first. This can&apos;t be undone.
			</p>
			<div className="mt-3 grid grid-cols-2 gap-3">
				<Button type="button" variant="outline" size="giant" onClick={onDone} className="h-12 w-full rounded-xl border-neutral-300 text-neutral-600">
					Cancel
				</Button>
				<Button asChild variant="destructive" size="giant" className="h-12 w-full rounded-xl">
					<a href={`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`}>Email support</a>
				</Button>
			</div>
		</div>
	);
}

export { DeleteAccount };
