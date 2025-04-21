import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// List of public routes that don't require authentication
const publicRoutes = ["/", "/sign-in", "/sign-up", "/api/webhook"];

// Special routes that have custom redirect behavior
const specialRoutes = ["/flashcards", "/dashboard", "/profile"];

// Create a route matcher for public routes
const isPublicRoute = createRouteMatcher(publicRoutes);

// Configure middleware to enforce authentication with AI capabilities
export default clerkMiddleware(async (auth, req) => {
	const { userId } = await auth();
	const path = req.nextUrl.pathname;

	// Store the original URL for redirection after authentication
	const returnToUrl = req.url;

	// Allow access to public routes and static assets
	if (isPublicRoute(req) || path.startsWith("/api/public")) {
		return NextResponse.next();
	}

	// If the user is not signed in and attempting to access a private route,
	// redirect them to the sign-in page with return_to parameter
	if (!userId) {
		// Create a sign-in URL with a return_to parameter for after authentication
		const signInUrl = new URL("/sign-in", req.url);

		// For special routes, add a redirect parameter to improve user experience
		if (specialRoutes.some((route) => path.includes(route))) {
			signInUrl.searchParams.set("redirect_url", returnToUrl);
		}

		// Add a source parameter to track where the user came from
		signInUrl.searchParams.set("source", "middleware_redirect");

		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		// Skip Next.js internals but match all pages and API routes
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
};
