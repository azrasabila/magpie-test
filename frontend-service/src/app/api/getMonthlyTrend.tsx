import { I_BaseResponse } from "@/app/hooks/base"

type I_MonthlyTrend = {
    month: string
    count: number
}

const fetchMonthlyTrend = async (): Promise<I_MonthlyTrend[]> => {

    const response: I_BaseResponse<I_MonthlyTrend[]> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/monthly-trends`)
        .then((res) => res.json())
        .then((res) => res)
        .catch((err) => {
            return err
        })

    return response.data
}

export default fetchMonthlyTrend