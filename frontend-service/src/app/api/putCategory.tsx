import { serialize } from "@/app/utils/querySerialize";
import { I_BaseListResponse, I_ResponseListData } from "../hooks/base";
import { redirect } from "next/navigation";
import { SAPI_GetToken } from "../utils/token";
import { I_Category } from "./getCategoryList";
import { I_CategoryAdd } from "./postCategory";

export async function putCategory(body: I_CategoryAdd, id: number): Promise<I_ResponseListData<I_Category> | null> {
    const token = await SAPI_GetToken()

    if (!token) {
        redirect('/')
    }

    const response: I_BaseListResponse<I_Category> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/members/${id}`, {
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
