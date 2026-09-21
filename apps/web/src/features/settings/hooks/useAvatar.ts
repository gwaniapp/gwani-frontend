import { useState } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { axiosAuth } from "@/lib/config/axios";
import type { ApiSuccessResponse, FileDownloadUrlData, FileUploadUrlData } from "@/lib/api/types";

const storageKey = (userId: string) => `gwani-avatar-${userId}`;

function readStoredId(userId: string | undefined) {
	if (!userId || typeof window === "undefined") return null;
	try {
		return localStorage.getItem(storageKey(userId));
	} catch {
		// Storage unavailable (private mode): the photo just won't be remembered.
		return null;
	}
}

/**
 * Profile photo, as far as the backend allows.
 *
 * **Upload is real:** `POST /files/request-upload` `{ content_type,
 * size_bytes, purpose: "AVATAR" }` returns a presigned storage URL, and the
 * photo is PUT straight to it (not through the API proxy). **Showing it back is
 * a workaround:** nothing on the user or the provider profile points at an
 * avatar file, so the file id is remembered in this browser (localStorage, per
 * user) and turned into an image with `GET /files/{id}/download-url`. That means
 * the photo shows only on the device that uploaded it, and only on this
 * screen. Needs the storage bucket to allow browser uploads (CORS) — unverified.
 * **The live backend doesn't have the route yet** (`POST /api/v1/files/request-upload`
 * answers 404 although the spec documents it), so an upload currently fails with
 * a plain "not available yet" message.
 */
function useAvatar(userId: string | undefined) {
	const queryClient = useQueryClient();
	// Set after an upload in this session; otherwise the id remembered from an earlier one.
	const [uploadedId, setFileId] = useState<string | null>(null);
	const fileId = uploadedId ?? readStoredId(userId);

	const saved = useQuery({
		queryKey: ["avatar", fileId],
		enabled: Boolean(fileId),
		staleTime: 10 * 60 * 1000,
		retry: false,
		queryFn: async () => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<FileDownloadUrlData>>(apiRoutes.files.byIdDownloadUrl(fileId as string));
			return data.data.download_url;
		},
	});

	const upload = useMutation({
		meta: { action: "settings.upload-avatar" },
		mutationFn: async (file: File) => {
			const { data } = await axiosAuth.post<ApiSuccessResponse<FileUploadUrlData>>(apiRoutes.files.REQUEST_UPLOAD, {
				content_type: file.type,
				size_bytes: file.size,
				purpose: "AVATAR",
			});
			const target = data.data;
			// Straight to storage — the URL is presigned, so no auth header, and it doesn't go through our proxy.
			const put = await fetch(target.upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
			if (!put.ok) throw new Error(`Storage answered ${put.status}`);
			return target.file_id;
		},
		onSuccess: (id) => {
			if (userId) {
				try {
					localStorage.setItem(storageKey(userId), id);
				} catch {
					// See above.
				}
			}
			setFileId(id);
			void queryClient.invalidateQueries({ queryKey: ["avatar"] });
			toast.success("Profile photo updated");
		},
		onError: (error) => {
			toast.error(
				isAxiosError(error) && error.response?.status === 404
					? "Profile photos aren't available on the server yet. Please try again later."
					: getApiErrorMessage(error, "We couldn't upload that photo. Please try again."),
			);
		},
	});

	return { savedUrl: saved.data ?? null, upload };
}

export { useAvatar };
