import { I_BaseListResponse, I_ResponseListData } from "../hooks/base";
import { redirect } from "next/navigation";
import { SAPI_GetToken } from "../utils/token";
import { I_Lending } from "./getLendingList";
import { I_LendingAdd } from "./postLending";

export async function putLending(body: I_LendingAdd, id: number): Promise<I_ResponseListData<I_Lending> | null> {
    const token = await SAPI_GetToken()

    if (!token) {
        redirect('/')
    }

    const response: I_BaseListResponse<I_Lending> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lendings/${id}`, {
        method: "PUT",
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
