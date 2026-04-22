import { useQuery } from '@tanstack/react-query';
import api, { BaseResponse, PaginatedPayload } from '../api';

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
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
      return response.data.data;
    }
  });
};
