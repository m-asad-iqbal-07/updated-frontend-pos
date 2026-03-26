import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Coffee, UtensilsCrossed, Users, Tag, Clock, Receipt, Menu, X } from 'lucide-react';
import '../../styles/Sidebar.css';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/register', label: 'POS Register', icon: Coffee, exact: false },
    { path: '/orders', label: 'Orders', icon: ShoppingBag, exact: false },
    { path: '/menu', label: 'Menu', icon: UtensilsCrossed, exact: false },
    { path: '/customers', label: 'Customers', icon: Users, exact: false },
    { path: '/discounts', label: 'Discounts', icon: Tag, exact: false },
    { path: '/shifts', label: 'Shifts', icon: Clock, exact: false },
    { path: '/expenses', label: 'Expenses', icon: Receipt, exact: false },
];

export function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const closeMobile = () => setMobileOpen(false);

    return (
        <>
            {/* Mobile top bar */}
            <div className="mobile-topbar">
                <div className="logo-icon">☕</div>
                <h2>Philo POS</h2>
                <button className="hamburger-btn" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile overlay */}
            {mobileOpen && <div className="sidebar-overlay" onClick={closeMobile} />}

            <aside className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-icon">☕</div>
                    <h2>Philo POS</h2>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.exact}
                                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                                onClick={closeMobile}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="system-status">
                        <span className="status-dot" />
                        <span>System Online</span>
                    </div>
                </div>
            </aside>
        </>
    );
}
