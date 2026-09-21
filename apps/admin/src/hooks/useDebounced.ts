import { useEffect, useState } from "react";

/** The value, once it has stopped changing for `ms` — so a search box doesn't fire a request per keystroke. */
export function useDebounced<T>(value: T, ms = 350) {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), ms);
		return () => clearTimeout(timer);
	}, [value, ms]);
	return debounced;
}
