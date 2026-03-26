import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import { useCustomerList, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, useCustomerOrders } from '../hooks/useCustomers';
import { formatCurrency, formatDate } from '../lib/utils';
import { Plus, Pencil, Trash2, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/Menu.css';

// ── Customer Orders Modal ──────────────────────────────────────────────────────
function CustomerOrdersModal({ customerId, customerName, onClose }: { customerId: number; customerName: string; onClose: () => void }) {
    const { data: orders, isLoading } = useCustomerOrders(customerId);
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Orders — {customerName}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {isLoading ? <Spinner /> : !orders?.length ? (
                        <p className="text-secondary">No orders yet.</p>
                    ) : (
                        <div className="table-container">
                            <table className="ui-table">
                                <thead><tr><th>Order #</th><th>Date</th><th>Status</th><th>Total</th></tr></thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id}>
                                            <td className="font-medium">{o.order_number}</td>
                                            <td className="text-secondary">{formatDate(o.created_at)}</td>
                                            <td><Badge variant={o.status === 'completed' ? 'success' : o.status === 'cancelled' ? 'error' : 'warning'}>{o.status}</Badge></td>
                                            <td>{formatCurrency(o.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Customer Modal ─────────────────────────────────────────────────────────────
function CustomerModal({ initial, onClose }: { initial?: any; onClose: () => void }) {
    const [name, setName] = useState(initial?.name || '');
    const [phone, setPhone] = useState(initial?.phone || '');
    const [email, setEmail] = useState(initial?.email || '');
    const createMut = useCreateCustomer();
    const updateMut = useUpdateCustomer();

    const save = async () => {
        if (!name.trim()) return;
        const body = { name, phone: phone || undefined, email: email || undefined };
        if (initial) await updateMut.mutateAsync({ id: initial.id, ...body });
        else await createMut.mutateAsync(body);
        onClose();
    };

    const busy = createMut.isPending || updateMut.isPending;
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{initial ? 'Edit Customer' : 'New Customer'}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="form-group"><label>Name *</label>
                        <input className="form-input" value={name} onChange={e => setName(e.target.value)} /></div>
                    <div className="form-group"><label>Phone</label>
                        <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                    <div className="form-group"><label>Email</label>
                        <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                    <div className="form-actions">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Customers() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<any>(null);
    const [ordersCustomer, setOrdersCustomer] = useState<{ id: number; name: string } | null>(null);
    const { data, isLoading, isError, refetch } = useCustomerList(page, search);
    const deleteMut = useDeleteCustomer();

    return (
        <div className="page animate-fade-in">
            <PageHeader title="Customers" description="Manage customer records and view order history." />
            <div className="page-content" style={{ padding: 24 }}>
                <Card className="glass-panel">
                    <CardHeader>
                        <div className="tab-toolbar">
                            <div className="search-box"><Search size={16} />
                                <input placeholder="Search by name, phone, email…" value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }} />
                            </div>
                            <Button variant="primary" size="sm" onClick={() => setModal({})}>
                                <Plus size={16} /> Add Customer
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent style={{ padding: 0 }}>
                        {isLoading ? <Spinner /> : isError ? <ErrorState onRetry={refetch} /> : (
                            <div className="table-container">
                                <table className="ui-table">
                                    <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Orders</th><th>Spent</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {data?.items.map(c => (
                                            <tr key={c.id}>
                                                <td className="font-medium">{c.name}</td>
                                                <td className="text-secondary">{c.phone || '—'}</td>
                                                <td className="text-secondary">{c.email || '—'}</td>
                                                <td>{c.total_orders}</td>
                                                <td>{formatCurrency(c.total_spent)}</td>
                                                <td>
                                                    <div className="action-btns">
                                                        <Button variant="ghost" size="sm" onClick={() => setOrdersCustomer({ id: c.id, name: c.name })}><Eye size={14} /></Button>
                                                        <Button variant="ghost" size="sm" onClick={() => setModal(c)}><Pencil size={14} /></Button>
                                                        <Button variant="ghost" size="sm" onClick={async () => { if (confirm('Delete customer?')) await deleteMut.mutateAsync(c.id); }}><Trash2 size={14} className="text-danger" /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(data?.total_pages || 0) > 1 && (
                                    <div className="pagination-bar">
                                        <span className="text-secondary text-sm">{data?.total} customers</span>
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
            {modal !== null && <CustomerModal initial={Object.keys(modal).length ? modal : undefined} onClose={() => setModal(null)} />}
            {ordersCustomer && <CustomerOrdersModal customerId={ordersCustomer.id} customerName={ordersCustomer.name} onClose={() => setOrdersCustomer(null)} />}
        </div>
    );
}
