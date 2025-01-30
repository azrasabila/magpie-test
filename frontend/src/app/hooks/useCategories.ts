import { useQuery } from '@tanstack/react-query'
import { serialize } from '../utils/querySerialize'
import { I_BaseListResponse, I_ResponseListData } from './base'

type I_Category = {
  id: number
  name: string
}

const fetchCategories = async (pageSize = 10, page = 1): Promise<I_ResponseListData<I_Category>> => {
  const queries = {
    pageSize: pageSize.toString(),
    page: page.toString(),
  }
  const queryString = serialize(queries)
  console.log(`${process.env.NEXT_PUBLIC_API_URL}/categories?${queryString}`)
  const response: I_BaseListResponse<I_Category> = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?${queryString}`)
  .then((res) => res.json())
        .then((res) => res)
        .catch((err) => {
            return err
        })
  
  console.log(response.data)
  return response.data
}

const useCategories = (pageSize: number, page: number) => {
  return useQuery({
    queryKey: ['categories', pageSize, page],
    queryFn: () => fetchCategories(pageSize, page),
  })
}

export { useCategories, fetchCategories }
