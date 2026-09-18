// Ambient module declarations for static asset imports inside this package.
// Next.js (the only consumer today) processes these into a StaticImageData
// object at build time; typed here just for this package's own tsc pass.
declare module "*.svg" {
	const content: { src: string; height: number; width: number };
	export default content;
}

declare module "*.png" {
	const content: { src: string; height: number; width: number };
	export default content;
}
