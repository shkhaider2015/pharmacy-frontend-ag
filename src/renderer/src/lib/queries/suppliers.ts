import { useQuery, useMutation } from '@tanstack/react-query';
import api, { BaseResponse, PaginatedPayload } from '../api';
import { SupplierStatus } from '@renderer/constants/enums';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: SupplierStatus;
  createdAt?: string;
  updatedAt?: string;
}

export const useSuppliers = (page: number, limit: number = 10) => {
  return useQuery({
    queryKey: ['suppliers', page, limit],
    queryFn: async () => {
      const response = await api.get<BaseResponse<PaginatedPayload<Supplier>>>('/suppliers', {
        params: { page, limit }
      });
      return response.data.data;
    }
  });
};

export const useCreateSupplier = () => {
  return useMutation({
    mutationFn: async (data: Partial<Supplier>) => {
      const response = await api.post<BaseResponse<Supplier>>('/suppliers', data);
      return response.data.data;
    }
  });
};

export const useUpdateSupplier = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Supplier> }) => {
      const response = await api.put<BaseResponse<Supplier>>(`/suppliers/${id}`, data);
      return response.data.data;
    }
  });
};

export const useDeleteSupplier = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<BaseResponse<null>>(`/suppliers/${id}`);
      return response.data;
    }
  });
};
