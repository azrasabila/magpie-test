import { I_BaseResponse } from "../hooks/base";
import { redirect } from "next/navigation";
import { SAPI_GetToken } from "../utils/token";

export interface I_LendingDeleteResponse {
    message: string
}

export async function deleteLending(id: number): Promise<I_LendingDeleteResponse | null> {
    const token = await SAPI_GetToken()

    if (!token) {
        redirect('/')
    }

    const response: I_BaseResponse<I_LendingDeleteResponse> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lendings/${id}`, {
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
