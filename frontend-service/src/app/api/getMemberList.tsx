import { serialize } from "@/app/utils/querySerialize";
import { I_BaseListResponse, I_ResponseListData } from "../hooks/base";
import { redirect } from "next/navigation";
import { SAPI_GetToken } from "../utils/token";

export interface I_Member {
    id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  joinedDate: string;
}

interface UseMembersParams {
    page?: number;
    pageSize?: number;
    search?: string;
}

export async function getMemberList(param: UseMembersParams): Promise<I_ResponseListData<I_Member> | null> {
    const token = await SAPI_GetToken()

    if (!token) {
        redirect('/')
    }

    const query = {
        page: param.page?.toString() || "1",
        pageSize: param.pageSize?.toString() || "10",
        search: param.search?.toString() || "",
        categoryId: ""
    }
    const queryString = serialize(query)
    const response: I_BaseListResponse<I_Member> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/members?${queryString}`, {
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

    if (!response.success) {
        return null;
    }

    return response.data
}
