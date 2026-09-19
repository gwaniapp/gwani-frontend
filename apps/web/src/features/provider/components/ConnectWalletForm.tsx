"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { connectWalletSchema, type ConnectWalletValues } from "@/lib/validations/providerValidations";
import { generateMockPublicKey } from "@/lib/wallet";
import { useWalletFlowStore } from "@/lib/stores/walletFlowStore";

const ASSURANCES = [
	"Your wallet controls your funds",
	"Gwani never sees your private key",
	"Transactions are confirmed by your wallet",
];

/**
 * Wallet step of provider setup — either connect an existing Stellar wallet by
 * its public key, or generate one. Both just remember the key and hand over to
 * the connecting screen, which is where the (simulated) work happens.
 */
function ConnectWalletForm() {
	const router = useRouter();
	const setPublicKey = useWalletFlowStore((state) => state.setPublicKey);
	const form = useForm<ConnectWalletValues>({
		resolver: zodResolver(connectWalletSchema),
		defaultValues: { publicKey: "" },
	});

	function continueWith(publicKey: string) {
		setPublicKey(publicKey);
		router.push("/provider/wallet/connecting");
	}

	return (
		<>
			<div className="flex flex-col gap-2 md:gap-4">
				<h1 className="text-h4 font-medium text-foreground md:text-h1">Connect Your Wallet</h1>
				<p className="text-b1 text-neutral-400 md:max-w-136 md:text-xl md:font-normal">
					Connect an existing wallet to your provider account or generate a wallet.
				</p>
			</div>

			<div className="flex flex-col gap-7.5 md:gap-15">
				<Form {...form}>
					<form
						noValidate
						onSubmit={form.handleSubmit((values) => continueWith(values.publicKey))}
						className="flex flex-col gap-7.5 md:gap-15"
					>
						<FormField
							control={form.control}
							name="publicKey"
							render={({ field }) => (
								<FormItem className="md:gap-2.5">
									<FormLabel className="text-b4 md:text-xl md:font-normal">Enter Stellar public key</FormLabel>
									<FormControl>
										<Input
											autoComplete="off"
											autoCapitalize="characters"
											spellCheck={false}
											placeholder="Enter key to connect wallet"
											className="md:h-15.5"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" size="large" className="h-11 w-full md:h-15 md:text-btn-giant">
							Connect
						</Button>
					</form>
				</Form>

				<div className="flex flex-col gap-2">
					<p className="hidden text-xl text-foreground md:block">Don&apos;t have an existing wallet?</p>
					<Button
						type="button"
						size="large"
						className="h-11 w-full md:h-15 md:text-btn-giant"
						onClick={() => continueWith(generateMockPublicKey())}
					>
						Generate a wallet
					</Button>
				</div>
			</div>

			<div className="flex items-center gap-3 rounded-3xl bg-primary-100/30 px-4 py-5 md:w-fit md:gap-4 md:rounded-2xl md:pr-8 md:pl-5">
				<ShieldCheck className="size-6 shrink-0 text-primary-500" aria-hidden="true" />
				<ul className="flex list-disc flex-col gap-1 pl-4 text-[13px] leading-5 text-neutral-500 marker:text-neutral-400 md:pl-5 md:text-b1">
					{ASSURANCES.map((line) => (
						<li key={line}>{line}</li>
					))}
				</ul>
			</div>
		</>
	);
}

export { ConnectWalletForm };
