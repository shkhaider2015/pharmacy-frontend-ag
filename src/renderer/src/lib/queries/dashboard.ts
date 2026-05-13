import { useQuery } from '@tanstack/react-query';
import api, { BaseResponse } from '../api';

export interface DashboardStats {
  totalRevenue: number;
  activeProducts: number;
  lowStockItems: number;
  pendingOrders: number;
  salesData: {
    name: string;
    sales: number;
  }[];
  expiringSoon: {
    id: string;
    productName: string;
    batchNumber: string;
    daysRemaining: number;
    stock: number;
  }[];
  expired: {
    id: string;
    productName: string;
    batchNumber: string;
    daysRemaining: number;
    stock: number;
  }[];
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      const response = await api.get<BaseResponse<DashboardStats>>('/dashboard/stats');
      return response.data.data;
    }
  });
};
