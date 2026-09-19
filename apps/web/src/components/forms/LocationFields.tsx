"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@repo/ui/input";
import { Select } from "@repo/ui/select";
import { cn } from "@repo/ui/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { COUNTRIES, MOCK_STATES } from "@/lib/mock/locations";

interface LocationFieldProps {
	labelClassName?: string;
	fieldClassName?: string;
	itemClassName?: string;
}

/**
 * Country + state/city pair for any form with `country` and `state` fields
 * (inside a react-hook-form `<Form>`). Picking a country clears the state; the
 * state is a dropdown for countries with mock states and a free-text field for
 * the rest, and stays disabled until a country is chosen.
 */
function CountryField({ labelClassName, fieldClassName, itemClassName }: LocationFieldProps) {
	const { control, setValue } = useFormContext();

	return (
		<FormField
			control={control}
			name="country"
			render={({ field }) => (
				<FormItem className={itemClassName}>
					<FormLabel className={labelClassName}>Country</FormLabel>
					<FormControl>
						<Select
							className={fieldClassName}
							{...field}
							onChange={(e) => {
								field.onChange(e);
								setValue("state", "");
							}}
						>
							<option value="">Select country</option>
							{COUNTRIES.map(([code, name]) => (
								<option key={code} value={code} className="text-foreground">
									{name}
								</option>
							))}
						</Select>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

function StateField({ labelClassName, fieldClassName, itemClassName }: LocationFieldProps) {
	const { control } = useFormContext();
	const country = useWatch({ control, name: "country" }) as string;
	const states = MOCK_STATES[country];

	return (
		<FormField
			control={control}
			name="state"
			render={({ field }) => (
				<FormItem className={itemClassName}>
					<FormLabel className={labelClassName}>State/City</FormLabel>
					<FormControl>
						{states || !country ? (
							<Select
								className={cn(fieldClassName, "disabled:bg-transparent disabled:text-neutral-300")}
								disabled={!country}
								{...field}
							>
								<option value="">Select state</option>
								{states?.map((state) => (
									<option key={state} value={state} className="text-foreground">
										{state}
									</option>
								))}
							</Select>
						) : (
							<Input
								autoComplete="address-level1"
								placeholder="Enter state or city"
								className={fieldClassName}
								{...field}
							/>
						)}
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

export { CountryField, StateField };
