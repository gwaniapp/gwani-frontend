"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { toast } from "@repo/ui/sonner";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { useAvatar } from "@/features/settings/hooks/useAvatar";
import { initials } from "@/lib/format";

const MAX_BYTES = 15 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

/**
 * Profile photo with the camera badge. Picking a photo uploads it
 * (`useAvatar`: the server re-compresses it and keeps it on the user, so it
 * shows on every device and in the header) and it appears as soon as the upload
 * answers. Until there's a photo it's initials.
 */
function AvatarUpload({ className }: { className?: string }) {
	const { user } = useCurrentUser();
	const { savedUrl, upload } = useAvatar();
	const inputRef = useRef<HTMLInputElement>(null);

	function onPick(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		if (!ACCEPT.split(",").includes(file.type)) {
			toast.error("Choose a PNG, JPG, WebP or GIF image.");
			return;
		}
		if (file.size > MAX_BYTES) {
			toast.error("That photo is over 15 MB. Choose a smaller one.");
			return;
		}
		upload.mutate(file);
	}

	return (
		<div className={cn("relative size-24 shrink-0 lg:size-25", className)}>
			<span
				aria-hidden="true"
				style={savedUrl ? { backgroundImage: `url(${savedUrl})` } : undefined}
				className={cn(
					"flex size-full items-center justify-center rounded-full bg-primary-100 bg-cover bg-center text-h4 text-primary-600 transition-opacity",
					upload.isPending && "opacity-60",
				)}
			>
				{!savedUrl && user ? initials(user.first_name, user.last_name) : null}
			</span>
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				disabled={upload.isPending}
				aria-label={upload.isPending ? "Uploading photo" : "Change profile photo"}
				className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border-2 border-white bg-primary-500 text-white outline-none transition-colors hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-300 disabled:opacity-70"
			>
				<Camera className="size-4" aria-hidden="true" />
			</button>
			<input ref={inputRef} type="file" accept={ACCEPT} onChange={onPick} className="sr-only" tabIndex={-1} aria-hidden="true" />
		</div>
	);
}

export { AvatarUpload };
