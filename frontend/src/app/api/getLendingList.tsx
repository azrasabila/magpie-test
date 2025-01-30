import { serialize } from "@/app/utils/querySerialize";
import { I_BaseListResponse, I_ResponseListData } from "../hooks/base";
import { redirect } from "next/navigation";
import { SAPI_GetToken } from "../utils/token";

interface I_LendingCategory {
    name: string
}

interface I_LendingStatus {
    availableQty: number;
    borrowedQty: number
}

interface I_Lending {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: I_LendingCategory;
    LendingStatus: I_LendingStatus;
}

interface UseLendingsParams {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string;
}

export async function getLendingList(page: string, pageSize: string): Promise<I_ResponseListData<I_Lending> | null> {
    const token = await SAPI_GetToken()

    if (!token) {
        redirect('/')
    }

    const query = {
        page: page || "1",
        pageSize: pageSize || "10",
        search: "",
        categoryId: ""
    }
    const queryString = serialize(query)
    const response: I_BaseListResponse<I_Lending> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Lendings?${queryString}`, {
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
