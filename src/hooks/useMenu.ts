import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, PaginatedResponse, Category, MenuItem, Addon } from '../lib/api';

// ─── Categories ──────────────────────────────────────────────────
export function useAllCategories(page = 1, search = '') {
    return useQuery({
        queryKey: ['all-categories', page, search],
        queryFn: async () => {
            const params: Record<string, unknown> = { page, per_page: 20 };
            if (search) params.search = search;
            const { data } = await apiClient.get<PaginatedResponse<Category>>('/categories', { params });
            return data;
        }
    });
}

export function useCreateCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: { name: string; description?: string; display_order?: number; is_active?: boolean }) => {
            const { data } = await apiClient.post<Category>('/categories', body);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['all-categories'] }),
    });
}

export function useUpdateCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...body }: { id: number; name?: string; description?: string; display_order?: number; is_active?: boolean }) => {
            const { data } = await apiClient.patch<Category>(`/categories/${id}`, body);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['all-categories'] });
            qc.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}

export function useDeleteCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await apiClient.delete(`/categories/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['all-categories'] }),
    });
}

// ─── Items ───────────────────────────────────────────────────────
export function useAllItems(page = 1, search = '', categoryId?: number) {
    return useQuery({
        queryKey: ['all-items', page, search, categoryId],
        queryFn: async () => {
            const params: Record<string, unknown> = { page, per_page: 20 };
            if (search) params.search = search;
            if (categoryId) params.category_id = categoryId;
            const { data } = await apiClient.get<PaginatedResponse<MenuItem>>('/items', { params });
            return data;
        }
    });
}

export function useCreateItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: Partial<MenuItem> & { category_id: number; name: string; price: number }) => {
            const { data } = await apiClient.post<MenuItem>('/items', body);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['all-items'] });
            qc.invalidateQueries({ queryKey: ['items'] });
        },
    });
}

export function useUpdateItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...body }: { id: number } & Partial<MenuItem>) => {
            const { data } = await apiClient.patch<MenuItem>(`/items/${id}`, body);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['all-items'] });
            qc.invalidateQueries({ queryKey: ['items'] });
        },
    });
}

export function useDeleteItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await apiClient.delete(`/items/${id}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['all-items'] });
            qc.invalidateQueries({ queryKey: ['items'] });
        },
    });
}

// ─── Addons ──────────────────────────────────────────────────────
export function useAllAddons(page = 1, search = '') {
    return useQuery({
        queryKey: ['all-addons', page, search],
        queryFn: async () => {
            const params: Record<string, unknown> = { page, per_page: 20 };
            if (search) params.search = search;
            const { data } = await apiClient.get<PaginatedResponse<Addon>>('/addons', { params });
            return data;
        }
    });
}

export function useCreateAddon() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (body: { name: string; price: number; is_available?: boolean }) => {
            const { data } = await apiClient.post<Addon>('/addons', body);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['all-addons'] });
            qc.invalidateQueries({ queryKey: ['addons'] });
        },
    });
}

export function useUpdateAddon() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...body }: { id: number; name?: string; price?: number; is_available?: boolean }) => {
            const { data } = await apiClient.patch<Addon>(`/addons/${id}`, body);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['all-addons'] });
            qc.invalidateQueries({ queryKey: ['addons'] });
        },
    });
}

export function useDeleteAddon() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await apiClient.delete(`/addons/${id}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['all-addons'] });
            qc.invalidateQueries({ queryKey: ['addons'] });
        },
    });
}
