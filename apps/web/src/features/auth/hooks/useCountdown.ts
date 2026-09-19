import { useCallback, useEffect, useState } from "react";

/** Counts down from `seconds` to 0, one tick per second; `restart` starts it over. */
function useCountdown(seconds: number) {
	const [secondsLeft, setSecondsLeft] = useState(seconds);

	useEffect(() => {
		if (secondsLeft <= 0) return;
		const timer = setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
		return () => clearTimeout(timer);
	}, [secondsLeft]);

	const restart = useCallback(() => setSecondsLeft(seconds), [seconds]);

	return { secondsLeft, restart };
}

/** 45 -> "00:45" */
function formatCountdown(totalSeconds: number) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export { useCountdown, formatCountdown };
