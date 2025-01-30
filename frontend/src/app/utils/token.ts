'use server'
import { cookies } from "next/headers";

export async function SAPI_GetToken() {
    const cookie = await cookies();
    return await cookie.get('token')?.value;
}