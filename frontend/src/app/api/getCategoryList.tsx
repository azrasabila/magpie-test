import { I_ResponseListData, I_BaseListResponse } from "@/app/hooks/base"
import { serialize } from "@/app/utils/querySerialize"

type I_Category = {
    id: number
    name: string
}

const fetchCategories = async (pageSize = 10, page = 1, search = ''): Promise<I_ResponseListData<I_Category>> => {
    const queries = {
        pageSize: pageSize.toString(),
        page: page.toString(),
        search
    }
    const queryString = serialize(queries)
    const response: I_BaseListResponse<I_Category> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?${queryString}`)
        .then((res) => res.json())
        .then((res) => res)
        .catch((err) => {
            return err
        })

    console.log(response)
    return response.data
}

export default fetchCategories