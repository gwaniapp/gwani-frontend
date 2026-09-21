"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { connectWalletSchema, type ConnectWalletValues } from "@/lib/validations/providerValidations";
import { toast } from "@repo/ui/sonner";
import { walletErrorMessage } from "@/features/provider/hooks/useWallet";
import { getFreighterAddress } from "@/lib/freighter";
import { useWalletFlowStore, type WalletMode } from "@/lib/stores/walletFlowStore";

const ASSURANCES = [
	"Your wallet controls your funds",
	"Gwani never sees your private key",
	"Transactions are confirmed by your wallet",
];

/**
 * Wallet step of provider setup — either link an existing Stellar wallet (its
 * public key, proven with a signature from the Freighter extension) or generate
 * the platform's custodial one. Both just remember the choice and hand over to
 * the connecting screen, which does the real work (see `useConnectWallet`).
 */
function ConnectWalletForm() {
	const router = useRouter();
	const startFlow = useWalletFlowStore((state) => state.start);
	const form = useForm<ConnectWalletValues>({
		resolver: zodResolver(connectWalletSchema),
		defaultValues: { publicKey: "" },
	});

	function continueWith(mode: WalletMode, publicKey = "") {
		startFlow(mode, publicKey);
		router.push("/provider/wallet/connecting");
	}

	// Fills the field from the account Freighter is using, so nobody has to copy an address by hand.
	async function fillFromFreighter() {
		try {
			form.setValue("publicKey", await getFreighterAddress(), { shouldValidate: true });
		} catch (error) {
			toast.error(walletErrorMessage(error));
		}
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
						onSubmit={form.handleSubmit((values) => continueWith("link", values.publicKey))}
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
											maxLength={56}
											{...field}
											onChange={(event) => field.onChange(event.target.value.replace(/\s/g, "").toUpperCase())}
										/>
									</FormControl>
									<button
										type="button"
										onClick={fillFromFreighter}
										className="self-start text-b3 text-primary-500 underline-offset-4 outline-none hover:underline focus-visible:underline md:text-b1"
									>
										Use my Freighter account
									</button>
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
						onClick={() => continueWith("generate")}
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
