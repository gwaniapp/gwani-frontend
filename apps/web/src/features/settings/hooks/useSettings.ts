import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { SESSION_KEY } from "@/features/auth/hooks/useSession";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { axiosAuth } from "@/lib/config/axios";
import type { ApiSuccessResponse, User } from "@/lib/api/types";
import type { ProfileValues } from "@/lib/validations/settingsValidations";

/**
 * `PATCH /users/me` `{ first_name, last_name }` (the only editable fields);
 * the returned user replaces the cached `GET /users/me`, so the header and
 * greeting update straight away.
 */
function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { action: "settings.update-profile" },
		mutationFn: async (values: ProfileValues) => {
			const { data } = await axiosAuth.patch<ApiSuccessResponse<User>>(apiRoutes.users.ME, {
				first_name: values.firstName,
				last_name: values.lastName,
			});
			return data.data;
		},
		onSuccess: (user) => {
			queryClient.setQueryData(SESSION_KEY, user);
			toast.success("Profile updated");
		},
		onError: (error) => toast.error(getApiErrorMessage(error)),
	});
}

export { useUpdateProfile };
