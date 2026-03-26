import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Customer, PaginatedResponse, Order } from '../lib/api';

export function useCustomerList(page = 1, search = '') {
    return useQuery({
        queryKey: ['customers-list', page, search],
        queryFn: async () => {
            const params: Record<string, unknown> = { page, per_page: 20 };
            if (search) params.search = search;
            const { data } = await apiClient.get<PaginatedResponse<Customer>>('/customers', { params });
            return data;
        }
    });
}

export function useCustomerOrders(id: number | null) {
    return useQuery({
        queryKey: ['customer-orders', id],
        queryFn: async () => {
            const { data } = await apiClient.get<Order[]>(`/customers/${id}/orders`);
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateCustomer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: { name: string; phone?: string; email?: string }) => {
            const { data } = await apiClient.post<Customer>('/customers', body);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['customers-list'] });
            qc.invalidateQueries({ queryKey: ['customers'] });
        },
    });
}

export function useUpdateCustomer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...body }: { id: number; name?: string; phone?: string; email?: string }) => {
            const { data } = await apiClient.patch<Customer>(`/customers/${id}`, body);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['customers-list'] });
            qc.invalidateQueries({ queryKey: ['customers'] });
        },
    });
}

export function useDeleteCustomer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await apiClient.delete(`/customers/${id}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['customers-list'] });
            qc.invalidateQueries({ queryKey: ['customers'] });
        },
    });
}
