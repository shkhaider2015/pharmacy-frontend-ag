import { useQuery, useMutation } from '@tanstack/react-query';
import api, { BaseResponse, PaginatedPayload } from '../api';

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useCategories = (page: number, limit: number = 10) => {
  return useQuery({
    queryKey: ['categories', page, limit],
    queryFn: async () => {
      const response = await api.get<BaseResponse<PaginatedPayload<Category>>>('/categories', {
        params: { page, limit }
      });
      return response.data.data;
    }
  });
};

export const useCreateCategory = () => {
  return useMutation({
    mutationFn: async (data: Partial<Category>) => {
      const response = await api.post<BaseResponse<Category>>('/categories', data);
      return response.data.data;
    }
  });
};

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }) => {
      const response = await api.put<BaseResponse<Category>>(`/categories/${id}`, data);
      return response.data.data;
    }
  });
};

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<BaseResponse<null>>(`/categories/${id}`);
      return response.data;
    }
  });
};
