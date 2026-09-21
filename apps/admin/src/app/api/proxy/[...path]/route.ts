import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, buildProxyHeaders } from "@/lib/server/apiProxy";

// Bounds every proxied call — without this, a hung/slow upstream leaves the
// `fetch` below (and every layer above it: the browser's axios call, the
// TanStack Query mutation/query it backs) waiting indefinitely with nothing
// ever logged, which is exactly what a silent "stuck in loading" bug looks
// like. `axiosAuth`/`axiosPublic`'s own client-side timeout (see
// lib/config/axios.ts) is set longer than this on purpose, so THIS timeout
// fires first and the client gets a real, backend-shaped 504 body to show
// instead of a bare client-side timeout error.
const UPSTREAM_TIMEOUT_MS = 20_000;

async function forward(request: NextRequest, path: string[]) {
	const method = request.method;
	const targetPath = `/${path.join("/")}`;
	const targetUrl = `${API_BASE_URL}${targetPath}${request.nextUrl.search}`;
	const startedAt = Date.now();

	console.log(`[proxy] -> ${method} ${targetPath}`);

	try {
		const headers = new Headers();

		const contentType = request.headers.get("content-type");
		if (contentType) headers.set("content-type", contentType);

		// The user's own JWT — safe to pass through as-is since it's per-user,
		// not a shared secret.
		const authHeader = request.headers.get("authorization");
		if (authHeader) headers.set("authorization", authHeader);

		for (const [key, value] of Object.entries(buildProxyHeaders())) {
			headers.set(key, value);
		}

		const hasBody = !["GET", "HEAD"].includes(method);
		// Buffered rather than streamed straight through — a streamed request
		// body needs `duplex: "half"` on Node's fetch, which can be flaky
		// under Turbopack dev. Fine at this app's request sizes (JSON only).
		const body = hasBody ? await request.arrayBuffer() : undefined;

		const upstreamResponse = await fetch(targetUrl, {
			method,
			headers,
			body,
			signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
		});

		const responseBody = await upstreamResponse.arrayBuffer();
		const duration = Date.now() - startedAt;
		const logLine = `[proxy] <- ${upstreamResponse.status} ${method} ${targetPath} ${duration}ms`;
		if (upstreamResponse.status >= 500) console.error(logLine);
		else console.log(logLine);

		return new NextResponse(responseBody, {
			status: upstreamResponse.status,
			headers: {
				"content-type": upstreamResponse.headers.get("content-type") ?? "application/json",
			},
		});
	} catch (error) {
		const duration = Date.now() - startedAt;
		// `AbortSignal.timeout` rejects with a `TimeoutError` DOMException —
		// distinct from a genuine connection failure (DNS, ECONNREFUSED, the
		// backend being down entirely), worth telling apart in the logs and in
		// the error code the client sees.
		const timedOut = error instanceof Error && error.name === "TimeoutError";

		console.error(
			`[proxy] xx ${method} ${targetPath} ${duration}ms —`,
			timedOut ? `no response from upstream after ${UPSTREAM_TIMEOUT_MS}ms` : error,
		);

		return NextResponse.json(
			{
				statusCode: timedOut ? 504 : 502,
				error: timedOut ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNREACHABLE",
				message: timedOut
					? "The server took too long to respond. Please try again."
					: "Failed to reach the API. Please try again.",
				meta: {
					timestamp: new Date().toISOString(),
					path: targetPath,
					method,
					request_id: crypto.randomUUID(),
				},
			},
			{ status: timedOut ? 504 : 502 },
		);
	}
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
	const { path } = await params;
	return forward(request, path);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
	const { path } = await params;
	return forward(request, path);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
	const { path } = await params;
	return forward(request, path);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
	const { path } = await params;
	return forward(request, path);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
	const { path } = await params;
	return forward(request, path);
}
