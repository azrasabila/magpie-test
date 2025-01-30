export interface I_BaseListResponse<T> {
    success: string | null
    error: null | {
        message: String
    }
    data: I_ResponseListData<T>
}

export interface I_ResponseListData<T> {
    pagination: I_Pagination
    data: T[] | null
}

export interface I_BaseResponse<T> {
    success: string | null
    error: string | null
    data: T
}

export interface I_Pagination {
    currentPage: number
    pageSize: number
    totalCount: number
    totalPages: number
}