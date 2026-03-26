import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import { useAllCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
         useAllItems, useCreateItem, useUpdateItem, useDeleteItem,
         useAllAddons, useCreateAddon, useUpdateAddon, useDeleteAddon } from '../hooks/useMenu';
import { useAllCategories as useCatsForSelect } from '../hooks/useMenu';
import { formatCurrency } from '../lib/utils';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/Menu.css';

type Tab = 'categories' | 'items' | 'addons';

// ── Generic Modal ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}

// ── Category Modal ─────────────────────────────────────────────────────────────
function CategoryModal({ initial, onClose }: { initial?: any; onClose: () => void }) {
    const [name, setName] = useState(initial?.name || '');
    const [desc, setDesc] = useState(initial?.description || '');
    const [active, setActive] = useState(initial?.is_active ?? true);
    const createMut = useCreateCategory();
    const updateMut = useUpdateCategory();

    const save = async () => {
        if (!name.trim()) return;
        if (initial) await updateMut.mutateAsync({ id: initial.id, name, description: desc, is_active: active });
        else await createMut.mutateAsync({ name, description: desc, is_active: active });
        onClose();
    };

    const busy = createMut.isPending || updateMut.isPending;
    return (
        <Modal title={initial ? 'Edit Category' : 'New Category'} onClose={onClose}>
            <div className="form-group"><label>Name *</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="form-group"><label>Description</label>
                <input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} /></div>
            <div className="form-group form-check">
                <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} id="cat-active" />
                <label htmlFor="cat-active">Active</label>
            </div>
            <div className="form-actions">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
            </div>
        </Modal>
    );
}

// ── Item Modal ─────────────────────────────────────────────────────────────────
function ItemModal({ initial, onClose }: { initial?: any; onClose: () => void }) {
    const { data: cats } = useCatsForSelect(1);
    const [catId, setCatId] = useState(initial?.category_id || '');
    const [name, setName] = useState(initial?.name || '');
    const [desc, setDesc] = useState(initial?.description || '');
    const [price, setPrice] = useState(String(initial?.price || ''));
    const [stock, setStock] = useState(String(initial?.stock_qty ?? -1));
    const [available, setAvailable] = useState(initial?.is_available ?? true);
    const createMut = useCreateItem();
    const updateMut = useUpdateItem();

    const save = async () => {
        if (!name.trim() || !catId || !price) return;
        const body = { category_id: Number(catId), name, description: desc, price: Number(price), stock_qty: Number(stock), is_available: available };
        if (initial) await updateMut.mutateAsync({ id: initial.id, ...body });
        else await createMut.mutateAsync(body);
        onClose();
    };

    const busy = createMut.isPending || updateMut.isPending;
    return (
        <Modal title={initial ? 'Edit Item' : 'New Menu Item'} onClose={onClose}>
            <div className="form-group"><label>Category *</label>
                <select className="form-input" value={catId} onChange={e => setCatId(e.target.value)}>
                    <option value="">— Select —</option>
                    {cats?.items.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div className="form-row">
                <div className="form-group"><label>Name *</label>
                    <input className="form-input" value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="form-group"><label>Price *</label>
                    <input className="form-input" type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Description</label>
                <input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} /></div>
            <div className="form-row">
                <div className="form-group"><label>Stock Qty (-1 = unlimited)</label>
                    <input className="form-input" type="number" value={stock} onChange={e => setStock(e.target.value)} /></div>
                <div className="form-group form-check" style={{ justifyContent: 'flex-end', paddingTop: 24 }}>
                    <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} id="item-avail" />
                    <label htmlFor="item-avail">Available</label>
                </div>
            </div>
            <div className="form-actions">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
            </div>
        </Modal>
    );
}

// ── Addon Modal ────────────────────────────────────────────────────────────────
function AddonModal({ initial, onClose }: { initial?: any; onClose: () => void }) {
    const [name, setName] = useState(initial?.name || '');
    const [price, setPrice] = useState(String(initial?.price ?? ''));
    const [available, setAvailable] = useState(initial?.is_available ?? true);
    const createMut = useCreateAddon();
    const updateMut = useUpdateAddon();

    const save = async () => {
        if (!name.trim()) return;
        const body = { name, price: Number(price), is_available: available };
        if (initial) await updateMut.mutateAsync({ id: initial.id, ...body });
        else await createMut.mutateAsync(body);
        onClose();
    };

    const busy = createMut.isPending || updateMut.isPending;
    return (
        <Modal title={initial ? 'Edit Add-on' : 'New Add-on'} onClose={onClose}>
            <div className="form-row">
                <div className="form-group"><label>Name *</label>
                    <input className="form-input" value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="form-group"><label>Price</label>
                    <input className="form-input" type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} /></div>
            </div>
            <div className="form-group form-check">
                <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} id="addon-avail" />
                <label htmlFor="addon-avail">Available</label>
            </div>
            <div className="form-actions">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
            </div>
        </Modal>
    );
}

