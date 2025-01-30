import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    const { email, password } = await req.json();
    console.log(email)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
        return NextResponse.json({ error: result.message }, { status: response.status });
    }

    const token = result.data.token;

    // Set token as HTTP-only cookie
    (await
        cookies()).set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
    });

    return NextResponse.json({ message: "Login successful", token });
}
