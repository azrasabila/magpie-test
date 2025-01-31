import { I_BaseListResponse, I_ResponseListData } from "../hooks/base";
import { redirect } from "next/navigation";
import { SAPI_GetToken } from "../utils/token";
import { I_Lending } from "./getLendingList";

export async function postReturnLending(id: number): Promise<I_ResponseListData<I_Lending> | null> {
    const token = await SAPI_GetToken()

    if (!token) {
        redirect('/')
    }

    const response: I_BaseListResponse<I_Lending> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lendings/${id}/return`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    })
        .then((res) => res.json())
        .then((res) => res)
        .catch((err) => {
            return err
        });

    console.log(response)

    if (!response.success) {
        return null;
    }

    return response.data
}
