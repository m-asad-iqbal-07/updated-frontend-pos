import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import { useExpenseList, useCreateExpense, useUpdateExpense, useDeleteExpense, Expense } from '../hooks/useExpenses';
import { formatCurrency, formatDate } from '../lib/utils';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/Menu.css';

const CATEGORIES = ['supplies', 'maintenance', 'wages', 'utilities', 'rent', 'other'];

function ExpenseModal({ initial, onClose }: { initial?: Expense; onClose: () => void }) {
    const [category, setCategory] = useState(initial?.category || '');
    const [amount, setAmount] = useState(String(initial?.amount || ''));
    const [desc, setDesc] = useState(initial?.description || '');
    const createMut = useCreateExpense();
    const updateMut = useUpdateExpense();

    const save = async () => {
        if (!category || !amount) return;
        const body = { category, amount: Number(amount), description: desc || undefined };
        if (initial) await updateMut.mutateAsync({ id: initial.id, ...body });
        else await createMut.mutateAsync(body);
        onClose();
    };

    const busy = createMut.isPending || updateMut.isPending;
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>{initial ? 'Edit Expense' : 'New Expense'}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
                <div className="modal-body">
                    <div className="form-row">
                        <div className="form-group"><label>Category *</label>
                            <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="">— Select —</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label>Amount ($) *</label>
                            <input className="form-input" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} /></div>
                    </div>
                    <div className="form-group"><label>Description</label>
                        <input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} /></div>
                    <div className="form-actions">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Expenses() {
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [modal, setModal] = useState<any>(null);
    const { data, isLoading, isError, refetch } = useExpenseList(page, category, startDate, endDate);
    const deleteMut = useDeleteExpense();

    return (
        <div className="page animate-fade-in">
            <PageHeader title="Expenses" description="Track and manage business expenses." />
            <div className="page-content" style={{ padding: 24 }}>
                {/* Filters */}
                <Card className="glass-panel" style={{ marginBottom: 16 }}>
                    <CardContent>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="text-sm text-secondary">Category</label>
                                <select className="form-input" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
                                    <option value="">All</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="text-sm text-secondary">From</label>
                                <input className="form-input" type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="text-sm text-secondary">To</label>
                                <input className="form-input" type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} />
                            </div>
                            {(category || startDate || endDate) && (
                                <Button variant="ghost" size="sm" onClick={() => { setCategory(''); setStartDate(''); setEndDate(''); }}>Clear</Button>
                            )}
                            <Button variant="primary" size="sm" style={{ marginLeft: 'auto' }} onClick={() => setModal({})}>
                                <Plus size={16} /> Add Expense
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-panel">
                    <CardContent style={{ padding: 0 }}>
                        {isLoading ? <Spinner /> : isError ? <ErrorState onRetry={refetch} /> : (
                            <div className="table-container">
                                <table className="ui-table">
                                    <thead><tr><th>Category</th><th>Description</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {data?.items.map(e => (
                                            <tr key={e.id}>
                                                <td className="font-medium capitalize">{e.category}</td>
                                                <td className="text-secondary">{e.description || '—'}</td>
                                                <td>{formatCurrency(e.amount)}</td>
                                                <td className="text-secondary">{formatDate(e.date)}</td>
                                                <td>
                                                    <div className="action-btns">
                                                        <Button variant="ghost" size="sm" onClick={() => setModal(e)}><Pencil size={14} /></Button>
                                                        <Button variant="ghost" size="sm" onClick={async () => { if (confirm('Delete expense?')) await deleteMut.mutateAsync(e.id); }}><Trash2 size={14} className="text-danger" /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {data?.items.length === 0 && (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>No expenses found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                                {(data?.total_pages || 0) > 1 && (
                                    <div className="pagination-bar">
                                        <span className="text-secondary text-sm">{data?.total} expenses</span>
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
            {modal !== null && <ExpenseModal initial={Object.keys(modal).length > 0 ? modal : undefined} onClose={() => setModal(null)} />}
        </div>
    );
}
