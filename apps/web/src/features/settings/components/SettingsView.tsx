"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { WalletAddressCard } from "@/components/WalletAddressCard";
import { AccountMenu } from "@/features/settings/components/AccountMenu";
import { AvatarUpload } from "@/features/settings/components/AvatarUpload";
import { DeleteAccount } from "@/features/settings/components/DeleteAccount";
import { PasswordForm } from "@/features/settings/components/PasswordForm";
import { PersonalInfoForm } from "@/features/settings/components/PersonalInfoForm";
import { ProviderInfoForm } from "@/features/settings/components/ProviderInfoForm";
import { SettingsSheet } from "@/features/settings/components/SettingsSheet";
import { DASHBOARD_CONFIG, type DashboardRole } from "@/features/dashboard/config";
import type { PanelId, SheetId } from "@/features/settings/types";
import { isWalletSetupIncomplete, useWallet } from "@/features/provider/hooks/useWallet";

const SHEETS: Record<SheetId, { title: string; description: string; danger?: boolean }> = {
	personal: { title: "Personal Information", description: "Edit your name." },
	provider: { title: "Provider Information", description: "Edit the details of the service you provide." },
	password: { title: "Change Password", description: "We'll email you a code so you can set a new password." },
	delete: { title: "Delete Account", description: "Our team erases your account and personal data.", danger: true },
};

/** Items in the desktop sub-nav. `panel` ones show inline (a page); `sheet` ones (Delete Account) open a modal over the current panel. */
const NAV: Array<{ label: string; providerOnly?: boolean; danger?: boolean } & ({ panel: PanelId } | { sheet: SheetId })> = [
	{ label: "Personal Information", panel: "personal" },
	{ label: "Provider Information", panel: "provider", providerOnly: true },
	{ label: "Change Password", panel: "password" },
	{ label: "Delete Account", sheet: "delete", danger: true },
];

/** Avatar with its camera badge, and the wallet card under it — the top of the mobile page and of the desktop Personal/Provider panels. */
function AccountHeader({ centered }: { centered?: boolean }) {
	const wallet = useWallet();

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<div className={cn("flex", centered && "justify-center lg:justify-start")}>
				<AvatarUpload />
			</div>
			{wallet.data ? <WalletAddressCard publicKey={wallet.data.public_key} verified={!isWalletSetupIncomplete(wallet.data)} /> : wallet.isPending ? <WalletAddressCard publicKey="" ready={false} /> : null}
		</div>
	);
}

/**
 * Account settings, from the mocks, trimmed to what the backend supports: below
 * `lg`, an "Account" page (avatar, wallet, a menu list) where each item opens a
 * drawer; from `lg`, a sub-nav with an inline panel for Personal Information,
 * Provider Information and Change Password (a normal page on desktop, a drawer on
 * mobile), and Delete Account opening as a modal. "Provider Information" is
 * providers' only. The same forms serve both looks (`layout="panel" | "sheet"`).
 *
 * Change Password runs the backend's emailed-code reset; Delete Account is an email
 * to support (no self-service endpoint); the mock's "Account Settings" panel
 * (notification switches) is gone — the backend has no preferences.
 */
function SettingsView({ role }: { role: DashboardRole }) {
	const isProvider = role === "provider";
	const [panel, setPanel] = useState<PanelId>("personal");
	// `sheet` keeps its last value while closing, so the content doesn't vanish mid-animation.
	const [sheet, setSheet] = useState<SheetId>("personal");
	const [sheetOpen, setSheetOpen] = useState(false);

	function openSheet(id: SheetId) {
		setSheet(id);
		setSheetOpen(true);
	}
	const closeSheet = () => setSheetOpen(false);

	const items = NAV.filter((item) => isProvider || !item.providerOnly);
	const meta = SHEETS[sheet];

	return (
		<div className="flex flex-col gap-6 lg:flex-row lg:gap-0">
			{/* Mobile: the Account page. */}
			<div className="flex flex-col gap-6 lg:hidden">
				<div className="relative flex items-center justify-center">
					<Link
						href={DASHBOARD_CONFIG[role].home}
						aria-label="Back to dashboard"
						className="absolute left-0 flex size-10 items-center justify-center rounded-lg text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
					>
						<ChevronLeft className="size-6" aria-hidden="true" />
					</Link>
					<h1 className="text-xl font-medium text-foreground">Account</h1>
				</div>
				<AccountHeader centered />
				<AccountMenu isProvider={isProvider} onOpen={openSheet} />
			</div>

			{/* Desktop: sub-nav + panel. */}
			<nav aria-label="Settings" className="hidden w-53 shrink-0 flex-col gap-2 self-stretch border-r border-border pr-5 lg:flex">
				{items.map((item) => {
					const active = "panel" in item && item.panel === panel;
					return (
						<button
							key={item.label}
							type="button"
							aria-current={active ? "page" : undefined}
							onClick={() => ("panel" in item ? setPanel(item.panel) : openSheet(item.sheet))}
							className={cn(
								"flex h-12 w-full items-center rounded-lg px-4.5 text-left text-b3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-300",
								active ? "bg-primary-100/60 text-primary-600" : item.danger ? "text-danger-600 hover:bg-danger-50" : "text-neutral-500 hover:bg-muted",
							)}
						>
							{item.label}
						</button>
					);
				})}
			</nav>

			<div className="hidden min-w-0 flex-1 flex-col gap-8 lg:flex lg:pl-5">
				<h1 className="sr-only">Settings</h1>
				{panel === "personal" && (
					<>
						<AccountHeader />
						<PersonalInfoForm layout="panel" />
					</>
				)}
				{panel === "provider" && isProvider && (
					<>
						<AccountHeader />
						<ProviderInfoForm layout="panel" />
					</>
				)}
				{panel === "password" && (
					<section aria-labelledby="password-heading" className="flex max-w-3xl flex-col gap-6">
						<div className="flex flex-col gap-1">
							<h2 id="password-heading" className="text-xl font-medium text-foreground">
								Change Password
							</h2>
							<p className="text-b3 text-neutral-500 xl:text-b1">We&apos;ll email you a code so you can set a new password.</p>
						</div>
						<PasswordForm layout="panel" />
					</section>
				)}
			</div>

			<SettingsSheet open={sheetOpen} onOpenChange={setSheetOpen} title={meta.title} description={meta.description} danger={meta.danger}>
				{sheet === "personal" && <PersonalInfoForm layout="sheet" onDone={closeSheet} />}
				{sheet === "provider" && <ProviderInfoForm layout="sheet" onDone={closeSheet} />}
				{sheet === "password" && <PasswordForm onDone={closeSheet} />}
				{sheet === "delete" && <DeleteAccount onDone={closeSheet} />}
			</SettingsSheet>
		</div>
	);
}

export { SettingsView };
