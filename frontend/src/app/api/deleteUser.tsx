import { I_BaseResponse } from "../hooks/base";
import { redirect } from "next/navigation";
import { SAPI_GetToken } from "../utils/token";

export interface I_UserDeleteResponse {
    message: string
}

export async function deleteUser(id: number): Promise<I_UserDeleteResponse | null> {
    const token = await SAPI_GetToken()

    if (!token) {
        redirect('/')
    }

    const response: I_BaseResponse<I_UserDeleteResponse> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    })
        .then((res) => res.json())
        .then((res) => res)
        .catch((err) => {
            return err
        });

    if (!response.success) {
        return null;
    }

    return response.data;
}