// ── Categories Tab ─────────────────────────────────────────────────────────────
function CategoriesTab() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<any>(null); // null=closed, {}=new, {id,...}=edit
    const { data, isLoading, isError, refetch } = useAllCategories(page, search);
    const deleteMut = useDeleteCategory();

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Delete category "${name}"? This will fail if it has items.`)) return;
        try { await deleteMut.mutateAsync(id); } catch { alert('Cannot delete — category has items.'); }
    };

    return (
        <>
            <div className="tab-toolbar">
                <div className="search-box">
                    <Search size={16} />
                    <input placeholder="Search categories…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <Button variant="primary" size="sm" onClick={() => setModal({})}>
                    <Plus size={16} /> Add Category
                </Button>
            </div>

            {isLoading ? <Spinner /> : isError ? <ErrorState onRetry={refetch} /> : (
                <div className="table-container">
                    <table className="ui-table">
                        <thead><tr><th>Name</th><th>Description</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {data?.items.map(cat => (
                                <tr key={cat.id}>
                                    <td className="font-medium">{cat.name}</td>
                                    <td className="text-secondary">{cat.description || '—'}</td>
                                    <td>{cat.display_order}</td>
                                    <td><Badge variant={cat.is_active ? 'success' : 'default'}>{cat.is_active ? 'Active' : 'Inactive'}</Badge></td>
                                    <td>
                                        <div className="action-btns">
                                            <Button variant="ghost" size="sm" onClick={() => setModal(cat)}><Pencil size={14} /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id, cat.name)}><Trash2 size={14} className="text-danger" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <PaginationBar page={page} totalPages={data?.total_pages || 1} total={data?.total || 0} onPageChange={setPage} />
                </div>
            )}
            {modal !== null && <CategoryModal initial={Object.keys(modal).length ? modal : undefined} onClose={() => setModal(null)} />}
        </>
    );
}

// ── Items Tab ──────────────────────────────────────────────────────────────────
function ItemsTab() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<any>(null);
    const { data, isLoading, isError, refetch } = useAllItems(page, search);
    const deleteMut = useDeleteItem();

    return (
        <>
            <div className="tab-toolbar">
                <div className="search-box"><Search size={16} />
                    <input placeholder="Search items…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <Button variant="primary" size="sm" onClick={() => setModal({})}>
                    <Plus size={16} /> Add Item
                </Button>
            </div>
            {isLoading ? <Spinner /> : isError ? <ErrorState onRetry={refetch} /> : (
                <div className="table-container">
                    <table className="ui-table">
                        <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {data?.items.map(item => (
                                <tr key={item.id}>
                                    <td className="font-medium">{item.name}</td>
                                    <td className="text-secondary">{item.category_name}</td>
                                    <td>{formatCurrency(item.price)}</td>
                                    <td>{item.stock_qty === -1 ? '∞' : item.stock_qty}</td>
                                    <td><Badge variant={item.is_available ? 'success' : 'default'}>{item.is_available ? 'Available' : 'Unavailable'}</Badge></td>
                                    <td>
                                        <div className="action-btns">
                                            <Button variant="ghost" size="sm" onClick={() => setModal(item)}><Pencil size={14} /></Button>
                                            <Button variant="ghost" size="sm" onClick={async () => { if (confirm('Delete this item?')) await deleteMut.mutateAsync(item.id); }}><Trash2 size={14} className="text-danger" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <PaginationBar page={page} totalPages={data?.total_pages || 1} total={data?.total || 0} onPageChange={setPage} />
                </div>
            )}
            {modal !== null && <ItemModal initial={Object.keys(modal).length ? modal : undefined} onClose={() => setModal(null)} />}
        </>
    );
}

// ── Addons Tab ─────────────────────────────────────────────────────────────────
function AddonsTab() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<any>(null);
    const { data, isLoading, isError, refetch } = useAllAddons(page, search);
    const deleteMut = useDeleteAddon();

    return (
        <>
            <div className="tab-toolbar">
                <div className="search-box"><Search size={16} />
                    <input placeholder="Search add-ons…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <Button variant="primary" size="sm" onClick={() => setModal({})}>
                    <Plus size={16} /> Add Add-on
                </Button>
            </div>
            {isLoading ? <Spinner /> : isError ? <ErrorState onRetry={refetch} /> : (
                <div className="table-container">
                    <table className="ui-table">
                        <thead><tr><th>Name</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {data?.items.map(addon => (
                                <tr key={addon.id}>
                                    <td className="font-medium">{addon.name}</td>
                                    <td>{formatCurrency(addon.price)}</td>
                                    <td><Badge variant={addon.is_available ? 'success' : 'default'}>{addon.is_available ? 'Available' : 'Unavailable'}</Badge></td>
                                    <td>
                                        <div className="action-btns">
                                            <Button variant="ghost" size="sm" onClick={() => setModal(addon)}><Pencil size={14} /></Button>
                                            <Button variant="ghost" size="sm" onClick={async () => { if (confirm('Delete add-on?')) await deleteMut.mutateAsync(addon.id); }}><Trash2 size={14} className="text-danger" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <PaginationBar page={page} totalPages={data?.total_pages || 1} total={data?.total || 0} onPageChange={setPage} />
                </div>
            )}
            {modal !== null && <AddonModal initial={Object.keys(modal).length ? modal : undefined} onClose={() => setModal(null)} />}
        </>
    );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
function PaginationBar({ page, totalPages, total, onPageChange }: { page: number; totalPages: number; total: number; onPageChange: (p: number) => void }) {
    if (totalPages <= 1) return null;
    return (
        <div className="pagination-bar">
            <span className="text-secondary text-sm">{total} records</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={14} /></Button>
                <span className="text-sm">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight size={14} /></Button>
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Menu() {
    const [tab, setTab] = useState<Tab>('categories');

    return (
        <div className="page animate-fade-in">
            <PageHeader title="Menu Management" description="Manage categories, menu items, and add-ons." />
            <div className="page-content" style={{ padding: 24 }}>
                <Card className="glass-panel">
                    <CardHeader>
                        <div className="tabs">
                            {(['categories', 'items', 'addons'] as Tab[]).map(t => (
                                <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {tab === 'categories' && <CategoriesTab />}
                        {tab === 'items' && <ItemsTab />}
                        {tab === 'addons' && <AddonsTab />}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
