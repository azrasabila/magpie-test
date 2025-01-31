import { serialize } from "@/app/utils/querySerialize";
import { I_BaseListResponse, I_ResponseListData } from "../hooks/base";
import { redirect } from "next/navigation";
import { SAPI_GetToken } from "../utils/token";
import { I_Book } from "./getBookList";
import { I_Member } from "./getMemberList";

export interface I_Lending {
    id: number;
    bookId: number;
    memberId: number;
    borrowedDate: string;
    dueDate: string;
    returnDate: string | null;
    status: "BORROWED" | "RETURNED";
    createdBy: number;
    book: I_Book;
    member: I_Member;
}

interface UseLendingsParams {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string;
}

export async function getLendingList(params: UseLendingsParams): Promise<I_ResponseListData<I_Lending> | null> {
    const token = await SAPI_GetToken()

    if (!token) {
        redirect('/')
    }

    const query = {
        page: params.page?.toString() || "1",
        pageSize: params.pageSize?.toString() || "10",
        search: params.search || "",
        categoryId: params.categoryId || ""
    }
    const queryString = serialize(query)
    const response: I_BaseListResponse<I_Lending> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lendings?${queryString}`, {
        method: "GET",
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

    console.log(response)


    if (!response.success) {
        return null;
    }

    return response.data
}
