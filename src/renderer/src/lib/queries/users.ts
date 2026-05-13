import { useQuery, useMutation } from '@tanstack/react-query';
import api, { BaseResponse, PaginatedPayload } from '../api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Staff';
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

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await api.post<BaseResponse<User>>('/users', data);
      return response.data.data;
    }
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await api.put<BaseResponse<User>>(`/users/${id}`, data);
      return response.data.data;
    }
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<BaseResponse<null>>(`/users/${id}`);
      return response.data;
    }
  });
};
