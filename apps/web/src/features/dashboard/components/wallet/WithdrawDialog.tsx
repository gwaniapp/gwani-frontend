"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Copy } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { toast } from "@repo/ui/sonner";
import { Textarea } from "@repo/ui/textarea";
import { JobDialog } from "@/features/dashboard/components/jobs/JobDialogParts";
import { useTransfer, walletErrorMessage } from "@/features/provider/hooks/useWallet";
import { formatAmount } from "@/lib/format";
import { sanitizeAmount } from "@/lib/validations/rules";
import { MEMO_MAX, transferSchema, type TransferValues } from "@/lib/validations/walletValidations";
import type { TransferResult } from "@/lib/api/types";

const EXPLORER_TX = "https://stellar.expert/explorer/testnet/tx/";

async function copy(text: string, done: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success(done);
	} catch {
		toast.error("Couldn't copy that");
	}
}

interface WithdrawProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	available: number;
	asset: string;
	ownAddress: string;
}

/**
 * Withdraw: send funds from the Gwani wallet to any Stellar address
 * (`POST /wallet/transfer`). Only what's on hand can be sent — escrowed money isn't in
 * the wallet yet. A custodial wallet is signed and submitted by the platform and answers
 * with the transaction hash; a *linked* (external) wallet can't be, so the platform hands
 * back an unsigned transaction to sign and submit with the person's own wallet.
 */
function WithdrawDialog(props: WithdrawProps) {
	const transfer = useTransfer();

	return (
		<JobDialog
			open={props.open}
			onOpenChange={props.onOpenChange}
			title="Withdraw"
			description="Send funds from your Gwani wallet to a Stellar address."
			blockDismiss={transfer.isPending}
		>
			{/* The body owns the form, the result and any error; the dialog unmounts it on close, so every opening starts clean. */}
			<WithdrawBody {...props} transfer={transfer} />
		</JobDialog>
	);
}

function WithdrawBody({ onOpenChange, available, asset, ownAddress, transfer }: WithdrawProps & { transfer: ReturnType<typeof useTransfer> }) {
	const [result, setResult] = useState<TransferResult | null>(null);
	const [error, setError] = useState("");
	const form = useForm<TransferValues>({
		resolver: zodResolver(transferSchema(available, ownAddress)),
		defaultValues: { destination: "", amount: "", memo: "" },
	});

	const close = onOpenChange;

	function submit(values: TransferValues) {
		setError("");
		transfer.mutate(
			{ destination: values.destination, amount: values.amount, ...(values.memo.trim() ? { memo: values.memo.trim() } : {}) },
			{ onSuccess: setResult, onError: (failure) => setError(walletErrorMessage(failure)) },
		);
	}

	return (
		<>
			<div className="flex flex-col gap-6 px-5 py-6 sm:px-10 sm:py-8">
				{result === null ? (
					<Form {...form}>
						<form noValidate onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-5">
							<p className="text-b3 text-neutral-500 sm:text-b1">
								Available to send: <span className="font-medium text-foreground">{formatAmount(available, asset)}</span>. Money held in escrow can&apos;t be sent.
							</p>

							<FormField
								control={form.control}
								name="destination"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Send to (Stellar address)</FormLabel>
										<FormControl>
											<Input
												autoComplete="off"
												autoCapitalize="characters"
												spellCheck={false}
												maxLength={56}
												placeholder="G…"
												{...field}
												onChange={(event) => field.onChange(event.target.value.replace(/\s/g, "").toUpperCase())}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="amount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Amount</FormLabel>
										<div className="flex gap-3">
											<FormControl>
												<Input
													inputMode="decimal"
													autoComplete="off"
													placeholder="0.00"
													className="min-w-0 flex-1"
													{...field}
													// Numbers only, up to 7 decimals — anything else is dropped as it's typed or pasted.
													onChange={(event) => field.onChange(sanitizeAmount(event.target.value))}
												/>
											</FormControl>
											<Button
												type="button"
												variant="outline"
												className="shrink-0"
												onClick={() => form.setValue("amount", String(available), { shouldValidate: true, shouldDirty: true })}
											>
												Max
											</Button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="memo"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Memo <span className="text-neutral-500">(optional — some exchanges need one)</span>
										</FormLabel>
										<FormControl>
											<Input autoComplete="off" maxLength={MEMO_MAX} placeholder="Add a memo" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{error && (
								<p role="alert" className="text-b3 text-danger-600">
									{error}
								</p>
							)}

							<div className="flex flex-col-reverse gap-3 pt-2 sm:grid sm:grid-cols-[1fr_1.3fr] sm:gap-4">
								<Button type="button" variant="outline" size="giant" className="w-full rounded-lg" disabled={transfer.isPending} onClick={() => close(false)}>
									Cancel
								</Button>
								<Button type="submit" size="giant" className="w-full rounded-lg" loading={transfer.isPending} disabled={available <= 0}>
									Send
								</Button>
							</div>
						</form>
					</Form>
				) : "tx_hash" in result ? (
					<div className="flex flex-col gap-5">
						<p role="status" className="flex items-center gap-2.5 rounded-xl bg-success-100 px-4 py-3 text-b3 text-[#0a7b4e] sm:text-b1">
							<CircleCheck className="size-5 shrink-0" aria-hidden="true" />
							Your transfer was sent to the network.
						</p>
						<div className="flex flex-col gap-1.5">
							<p className="text-b3 text-neutral-500">Transaction</p>
							<div className="flex items-center gap-2">
								<code className="min-w-0 flex-1 truncate text-b3 text-foreground">{result.tx_hash}</code>
								<Button type="button" variant="ghost" iconOnly aria-label="Copy transaction hash" onClick={() => void copy(result.tx_hash, "Transaction hash copied")}>
									<Copy className="size-4" aria-hidden="true" />
								</Button>
							</div>
							<a href={`${EXPLORER_TX}${result.tx_hash}`} target="_blank" rel="noreferrer" className="text-b3 text-primary-500 underline underline-offset-4">
								View on the Stellar explorer
							</a>
						</div>
						<Button type="button" size="giant" className="w-full rounded-lg" onClick={() => close(false)}>
							Done
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						<p className="text-b3 text-foreground sm:text-b1">
							{result.message ?? "Your wallet is linked, so Gwani can't sign for you. Sign and submit this transaction with your own wallet to finish the transfer."}
						</p>
						<Textarea readOnly value={result.xdr} rows={5} className="resize-none font-mono text-c1" aria-label="Unsigned transaction (XDR)" />
						<div className="flex flex-col-reverse gap-3 sm:grid sm:grid-cols-2 sm:gap-4">
							<Button type="button" variant="outline" size="giant" className="w-full rounded-lg" onClick={() => close(false)}>
								Close
							</Button>
							<Button type="button" size="giant" className="w-full rounded-lg" onClick={() => void copy(result.xdr, "Transaction copied")}>
								Copy transaction
							</Button>
						</div>
					</div>
				)}
			</div>
		</>
	);
}

export { WithdrawDialog };
