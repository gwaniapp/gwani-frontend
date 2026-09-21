"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { toast } from "@repo/ui/sonner";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { useAvatar } from "@/features/settings/hooks/useAvatar";
import { initials } from "@/lib/format";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Profile photo with the camera badge. Picking a photo uploads it (see
 * `useAvatar` — real upload, but the photo is remembered and shown only in this
 * browser and on this screen until the backend links avatars to users) and
 * previews it straight away. Until there's a photo it's initials.
 */
function AvatarUpload({ className }: { className?: string }) {
	const { user } = useCurrentUser();
	const { savedUrl, upload } = useAvatar(user?.id);
	const inputRef = useRef<HTMLInputElement>(null);
	const [preview, setPreview] = useState<string | null>(null);

	// Don't leak the preview URL when it's replaced or the screen goes away.
	useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);

	function onPick(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Choose an image file (PNG, JPG or WebP).");
			return;
		}
		if (file.size > MAX_BYTES) {
			toast.error("That photo is over 5 MB. Choose a smaller one.");
			return;
		}
		const url = URL.createObjectURL(file);
		upload.mutate(file, {
			onSuccess: () => setPreview(url),
			onError: () => URL.revokeObjectURL(url),
		});
	}

	const photo = preview ?? savedUrl;

	return (
		<div className={cn("relative size-24 shrink-0 lg:size-25", className)}>
			<span
				aria-hidden="true"
				style={photo ? { backgroundImage: `url(${photo})` } : undefined}
				className={cn(
					"flex size-full items-center justify-center rounded-full bg-primary-100 bg-cover bg-center text-h4 text-primary-600 transition-opacity",
					upload.isPending && "opacity-60",
				)}
			>
				{!photo && user ? initials(user.first_name, user.last_name) : null}
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
			<input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onPick} className="sr-only" tabIndex={-1} aria-hidden="true" />
		</div>
	);
}

export { AvatarUpload };
