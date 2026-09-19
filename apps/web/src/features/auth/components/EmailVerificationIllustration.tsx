/** Hand-drawn stand-in for the design's envelope illustration — swap for the real asset when it's exported. */
function EmailVerificationIllustration() {
	return (
		<span className="flex size-36 shrink-0 items-center justify-center rounded-full bg-primary-100/40">
			<svg viewBox="0 0 100 100" className="size-28" aria-hidden="true">
				<path d="M26 30 50 8l24 22Z" className="fill-primary-500" />
				<path d="M10 44 30 24v36l-20 4Z" className="fill-warning-400" />
				<path d="M90 44 70 24v36l20 4Z" className="fill-warning-400" />
				<path d="M26 26h48v30L50 72 26 56Z" className="fill-white" />
				<circle cx="50" cy="42" r="13" className="fill-primary-500" />
				<path
					d="m43 42.5 5.5 5.5 9-11"
					className="fill-none stroke-white"
					strokeWidth="3.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path d="M10 44Q50 90 90 44v46q0 2-2 2H12q-2 0-2-2Z" className="fill-primary-500" />
			</svg>
		</span>
	);
}

export { EmailVerificationIllustration };
