import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import { useShiftList, useOpenShift, useCloseShift, Shift } from '../hooks/useShifts';
import { formatCurrency, formatDate } from '../lib/utils';
import { ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import '../styles/Menu.css';

function OpenShiftModal({ onClose }: { onClose: () => void }) {
    const [cash, setCash] = useState('0');
    const [notes, setNotes] = useState('');
    const mut = useOpenShift();

    const save = async () => {
        await mut.mutateAsync({ opening_cash: Number(cash), notes: notes || undefined });
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>Open New Shift</h3><button className="modal-close" onClick={onClose}>✕</button></div>
                <div className="modal-body">
                    <div className="form-group"><label>Opening Cash ($)</label>
                        <input className="form-input" type="number" min="0" step="0.01" value={cash} onChange={e => setCash(e.target.value)} /></div>
                    <div className="form-group"><label>Notes</label>
                        <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)} /></div>
                    <div className="form-actions">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={save} disabled={mut.isPending}>{mut.isPending ? 'Opening…' : 'Open Shift'}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CloseShiftModal({ shift, onClose }: { shift: Shift; onClose: () => void }) {
    const [cash, setCash] = useState('');
    const [notes, setNotes] = useState('');
    const mut = useCloseShift();

    const save = async () => {
        await mut.mutateAsync({ id: shift.id, closing_cash: Number(cash), notes: notes || undefined });
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h3>Close Shift #{shift.id}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
                <div className="modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, padding: 12, background: 'var(--bg-accent)', borderRadius: 'var(--radius-md)' }}>
                        <div><p className="text-secondary text-sm">Total Orders</p><p className="font-medium">{shift.total_orders}</p></div>
                        <div><p className="text-secondary text-sm">Total Revenue</p><p className="font-medium">{formatCurrency(shift.total_revenue)}</p></div>
                        <div><p className="text-secondary text-sm">Expenses</p><p className="font-medium">{formatCurrency(shift.total_expenses)}</p></div>
                        <div><p className="text-secondary text-sm">Opening Cash</p><p className="font-medium">{formatCurrency(shift.opening_cash)}</p></div>
                    </div>
                    <div className="form-group"><label>Closing Cash ($) *</label>
                        <input className="form-input" type="number" min="0" step="0.01" value={cash} onChange={e => setCash(e.target.value)} /></div>
                    <div className="form-group"><label>Notes</label>
                        <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)} /></div>
                    <div className="form-actions">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={save} disabled={mut.isPending || !cash}>{mut.isPending ? 'Closing…' : 'Close Shift'}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Shifts() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [openModal, setOpenModal] = useState(false);
    const [closeShift, setCloseShift] = useState<Shift | null>(null);
    const { data, isLoading, isError, refetch } = useShiftList(page, statusFilter);

    const hasOpenShift = data?.items.some(s => s.status === 'open');

    return (
        <div className="page animate-fade-in">
            <PageHeader title="Shifts" description="Track cashier shifts and cash flow." />
            <div className="page-content" style={{ padding: 24 }}>
                <Card className="glass-panel">
                    <CardHeader>
                        <div className="tab-toolbar">
                            <div style={{ display: 'flex', gap: 8 }}>
                                {['all', 'open', 'closed'].map(s => (
                                    <Button key={s} size="sm" variant={statusFilter === s ? 'primary' : 'outline'} onClick={() => setStatusFilter(s)} className="capitalize">{s}</Button>
                                ))}
                            </div>
                            {!hasOpenShift && (
                                <Button variant="primary" size="sm" onClick={() => setOpenModal(true)}>
                                    <Unlock size={16} /> Open Shift
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent style={{ padding: 0 }}>
                        {isLoading ? <Spinner /> : isError ? <ErrorState onRetry={refetch} /> : (
                            <div className="table-container">
                                <table className="ui-table">
                                    <thead><tr><th>ID</th><th>Opened</th><th>Closed</th><th>Status</th><th>Orders</th><th>Revenue</th><th>Cash In</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {data?.items.map(s => (
                                            <tr key={s.id}>
                                                <td>#{s.id}</td>
                                                <td className="text-secondary">{formatDate(s.opened_at)}</td>
                                                <td className="text-secondary">{s.closed_at ? formatDate(s.closed_at) : '—'}</td>
                                                <td><Badge variant={s.status === 'open' ? 'success' : 'default'}>{s.status}</Badge></td>
                                                <td>{s.total_orders}</td>
                                                <td>{formatCurrency(s.total_revenue)}</td>
                                                <td>{formatCurrency(s.opening_cash)}</td>
                                                <td>
                                                    {s.status === 'open' && (
                                                        <Button variant="ghost" size="sm" onClick={() => setCloseShift(s)}>
                                                            <Lock size={14} /> Close
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(data?.total_pages || 0) > 1 && (
                                    <div className="pagination-bar">
                                        <span className="text-secondary text-sm">{data?.total} shifts</span>
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
            {openModal && <OpenShiftModal onClose={() => setOpenModal(false)} />}
            {closeShift && <CloseShiftModal shift={closeShift} onClose={() => setCloseShift(null)} />}
        </div>
    );
}
