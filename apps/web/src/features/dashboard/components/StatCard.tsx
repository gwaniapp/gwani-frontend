import type { LucideIcon } from "lucide-react";

interface StatCardProps {
	label: string;
	value: string;
	icon: LucideIcon;
}

function StatCard({ label, value, icon: Icon }: StatCardProps) {
	return (
		<div className="flex items-center justify-between gap-3 rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgb(0_0_0/0.06)] lg:px-5 lg:py-7">
			<div className="flex flex-col gap-2 lg:gap-3">
				{/* 15px on desktop so "Pending Payments" stays on one line in a four-up row, even with a classic scrollbar taking width. */}
				<p className="text-b1 whitespace-nowrap text-foreground lg:text-[15px]">{label}</p>
				<p className="text-h3 text-foreground lg:text-h2">{value}</p>
			</div>
			<span className="flex size-15 shrink-0 items-center justify-center rounded-full bg-primary-100/50 text-primary-500">
				<Icon className="size-6" aria-hidden="true" />
			</span>
		</div>
	);
}

export { StatCard };
