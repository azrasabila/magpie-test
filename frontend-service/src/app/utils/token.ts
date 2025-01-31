'use server'
import { cookies } from "next/headers";

export async function SAPI_GetToken() {
    const cookie = await cookies();
    return await cookie.get('token')?.value;
}

export async function isAuthenticated(): Promise<boolean> {
    const cookie = await cookies();
    return !!cookie.get("token")?.value;
}

export async function logoutUser() {
    const cookie = await cookies();
    cookie.delete("token");
}