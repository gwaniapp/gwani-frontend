import { AudienceCta } from "./AudienceCta";
import { Categories } from "./Categories";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { Navbar } from "./Navbar";
import { Solutions } from "./Solutions";

function LandingPage() {
	return (
		<>
			<Navbar />
			<Hero />
			<main className="flex flex-col gap-16 overflow-x-hidden pt-16 pb-16 sm:gap-20 sm:pt-20 sm:pb-20 lg:gap-[120px] lg:pt-[120px] lg:pb-[120px]">
				<Solutions />
				<Categories />
				<HowItWorks />
				<AudienceCta />
			</main>
			<Footer />
		</>
	);
}

export { LandingPage };
