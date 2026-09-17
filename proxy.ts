import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(req: NextRequest){
    const { pathname } = req.nextUrl;
    const isAuthRoute = [
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/reset-password",
        "/email-verified"
    ].some((p) => pathname.startsWith(p));


    const  data  = await auth.api.getSession({ headers: req.headers });
    const hasSession = Boolean(data?.session);

    if (hasSession && isAuthRoute) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (!hasSession && !isAuthRoute) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up|forgot-password|reset-password|assets).*)"]
}