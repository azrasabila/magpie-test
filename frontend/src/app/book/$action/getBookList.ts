import { getBookList } from "@/app/api/getBookList";
import { serialize } from "@/app/utils/querySerialize";
import { useQuery } from "@tanstack/react-query";

interface I_BookCategory {
    name: string
}

interface I_BookStatus {
    availableQty: number;
    borrowedQty: number
}

interface I_Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: I_BookCategory;
    bookStatus: I_BookStatus;
}

interface UseBooksParams {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string;
}

export const useBooks = ({ page = 1, pageSize = 2, search = "", categoryId = "" }: UseBooksParams) => {
    const query = {
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        categoryId,
    }
    return useQuery({
        queryKey: ["books", page, pageSize, search, categoryId],
        queryFn: async () => await getBookList(query.page, query.pageSize)
    });
};
