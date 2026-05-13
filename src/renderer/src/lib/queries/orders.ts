import { useQuery, useMutation, useInfiniteQuery, InfiniteData, QueryKey } from '@tanstack/react-query';
import api, { BaseResponse, PaginatedPayload } from '../api';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: { id: string; name: string; sku: string; price: number };
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export const useOrders = (page: number, limit: number = 10) => {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: async () => {
      const response = await api.get<BaseResponse<PaginatedPayload<Order>>>('/orders', {
        params: { page, limit }
      });

      console.log(response.data.data);

      return response.data.data;
    }
  });
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (data: Partial<Order>) => {
      const response = await api.post<BaseResponse<Order>>('/orders', data);
      return response.data.data;
    }
  });
};

export const useUpdateOrder = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Order> }) => {
      const response = await api.patch<BaseResponse<Order>>(`/orders/${id}`, data);
      return response.data.data;
    }
  });
};

export const useDeleteOrder = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<BaseResponse<null>>(`/orders/${id}`);
      return response.data;
    }
  });
};
