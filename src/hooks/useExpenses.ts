import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '../lib/api';

export interface Expense {
    id: number;
    category: string;
    description: string | null;
    amount: number;
    date: string;
    shift_id: number | null;
    created_at: string;
}

export function useExpenseList(page = 1, category = '', startDate = '', endDate = '') {
    return useQuery({
        queryKey: ['expenses-list', page, category, startDate, endDate],
        queryFn: async () => {
            const params: Record<string, unknown> = { page, per_page: 20 };
            if (category) params.category = category;
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            const { data } = await apiClient.get<PaginatedResponse<Expense>>('/expenses', { params });
            return data;
        }
    });
}

export function useCreateExpense() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: { category: string; amount: number; description?: string; shift_id?: number }) => {
            const { data } = await apiClient.post<Expense>('/expenses', body);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses-list'] }),
    });
}

export function useUpdateExpense() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...body }: { id: number; category?: string; amount?: number; description?: string }) => {
            const { data } = await apiClient.patch<Expense>(`/expenses/${id}`, body);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses-list'] }),
    });
}

export function useDeleteExpense() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await apiClient.delete(`/expenses/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses-list'] }),
    });
}
