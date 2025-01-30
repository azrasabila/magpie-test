import { I_BaseResponse } from "@/app/hooks/base"

type I_MostBorrowedBook = {
    bookId: number
    bookTitle: string
    bookAuthor: string
    borrowCount: string
}

const fetchMostBorrowedBook = async (): Promise<I_MostBorrowedBook[]> => {

    const response: I_BaseResponse<I_MostBorrowedBook[]> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/most-borrowed`)
        .then((res) => res.json())
        .then((res) => res)
        .catch((err) => {
            return err
        })

    return response.data
}

export default fetchMostBorrowedBook