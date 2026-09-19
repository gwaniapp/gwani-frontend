import Link from "next/link";
import { ArrowRight, User } from "lucide-react";

const ROLES = [
	{ role: "client", title: "Client", description: "Post jobs and hire" },
	{ role: "provider", title: "Provider", description: "Work and get paid" },
] as const;

function RoleSelection() {
	return (
		<>
			<div className="flex flex-col gap-2 md:gap-4">
				<h1 className="text-h4 font-medium text-foreground md:text-h2">Welcome to Gwani</h1>
				<p className="text-b3 text-neutral-400 md:text-xl md:font-normal">
					Which best describes you?
				</p>
			</div>

			<ul className="flex flex-col gap-7.5">
				{ROLES.map(({ role, title, description }) => (
					<li key={role}>
						<Link
							href={`/auth/sign-up/details?role=${role}`}
							className="group flex items-center gap-5 rounded-2xl border border-border bg-white py-7.5 pr-6 pl-5 outline-none transition-shadow hover:border-transparent hover:shadow-[0_8px_30px_rgb(0_0_0/0.08)] focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary-300"
						>
							<span className="flex size-15 shrink-0 items-center justify-center rounded-full bg-primary-100/50 text-primary-500 md:size-25">
								<User className="size-8 fill-current md:size-14" strokeWidth={1.5} aria-hidden="true" />
							</span>
							<span className="flex min-w-0 flex-1 flex-col gap-1">
								<span className="text-xl font-medium text-foreground">{title}</span>
								<span className="text-b3 text-foreground">{description}</span>
							</span>
							<ArrowRight
								className="size-5 shrink-0 text-foreground transition-transform group-hover:translate-x-0.5 md:size-6"
								aria-hidden="true"
							/>
						</Link>
					</li>
				))}
			</ul>

			<p className="text-center text-b3 text-foreground md:text-b1">
				Already have an account?{" "}
				<Link
					href="/auth/sign-in"
					className="font-medium text-primary-500 underline-offset-4 hover:underline"
				>
					Sign in
				</Link>
			</p>
		</>
	);
}

export { RoleSelection };
