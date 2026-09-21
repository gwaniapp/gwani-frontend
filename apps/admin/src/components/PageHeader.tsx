/** A page's title (and one line under it), with room for actions on the right. Same scale as the Gwani dashboards' page titles. */
function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
	return (
		<div className="flex flex-wrap items-end justify-between gap-4">
			<div className="flex flex-col gap-1.5">
				<h1 className="text-xl font-medium text-foreground lg:text-h4 2xl:text-h3">{title}</h1>
				{description && <p className="text-b3 text-neutral-500 lg:text-b1">{description}</p>}
			</div>
			{actions}
		</div>
	);
}

export { PageHeader };
