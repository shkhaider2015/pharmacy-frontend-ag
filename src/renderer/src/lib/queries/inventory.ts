import { useQuery, useMutation } from '@tanstack/react-query';
import api, { BaseResponse, PaginatedPayload } from '../api';
import { Product } from './products';

export interface InventoryItem {
  id: string;
  productName: string;
  product: Product; // May need mapping depending on actual backend response, e.g., product.name
  batchNumber: string;
  stock: number;
  expiryDate: string;
  status: 'good' | 'near-expiry' | 'expired';
  createdAt?: string;
  updatedAt?: string;
}

export const useInventory = (page: number, limit: number = 10) => {
  return useQuery({
    queryKey: ['inventory', page, limit],
    queryFn: async () => {
      const response = await api.get<BaseResponse<PaginatedPayload<InventoryItem>>>('/inventory', {
        params: { page, limit }
      });
      const data = response.data.data;
      return {
        ...data,
        data: data.data.map((item) => ({
          ...item,
          productName: item.product?.name || 'Unknown Product'
        }))
      };
    }
  });
};

export const useCreateInventoryBatch = () => {
  return useMutation({
    mutationFn: async (data: Partial<InventoryItem>) => {
      const response = await api.post<BaseResponse<InventoryItem>>('/inventory', data);
      return response.data.data;
    }
  });
};

export const useUpdateInventoryBatch = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InventoryItem> }) => {
      const response = await api.put<BaseResponse<InventoryItem>>(`/inventory/${id}`, data);
      return response.data.data;
    }
  });
};

export const useDeleteInventoryBatch = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<BaseResponse<null>>(`/inventory/${id}`);
      return response.data;
    }
  });
};
