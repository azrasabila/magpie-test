import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const isLoginPage = req.nextUrl.pathname === "/";

    if (!token && !isLoginPage) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (token && isLoginPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
