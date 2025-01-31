import { I_BaseListResponse, I_ResponseListData } from "../hooks/base";
import { redirect } from "next/navigation";
import { SAPI_GetToken } from "../utils/token";
import { I_Book } from "./getBookList";

export interface I_BookAdd {
    title: string;
    author: string;
    isbn: string;
    categoryId: number;
}

export async function putBook(body: I_BookAdd, id: number): Promise<I_ResponseListData<I_Book> | null> {
    const token = await SAPI_GetToken()

    if (!token) {
        redirect('/')
    }

    const response: I_BaseListResponse<I_Book> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/${id}`, {
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
