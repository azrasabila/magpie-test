import { I_BaseResponse } from "@/app/hooks/base"

type I_CategoryDistribution = {
    categoryId: number
    categoryName: string
    bookCount: string
}

const fetchCategoryDistribution = async (): Promise<I_CategoryDistribution[]> => {

    const response: I_BaseResponse<I_CategoryDistribution[]> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/category-distribution`)
        .then((res) => res.json())
        .then((res) => res)
        .catch((err) => {
            return err
        })

    return response.data
}

export default fetchCategoryDistribution