"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { TagInput } from "@repo/ui/tag-input";
import { useSkills } from "@/features/provider/hooks/useProviderProfile";
import { SERVICE_CATEGORIES } from "@/lib/mock/providerOptions";

interface SkillsFieldProps {
	labelClassName?: string;
	itemClassName?: string;
	/** Extra classes for the tag box (heights differ between the registration form and Settings). */
	tagClassName?: string;
}

/**
 * "What skill/service(s) do you provide?" — picks from the backend's real
 * skill catalog (`GET /skills`); the backend only accepts catalog skills, so
 * typed text is only accepted when it matches one — type a few letters, the first
 * match is highlighted, Enter adds it, and you can keep going. Inside a form that
 * has `skills` (names) and `category` fields; the category, when chosen, only
 * moves that group's skills to the top of the list.
 */
function SkillsField({ labelClassName, itemClassName, tagClassName }: SkillsFieldProps) {
	const { control } = useFormContext();
	const category = useWatch({ control, name: "category" }) as string;
	const catalog = useSkills();

	const allNames = (catalog.data ?? []).map((skill) => skill.name);
	// The category puts its skills first; it never *removes* the others — a provider can always search the whole list.
	const groupNames = SERVICE_CATEGORIES.find((group) => group.value === category)?.skills;
	const inGroup = new Set((groupNames ?? []).map((name) => name.toLowerCase()));
	const suggestions = groupNames
		? [...allNames.filter((name) => inGroup.has(name.toLowerCase())), ...allNames.filter((name) => !inGroup.has(name.toLowerCase()))]
		: allNames;

	return (
		<FormField
			control={control}
			name="skills"
			render={({ field }) => (
				<FormItem className={itemClassName}>
					<FormLabel className={labelClassName}>What skill/service(s) do you provide?</FormLabel>
					<FormControl>
						<TagInput
							name={field.name}
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							suggestions={suggestions}
							allowCustom={false}
							maxTags={20}
							disabled={catalog.isPending}
							placeholder={catalog.isPending ? "Loading skills…" : "Type a skill and press Enter"}
							noMatchText="No skill matches that. Try a different word, or pick one from the list."
							className={tagClassName}
						/>
					</FormControl>
					{catalog.isError && (
						<p role="alert" className="text-c1 text-danger-600">
							We couldn&apos;t load the list of skills.{" "}
							<button type="button" onClick={() => void catalog.refetch()} className="font-medium underline underline-offset-4">
								Try again
							</button>
						</p>
					)}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

export { SkillsField };
