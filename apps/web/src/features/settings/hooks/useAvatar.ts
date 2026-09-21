import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { axiosAuth } from "@/lib/config/axios";
import type { ApiSuccessResponse } from "@/lib/api/types";

const PROFILE_PICTURE_KEY = ["profile-picture"];

/**
 * `GET /users/me/profile-picture` — a fresh 7-day presigned URL for the signed-in
 * user's picture, or `null` when they haven't uploaded one (that's a 404, not an
 * error). Used by the header avatar and Settings.
 */
function useProfilePicture() {
	return useQuery({
		queryKey: PROFILE_PICTURE_KEY,
		staleTime: 30 * 60 * 1000,
		retry: false,
		queryFn: async (): Promise<string | null> => {
			try {
				const { data } = await axiosAuth.get<ApiSuccessResponse<{ download_url: string }>>(apiRoutes.users.PROFILE_PICTURE);
				return data.data.download_url;
			} catch (error) {
				if (isAxiosError(error) && error.response?.status === 404) return null;
				throw error;
			}
		},
	});
}

/**
 * Profile photo: `POST /users/me/profile-picture` (multipart, field `file`; PNG,
 * JPEG, WebP or GIF up to 15 MB — the server re-compresses it under 1 MB, stores
 * it and remembers it on the user; replacing deletes the old one) → `{
 * profile_picture_key, download_url }`. The URL is put straight into the query
 * cache so every avatar updates at once. The `Content-Type` is set explicitly
 * because the shared axios instance defaults to JSON, which would make axios
 * flatten the form data.
 */
function useAvatar() {
	const queryClient = useQueryClient();
	const saved = useProfilePicture();

	const upload = useMutation({
		meta: { action: "settings.upload-avatar" },
		mutationFn: async (file: File) => {
			const form = new FormData();
			form.append("file", file);
			const { data } = await axiosAuth.post<ApiSuccessResponse<{ profile_picture_key: string; download_url: string }>>(apiRoutes.users.PROFILE_PICTURE, form, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			return data.data.download_url;
		},
		onSuccess: (url) => {
			queryClient.setQueryData(PROFILE_PICTURE_KEY, url);
			toast.success("Profile photo updated");
		},
		onError: (error) => {
			toast.error(
				isAxiosError(error) && error.response?.status === 400
					? "That file couldn't be used. Choose a PNG, JPG, WebP or GIF image under 15 MB."
					: getApiErrorMessage(error, "We couldn't upload that photo. Please try again."),
			);
		},
	});

	return { savedUrl: saved.data ?? null, upload };
}

export { PROFILE_PICTURE_KEY, useAvatar, useProfilePicture };
