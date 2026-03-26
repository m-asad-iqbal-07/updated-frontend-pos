import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import { useDiscountList, useCreateDiscount, useUpdateDiscount, useDeleteDiscount } from '../hooks/useDiscounts';
import { formatCurrency } from '../lib/utils';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/Menu.css';

function DiscountModal({ initial, onClose }: { initial?: any; onClose: () => void }) {
    const [name, setName] = useState(initial?.name || '');
    const [type, setType] = useState<'percentage' | 'flat'>(initial?.type || 'percentage');
    const [value, setValue] = useState(String(initial?.value || ''));
    const [active, setActive] = useState(initial?.is_active ?? true);
    const createMut = useCreateDiscount();
    const updateMut = useUpdateDiscount();

    const save = async () => {
        if (!name.trim() || !value) return;
        const body = { name, type, value: Number(value), is_active: active };
        if (initial) await updateMut.mutateAsync({ id: initial.id, ...body });
        else await createMut.mutateAsync(body);
        onClose();
    };

    const busy = createMut.isPending || updateMut.isPending;
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{initial ? 'Edit Discount' : 'New Discount'}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="form-group"><label>Name *</label>
                        <input className="form-input" value={name} onChange={e => setName(e.target.value)} /></div>
                    <div className="form-row">
                        <div className="form-group"><label>Type</label>
                            <select className="form-input" value={type} onChange={e => setType(e.target.value as any)}>
                                <option value="percentage">Percentage (%)</option>
                                <option value="flat">Flat ($)</option>
                            </select>
                        </div>
                        <div className="form-group"><label>Value *</label>
                            <input className="form-input" type="number" min="0" step="0.01" value={value} onChange={e => setValue(e.target.value)} /></div>
                    </div>
                    <div className="form-group form-check">
                        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} id="disc-active" />
                        <label htmlFor="disc-active">Active</label>
                    </div>
                    <div className="form-actions">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Discounts() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<any>(null);
    const { data, isLoading, isError, refetch } = useDiscountList(page, search);
    const deleteMut = useDeleteDiscount();

    return (
        <div className="page animate-fade-in">
            <PageHeader title="Discounts" description="Manage promotions and discount codes." />
            <div className="page-content" style={{ padding: 24 }}>
                <Card className="glass-panel">
                    <CardHeader>
                        <div className="tab-toolbar">
                            <div className="search-box"><Search size={16} />
                                <input placeholder="Search discounts…" value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }} />
                            </div>
                            <Button variant="primary" size="sm" onClick={() => setModal({})}>
                                <Plus size={16} /> Add Discount
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent style={{ padding: 0 }}>
                        {isLoading ? <Spinner /> : isError ? <ErrorState onRetry={refetch} /> : (
                            <div className="table-container">
                                <table className="ui-table">
                                    <thead><tr><th>Name</th><th>Type</th><th>Value</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {data?.items.map(d => (
                                            <tr key={d.id}>
                                                <td className="font-medium">{d.name}</td>
                                                <td className="capitalize text-secondary">{d.type}</td>
                                                <td>{d.type === 'percentage' ? `${d.value}%` : formatCurrency(d.value)}</td>
                                                <td><Badge variant={d.is_active ? 'success' : 'default'}>{d.is_active ? 'Active' : 'Inactive'}</Badge></td>
                                                <td>
                                                    <div className="action-btns">
                                                        <Button variant="ghost" size="sm" onClick={() => setModal(d)}><Pencil size={14} /></Button>
                                                        <Button variant="ghost" size="sm" onClick={async () => { if (confirm('Delete discount?')) await deleteMut.mutateAsync(d.id); }}><Trash2 size={14} className="text-danger" /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(data?.total_pages || 0) > 1 && (
                                    <div className="pagination-bar">
                                        <span className="text-secondary text-sm">{data?.total} discounts</span>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
                                            <span className="text-sm">Page {page} of {data?.total_pages}</span>
                                            <Button variant="outline" size="sm" disabled={page === data?.total_pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            {modal !== null && <DiscountModal initial={Object.keys(modal).length ? modal : undefined} onClose={() => setModal(null)} />}
        </div>
    );
}
