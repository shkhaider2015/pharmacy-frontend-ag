import { useQuery, useMutation } from '@tanstack/react-query'
import api, { BaseResponse, PaginatedPayload } from '../api'
import { Product } from './products'

export interface InventoryItem {
  id: string
  productName: string
  product: Product // May need mapping depending on actual backend response, e.g., product.name
  batchNumber: string
  quantity: number
  expiryDate: string
  manufacturingDate: string
  createdAt?: string
  updatedAt?: string
}

export type InventoryFilter = 'all' | 'expired' | 'near-expiry'

export const useInventory = (page: number, limit: number = 10, filter: InventoryFilter = 'all', search?: string) => {
  return useQuery({
    queryKey: ['inventory', page, limit, filter, search],
    queryFn: async () => {
      let endpoint = '/inventory'
      if (filter === 'expired') {
        endpoint = '/inventory/expired'
      } else if (filter === 'near-expiry') {
        endpoint = '/inventory/near-expiry'
      }

      const response = await api.get<BaseResponse<PaginatedPayload<InventoryItem>>>(endpoint, {
        params: { page, limit, search }
      })
      const data = response.data.data
      console.log('Inventory Data: ', data)
      return {
        ...data,
        data: data.data.map((item) => ({
          ...item,
          productName: item.product?.name || 'Unknown Product'
        }))
      }
    }
  })
}

export const useCreateInventoryBatch = () => {
  return useMutation({
    mutationFn: async (data: Partial<InventoryItem>) => {
      const response = await api.post<BaseResponse<InventoryItem>>('/inventory', data)
      return response.data.data
    }
  })
}

export const useUpdateInventoryBatch = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InventoryItem> }) => {
      const response = await api.put<BaseResponse<InventoryItem>>(`/inventory/${id}`, data)
      return response.data.data
    }
  })
}

export const useDeleteInventoryBatch = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<BaseResponse<null>>(`/inventory/${id}`)
      return response.data
    }
  })
}
