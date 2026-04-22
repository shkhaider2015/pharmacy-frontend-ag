import { useQuery } from '@tanstack/react-query';
import api, { BaseResponse, PaginatedPayload } from '../api';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
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
