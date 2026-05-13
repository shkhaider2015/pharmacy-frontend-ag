import { useQuery, useMutation } from '@tanstack/react-query';
import api, { BaseResponse, PaginatedPayload } from '../api';

export interface Product {
  id: string;
  name: string;
  description: string;
  categories: {
    id: string;
    name: string;
  }[];
  supplier: {
    id: string;
    name: string;
  };
  sku: string;
  barcode: string;
  price: number;
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

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const response = await api.post<BaseResponse<Product>>('/products', data);
      return response.data.data;
    }
  });
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const response = await api.patch<BaseResponse<Product>>(`/products/${id}`, data);
      return response.data.data;
    }
  });
};

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<BaseResponse<null>>(`/products/${id}`);
      return response.data;
    }
  });
};
