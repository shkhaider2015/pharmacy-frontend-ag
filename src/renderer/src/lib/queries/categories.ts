import { useQuery } from '@tanstack/react-query';
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
