import { useQuery } from '@tanstack/react-query';
import api, { BaseResponse, PaginatedPayload } from '../api';

export interface Product {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  sku: string;
  barcode: string;
  unitPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export const useProducts = (page: number, limit: number = 10) => {
  return useQuery({
    queryKey: ['products', page, limit],
    queryFn: async () => {
      const response = await api.get<BaseResponse<PaginatedPayload<Product>>>('/products', {
        params: { page, limit }
      });
      return response.data.data;
    }
  });
};
