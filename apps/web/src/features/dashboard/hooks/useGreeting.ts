import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function greetingForNow() {
	const hour = new Date().getHours();
	return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

/** "Good morning" by the visitor's local time; a neutral line on the server so hydration never mismatches. */
export function useGreeting() {
	return useSyncExternalStore(subscribe, greetingForNow, () => "Welcome back");
}
