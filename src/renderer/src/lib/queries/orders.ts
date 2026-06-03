import { useQuery, useMutation } from '@tanstack/react-query'
import api, { BaseResponse, PaginatedPayload } from '../api'
import { OrderType } from '@renderer/constants/enums'

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  pricePerUnit: number
  product?: { id: string; name: string; sku: string; price: number }
  manufacturingDate?: string
  expiryDate?: string
  batchNumber?: string
}

export interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: 'Pending' | 'Completed' | 'Cancelled'
  items: OrderItem[]
  type: OrderType
  createdAt?: string
  updatedAt?: string
}

export const useOrders = (page: number, limit: number = 10, type?: string) => {
  return useQuery({
    queryKey: ['orders', page, limit, type],
    queryFn: async () => {
      const response = await api.get<BaseResponse<PaginatedPayload<Order>>>('/orders', {
        params: { page, limit, type: type || undefined }
      })

      console.log(response.data.data)

      return response.data.data
    }
  })
}

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await api.get<BaseResponse<Order>>(`/orders/${id}`)
      return response.data.data
    },
    enabled: !!id
  })
}

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (data: Partial<Order>) => {
      const response = await api.post<BaseResponse<Order>>('/orders', data)
      return response.data.data
    }
  })
}

export const useUpdateOrder = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Order> }) => {
      const response = await api.patch<BaseResponse<Order>>(`/orders/${id}`, data)
      return response.data.data
    }
  })
}

export const useDeleteOrder = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<BaseResponse<null>>(`/orders/${id}`)
      return response.data
    }
  })
}

export const useMarkAsCompleted = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<BaseResponse<Order>>(`/orders/${id}/complete`)
      return response.data.data
    }
  })
}

export const useMarkAsCancelled = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<BaseResponse<Order>>(`/orders/${id}/cancel`)
      return response.data.data
    }
  })
}
