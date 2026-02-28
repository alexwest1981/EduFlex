import React, { useState, useEffect } from 'react';
import { CreditCard, ShoppingBag, ArrowUpRight, Loader2, DollarSign, Calendar, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api';

const SalesDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Fetch the new endpoint we just created
                const response = await fetch('/api/checkout/orders', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                }
            } catch (err) {
                console.error("Failed to load orders", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const totalRevenue = orders.reduce((sum, order) => {
        if (order.status === 'COMPLETED') return sum + order.totalAmount;
        return sum;
    }, 0);

    const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;

    const StatusBadge = ({ status }) => {
        if (status === 'COMPLETED') return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold"><CheckCircle2 size={14} /> Genomförd</span>;
        if (status === 'PENDING') return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md text-xs font-bold"><Calendar size={14} /> Väntar</span>;
        if (status === 'FAILED') return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-bold"><XCircle size={14} /> Misslyckad</span>;
        return <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md text-xs font-bold">{status}</span>;
    };

    if (loading) {
        return <div className="p-8 flex items-center gap-2 text-gray-400"><Loader2 className="animate-spin" /> Laddar orderdata...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-black mb-2 flex items-center gap-3 dark:text-white">
                <CreditCard className="text-brand-teal" /> Försäljning & Ordrar
            </h1>
            <p className="text-gray-500 mb-8 max-w-2xl">
                Här kan du se alla genomförda kursköp via er Storefront. Transaktionerna sker via Stripe och pengarna sätts in på ert anslutna konto.
            </p>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1a1b1d] p-6 rounded-2xl border border-gray-200 dark:border-white/5 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Försäljning</div>
                        <div className="text-2xl font-black dark:text-white">{totalRevenue.toLocaleString()} kr</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a1b1d] p-6 rounded-2xl border border-gray-200 dark:border-white/5 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Lyckade Ordrar</div>
                        <div className="text-2xl font-black dark:text-white">{completedOrders} st</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a1b1d] p-6 rounded-2xl border border-gray-200 dark:border-white/5 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                        <Tag size={24} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Snittordervärde</div>
                        <div className="text-2xl font-black dark:text-white">{completedOrders > 0 ? Math.round(totalRevenue / completedOrders).toLocaleString() : 0} kr</div>
                    </div>
                </div>
            </div>

            {/* Order Table */}
            <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-white/5">
                    <h3 className="font-bold text-lg dark:text-white">Orderhistorik</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 text-xs uppercase tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Kund</th>
                                <th className="px-6 py-4">Kurser</th>
                                <th className="px-6 py-4">Belopp</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Datum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs dark:text-gray-300">
                                        #{order.id.toString().padStart(6, '0')}
                                        {order.stripePaymentIntentId && (
                                            <div className="text-[10px] text-gray-500 mt-1" title={order.stripePaymentIntentId}>
                                                Stripe
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-sm dark:text-white">{order.customer?.firstName} {order.customer?.lastName}</div>
                                        <div className="text-xs text-gray-500">{order.customer?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.courses?.map(course => (
                                            <div key={course.id} className="text-sm dark:text-gray-300">• {course.name}</div>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 font-black dark:text-white text-brand-teal">
                                        {order.totalAmount} kr
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString('sv-SE', {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Inga ordrar hittades. När försäljning sker dyker de upp här.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
