import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Discount, PaginatedResponse } from '../lib/api';

export function useDiscountList(page = 1, search = '') {
    return useQuery({
        queryKey: ['discounts-list', page, search],
        queryFn: async () => {
            const params: Record<string, unknown> = { page, per_page: 20 };
            if (search) params.search = search;
            const { data } = await apiClient.get<PaginatedResponse<Discount>>('/discounts', { params });
            return data;
        }
    });
}

export function useCreateDiscount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: { name: string; type: 'percentage' | 'flat'; value: number; is_active?: boolean; start_date?: string; end_date?: string }) => {
            const { data } = await apiClient.post<Discount>('/discounts', body);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['discounts-list'] });
            qc.invalidateQueries({ queryKey: ['discounts'] });
        },
    });
}

export function useUpdateDiscount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...body }: { id: number; name?: string; type?: 'percentage' | 'flat'; value?: number; is_active?: boolean }) => {
            const { data } = await apiClient.patch<Discount>(`/discounts/${id}`, body);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['discounts-list'] });
            qc.invalidateQueries({ queryKey: ['discounts'] });
        },
    });
}

export function useDeleteDiscount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await apiClient.delete(`/discounts/${id}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['discounts-list'] });
            qc.invalidateQueries({ queryKey: ['discounts'] });
        },
    });
}
