"use client";

import * as React from "react";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "./dialog";
import {
	Drawer,
	DrawerTrigger,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
} from "./drawer";

/**
 * "Modal on desktop, drawer on mobile" — several flows want exactly this
 * (Change PIN, Change Password, the mobile Account page's info sheets,
 * Send/Pay's PIN confirmation). Previously all built on `Dialog`'s own
 * `mobileSheet` prop, which only ever *looked* like a bottom sheet below
 * `sm` via CSS on a plain Radix `Dialog` (a modal) — not a real drawer.
 * Reported live (a mobile screenshot: Chrome's own autofill bar visible,
 * no on-screen keyboard, the focused input just not responding) tracing
 * back to that gap — a modal was never built for a bottom sheet's real
 * mobile interactions (the on-screen keyboard chief among them; see
 * `DrawerContent`'s own note on why `vaul`, what shadcn's actual `Drawer`
 * uses, exists specifically for this).
 *
 * `ResponsiveDialog`/`ResponsiveDialogTrigger`/`ResponsiveDialogContent`/
 * `ResponsiveDialogHeader`/`ResponsiveDialogTitle`/
 * `ResponsiveDialogDescription` render the real `Drawer` (vaul) below `sm`
 * and the real `Dialog` (Radix) at `sm` and up, sharing one open/close
 * state via context so a caller's own code never has to branch on
 * viewport itself — same call shape as `Dialog`'s own compound components,
 * just swapping which family actually mounts.
 */
const ResponsiveDialogContext = React.createContext<{ isDesktop: boolean }>({
	isDesktop: true,
});

/** `sm` breakpoint, matching every other responsive class in this design
 * system. One `matchMedia` per mount plus a live listener — deciding which
 * primitive family to render doesn't need to be instantaneous, but a
 * rotated/resized device mid-session should still end up in the right one
 * next time this opens. Defaults to `true` (desktop) before mount so SSR/
 * first paint doesn't have to guess — `Dialog`'s own centered treatment is
 * the safer default to flash briefly, since a `Drawer` anchored off-screen
 * would look broken if the media query hasn't evaluated yet. */
function useIsDesktop() {
	const [isDesktop, setIsDesktop] = React.useState(true);

	React.useEffect(() => {
		const mql = window.matchMedia("(min-width: 640px)");
		setIsDesktop(mql.matches);
		function handleChange(e: MediaQueryListEvent) {
			setIsDesktop(e.matches);
		}
		mql.addEventListener("change", handleChange);
		return () => mql.removeEventListener("change", handleChange);
	}, []);

	return isDesktop;
}

function ResponsiveDialog({ children, ...props }: React.ComponentProps<typeof Dialog>) {
	const isDesktop = useIsDesktop();
	const Root = isDesktop ? Dialog : Drawer;

	return (
		<ResponsiveDialogContext.Provider value={{ isDesktop }}>
			<Root {...props}>{children}</Root>
		</ResponsiveDialogContext.Provider>
	);
}

function ResponsiveDialogTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
	const { isDesktop } = React.useContext(ResponsiveDialogContext);
	return isDesktop ? <DialogTrigger {...props} /> : <DrawerTrigger {...props} />;
}

interface ResponsiveDialogContentProps extends React.ComponentProps<typeof DialogContent> {
	className?: string;
}

function ResponsiveDialogContent({ children, ...props }: ResponsiveDialogContentProps) {
	const { isDesktop } = React.useContext(ResponsiveDialogContext);
	// `mobileSheet` on the desktop branch isn't a mistake — its mobile-only
	// CSS/behavior never actually renders here (this only mounts `Dialog` at
	// all when `isDesktop` is true), and its `sm:` styles are exactly the
	// plain centered dialog every one of these flows already looked like on
	// desktop, so reusing it keeps that appearance identical.
	return isDesktop ? (
		<DialogContent mobileSheet {...props}>
			{children}
		</DialogContent>
	) : (
		<DrawerContent className={props.className}>{children}</DrawerContent>
	);
}

function ResponsiveDialogHeader(props: React.ComponentProps<typeof DialogHeader>) {
	const { isDesktop } = React.useContext(ResponsiveDialogContext);
	return isDesktop ? <DialogHeader {...props} /> : <DrawerHeader {...props} />;
}

function ResponsiveDialogTitle(props: React.ComponentProps<typeof DialogTitle>) {
	const { isDesktop } = React.useContext(ResponsiveDialogContext);
	return isDesktop ? <DialogTitle {...props} /> : <DrawerTitle {...props} />;
}

function ResponsiveDialogDescription(props: React.ComponentProps<typeof DialogDescription>) {
	const { isDesktop } = React.useContext(ResponsiveDialogContext);
	return isDesktop ? <DialogDescription {...props} /> : <DrawerDescription {...props} />;
}

export {
	ResponsiveDialog,
	ResponsiveDialogTrigger,
	ResponsiveDialogContent,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogDescription,
};
