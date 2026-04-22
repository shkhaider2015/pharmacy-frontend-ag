import { useQuery } from '@tanstack/react-query';
import api, { BaseResponse, PaginatedPayload } from '../api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Cashier' | 'Manager';
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export const useUsers = (page: number, limit: number = 10) => {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: async () => {
      const response = await api.get<BaseResponse<PaginatedPayload<User>>>('/users', {
        params: { page, limit }
      });
      return response.data.data;
    }
  });
};
