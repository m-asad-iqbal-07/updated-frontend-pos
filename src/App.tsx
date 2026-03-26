import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DateFilterProvider } from './context/DateFilterContext';
import { AppLayout } from './components/layout/AppLayout';

import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Customers from './pages/Customers';
import Discounts from './pages/Discounts';
import Shifts from './pages/Shifts';
import Expenses from './pages/Expenses';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 2,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <DateFilterProvider>
                <BrowserRouter>
                    <AppLayout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/menu" element={<Menu />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/discounts" element={<Discounts />} />
                            <Route path="/shifts" element={<Shifts />} />
                            <Route path="/expenses" element={<Expenses />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AppLayout>
                </BrowserRouter>
            </DateFilterProvider>
        </QueryClientProvider>
    );
}

export default App;
