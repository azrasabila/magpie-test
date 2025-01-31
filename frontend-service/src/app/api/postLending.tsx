import { I_BaseListResponse, I_ResponseListData } from "../hooks/base";
import { redirect } from "next/navigation";
import { SAPI_GetToken } from "../utils/token";
import { I_Lending } from "./getLendingList";

export interface I_LendingAdd {
    bookId: number;
    memberId: number;
    dueDate?: string;
}

export async function postLending(body: I_LendingAdd): Promise<I_ResponseListData<I_Lending> | null> {
    const token = await SAPI_GetToken()

    if (!token) {
        redirect('/')
    }

    const response: I_BaseListResponse<I_Lending> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lendings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body)
    })
        .then((res) => res.json())
        .then((res) => res)
        .catch((err) => {
            return err
        });

    if (!response.success) {
        return null;
    }

    return response.data
}
