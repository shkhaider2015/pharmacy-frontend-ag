import { useQuery, useMutation } from '@tanstack/react-query'
import api, { BaseResponse, PaginatedPayload } from '../api'
import { Role, UserStatus } from '@renderer/constants/enums'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  createdAt?: string
  updatedAt?: string
}

export interface EmailChangeRequest {
  id: string
  user: User
  new_email: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export const useUsers = (page: number, limit: number = 10, search?: string) => {
  return useQuery({
    queryKey: ['users', page, limit, search],
    queryFn: async () => {
      const response = await api.get<BaseResponse<PaginatedPayload<User>>>('/users', {
        params: { page, limit, search }
      })
      return response.data.data
    }
  })
}

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await api.post<BaseResponse<User>>('/users', data)
      return response.data.data
    }
  })
}

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await api.patch<BaseResponse<User>>(`/users/${id}`, data)
      return response.data.data
    }
  })
}

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<BaseResponse<null>>(`/users/${id}`)
      return response.data
    }
  })
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await api.get<BaseResponse<User>>(`/users/${id}`)
      return response.data.data
    },
    enabled: !!id
  })
}

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get<BaseResponse<User>>(`/auth/profile`)
      return response.data.data
    }
  })
}

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (data: { name?: string; profile_picture?: string }) => {
      const response = await api.patch<BaseResponse<User>>('/auth/profile', data)
      return response.data.data
    }
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch<BaseResponse<null>>('/auth/change-password', data)
      return response.data
    }
  })
}

export const useRequestEmailChange = () => {
  return useMutation({
    mutationFn: async (data: { newEmail: string }) => {
      const response = await api.post<BaseResponse<EmailChangeRequest>>('/auth/request-email-change', data)
      return response.data.data
    }
  })
}

export const useEmailChangeRequests = () => {
  return useQuery({
    queryKey: ['email-change-requests'],
    queryFn: async () => {
      const response = await api.get<EmailChangeRequest[]>('/users/email-change-requests')
      // Assuming the backend might wrap this in a BaseResponse if we set up interceptors, 
      // but users.controller just returns the array directly. 
      // Let's handle both cases just in case.
      return (response.data as any).data ? (response.data as any).data as EmailChangeRequest[] : response.data as any as EmailChangeRequest[]
    }
  })
}

export const useUpdateEmailChangeRequest = () => {
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const response = await api.patch<BaseResponse<EmailChangeRequest>>(`/users/email-change-requests/${id}`, { status })
      return response.data.data
    }
  })
}
