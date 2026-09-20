"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { toast } from "@repo/ui/sonner";
import { initials } from "@/lib/format";
import { MOCK_ACCOUNT } from "@/lib/mock/account";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Profile photo with the camera badge. Picking a photo previews it here only —
 * nothing is uploaded (the real flow is `POST /files/request-upload` with
 * purpose `AVATAR`, then a PUT to the returned URL). Until there's a photo it's
 * initials, since the mock's 3D avatar isn't an asset.
 */
function AvatarUpload({ className }: { className?: string }) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [photo, setPhoto] = useState<string | null>(null);

	// Don't leak the preview URL when it's replaced or the screen goes away.
	useEffect(() => () => (photo ? URL.revokeObjectURL(photo) : undefined), [photo]);

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
		setPhoto(URL.createObjectURL(file));
		toast.success("Profile photo updated");
	}

	return (
		<div className={cn("relative size-24 shrink-0 lg:size-25", className)}>
			<span
				aria-hidden="true"
				style={photo ? { backgroundImage: `url(${photo})` } : undefined}
				className="flex size-full items-center justify-center rounded-full bg-primary-100 bg-cover bg-center text-h4 text-primary-600"
			>
				{!photo && initials(MOCK_ACCOUNT.firstName, MOCK_ACCOUNT.lastName)}
			</span>
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				aria-label="Change profile photo"
				className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border-2 border-white bg-primary-500 text-white outline-none transition-colors hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-300"
			>
				<Camera className="size-4" aria-hidden="true" />
			</button>
			<input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onPick} className="sr-only" tabIndex={-1} aria-hidden="true" />
		</div>
	);
}

export { AvatarUpload };
