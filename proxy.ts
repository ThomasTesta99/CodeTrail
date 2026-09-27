import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = [
    "/about",
    "/help",
    "/privacy",
];

const guestOnlyRoutes = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
];

const authFlowRoutes = [
    "/reset-password",
    "/email-verified",
];

const protectedRoutes = [
    "/",
    "/add-question",
    "/all-questions",
    "/profile",
    "/question",
];

const matchesRoute = (pathname: string, routes : string[]) => {
    return routes.some((route) => {
        if(route === "/"){
            return pathname === "/";
        }

        return (
            pathname === route || pathname.startsWith(`${route}/`)
        );
    });
}

export async function proxy(req: NextRequest){
    const { pathname } = req.nextUrl;
    
    const isGuestOnlyRoute = matchesRoute(pathname, guestOnlyRoutes);
    const isAuthFlowRoute = matchesRoute(pathname, authFlowRoutes);
    const isProtectedRoute = matchesRoute(pathname, protectedRoutes);
    const isPublicRoute = matchesRoute(pathname, publicRoutes);

    const data = await auth.api.getSession({headers: req.headers});
    const hasSession = Boolean(data?.session);

    if(hasSession && isGuestOnlyRoute){
        return NextResponse.redirect(
            new URL("/", req.url), 
        );
    }

    if(!hasSession && isProtectedRoute){
        return NextResponse.redirect(
            new URL("/sign-in", req.url)
        );
    }

    if(isPublicRoute || isAuthFlowRoute){
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};