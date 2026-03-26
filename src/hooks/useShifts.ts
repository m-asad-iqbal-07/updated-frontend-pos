import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse } from '../lib/api';

export interface Shift {
    id: number;
    opened_at: string;
    closed_at: string | null;
    opening_cash: number;
    closing_cash: number | null;
    status: 'open' | 'closed';
    notes: string | null;
    total_orders: number;
    total_revenue: number;
    total_expenses: number;
}

export function useShiftList(page = 1, status?: string) {
    return useQuery({
        queryKey: ['shifts-list', page, status],
        queryFn: async () => {
            const params: Record<string, unknown> = { page, per_page: 20 };
            if (status && status !== 'all') params.status = status;
            const { data } = await apiClient.get<PaginatedResponse<Shift>>('/shifts', { params });
            return data;
        }
    });
}

export function useOpenShift() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: { opening_cash?: number; notes?: string }) => {
            const { data } = await apiClient.post<Shift>('/shifts/open', body);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts-list'] }),
    });
}

export function useCloseShift() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, closing_cash, notes }: { id: number; closing_cash: number; notes?: string }) => {
            const { data } = await apiClient.patch<Shift>(`/shifts/${id}/close`, { closing_cash, notes });
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts-list'] }),
    });
}
