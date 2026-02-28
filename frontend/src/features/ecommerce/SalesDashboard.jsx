import React, { useState, useEffect } from 'react';
import { CreditCard, ShoppingBag, Store, Loader2, DollarSign, Calendar, Tag, CheckCircle2, XCircle, BookOpen, Percent, Plus, Save, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

const SalesOverview = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await api.get('/checkout/orders');
                setOrders(data);
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
        if (status === 'COMPLETED') return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold w-max"><CheckCircle2 size={14} /> Genomförd</span>;
        if (status === 'PENDING') return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md text-xs font-bold w-max"><Calendar size={14} /> Väntar</span>;
        if (status === 'FAILED') return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-bold w-max"><XCircle size={14} /> Misslyckad</span>;
        return <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md text-xs font-bold">{status}</span>;
    };

    if (loading) return <div className="p-8 flex items-center gap-2 text-gray-400"><Loader2 className="animate-spin" /> Laddar orderdata...</div>;

    return (
        <div>
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
                                            <div className="text-[10px] text-gray-500 mt-1" title={order.stripePaymentIntentId}>Stripe</div>
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

const SalesCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        try {
            const data = await api.courses.getAll(); // Assuming api.courses points to /api/courses
            setCourses(data);
        } catch (err) {
            console.error("Failed to fetch courses", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const toggleOpen = async (id) => {
        try {
            await api.put(`/courses/${id}/toggle-status`, {});
            fetchCourses();
        } catch (err) {
            alert("Kunde inte ändra status");
        }
    };

    const updatePrice = async (course, newPrice) => {
        try {
            await api.put(`/courses/${course.id}`, { price: newPrice });
            fetchCourses();
        } catch (err) {
            alert("Kunde inte uppdatera pris");
        }
    };

    if (loading) return <div className="p-8 flex items-center gap-2 text-gray-400"><Loader2 className="animate-spin" /> Laddar kurser...</div>;

    return (
        <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg dark:text-white">Butikens Kursutbud</h3>
                    <p className="text-gray-500 text-sm">Prissätt och aktivera kurser för försäljning i Storefront.</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 text-xs uppercase tracking-widest font-bold">
                        <tr>
                            <th className="px-6 py-4">Kursnamn</th>
                            <th className="px-6 py-4">Kategori</th>
                            <th className="px-6 py-4">Nuvarande Pris</th>
                            <th className="px-6 py-4">Synlig i Butik</th>
                            <th className="px-6 py-4 text-right">Åtgärder</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {courses.map(course => (
                            <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td className="px-6 py-4 font-bold dark:text-white">{course.name}</td>
                                <td className="px-6 py-4 text-sm dark:text-gray-400">{course.theme || 'Okategoriserad'}</td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        defaultValue={course.price || 0}
                                        onBlur={(e) => updatePrice(course, parseFloat(e.target.value))}
                                        className="w-24 px-3 py-1 bg-gray-100 dark:bg-white/5 border border-transparent focus:border-brand-teal rounded-md dark:text-white outline-none"
                                    /> kr
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleOpen(course.id)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${course.open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {course.open ? 'Publicerad' : 'Privat'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {/* Action buttons could go here */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SalesPromoCodes = () => {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: 0, maxUses: -1 });

    const fetchPromoCodes = async () => {
        try {
            const data = await api.get('/promocodes');
            setPromoCodes(data);
        } catch (err) {
            console.error("Failed to load promo codes", err);
        } finally {
            setLoading(false);
            setIsCreating(false);
        }
    };

    useEffect(() => { fetchPromoCodes(); }, []);

    const toggleStatus = async (id) => {
        try {
            const code = promoCodes.find(c => c.id === id);
            await api.put(`/promocodes/${id}`, { ...code, isActive: !code.isActive });
            fetchPromoCodes();
        } catch (err) { alert('Kunde inte ändra status'); }
    };

    const deleteCode = async (id) => {
        if (window.confirm('Är du säker på att du vill ta bort denna rabattkod?')) {
            try {
                await api.delete(`/promocodes/${id}`);
                fetchPromoCodes();
            } catch (err) { alert('Kunde inte radera'); }
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/promocodes', { ...formData, isActive: true, currentUses: 0 });
            setFormData({ code: '', discountType: 'PERCENTAGE', discountValue: 0, maxUses: -1 });
            fetchPromoCodes();
        } catch (err) { alert('Kunde inte skapa rabattkod'); }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-[#1a1b1d] p-6 rounded-2xl border border-gray-200 dark:border-white/5">
                <div>
                    <h3 className="font-bold text-lg dark:text-white">Rabattkoder & Kampanjer</h3>
                    <p className="text-sm text-gray-500">Skapa och hantera koder som kunderna kan ange i kassan.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 bg-brand-teal text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-teal/90 transition-colors"
                ><Plus size={18} /> Ny Kampanj</button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-brand-teal/5 p-6 rounded-2xl border border-brand-teal/20 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kod (T.ex. SOMMAR20)</label>
                        <input required type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-[#1a1b1d] dark:text-white outline-none focus:border-brand-teal" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Typ</label>
                        <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-[#1a1b1d] dark:text-white outline-none focus:border-brand-teal">
                            <option value="PERCENTAGE">Procent (%)</option>
                            <option value="FIXED_AMOUNT">Fast summa (kr)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Värde</label>
                        <input required type="number" min="1" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-[#1a1b1d] dark:text-white outline-none focus:border-brand-teal" />
                    </div>
                    <button type="submit" className="bg-brand-teal text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-teal/90 h-[42px] flex items-center justify-center gap-2 shadow-lg shadow-brand-teal/20">
                        <Save size={18} /> Spara
                    </button>
                </form>
            )}

            <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 text-xs uppercase tracking-widest font-bold">
                        <tr>
                            <th className="px-6 py-4">Kod</th>
                            <th className="px-6 py-4">Rabatt</th>
                            <th className="px-6 py-4">Användning</th>
                            <th className="px-6 py-4">Skapad</th>
                            <th className="px-6 py-4 text-right">Åtgärder</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {promoCodes.map(promo => (
                            <tr key={promo.id} className={`hover:bg-gray-50 dark:hover:bg-white/5 ${!promo.isActive && 'opacity-50'}`}>
                                <td className="px-6 py-4 font-mono font-bold text-brand-purple text-lg">{promo.code}</td>
                                <td className="px-6 py-4 font-bold dark:text-white">
                                    {promo.discountValue} {promo.discountType === 'PERCENTAGE' ? '%' : 'kr'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {promo.currentUses} st använda
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(promo.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => toggleStatus(promo.id)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                    >{promo.isActive ? 'Aktiv' : 'Inaktiv'}</button>
                                    <button onClick={() => deleteCode(promo.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const SalesDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="p-8">
            <h1 className="text-2xl font-black mb-6 flex items-center gap-3 dark:text-white">
                <Store className="text-brand-teal" /> Butiksadministration
            </h1>

            <div className="flex border-b border-gray-200 dark:border-white/10 mb-8 bg-white dark:bg-[#1a1b1d] rounded-t-2xl px-4 pt-4">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-4 px-4 font-bold text-sm flex items-center gap-2 transition-colors ${activeTab === 'overview' ? 'border-b-2 border-brand-teal text-brand-teal' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
                ><CreditCard size={18} /> Översikt & Ordrar</button>
                <button
                    onClick={() => setActiveTab('courses')}
                    className={`pb-4 px-4 font-bold text-sm flex items-center gap-2 transition-colors ${activeTab === 'courses' ? 'border-b-2 border-brand-teal text-brand-teal' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
                ><BookOpen size={18} /> Kurser & Priser</button>
                <button
                    onClick={() => setActiveTab('promocodes')}
                    className={`pb-4 px-4 font-bold text-sm flex items-center gap-2 transition-colors ${activeTab === 'promocodes' ? 'border-b-2 border-brand-teal text-brand-teal' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
                ><Percent size={18} /> Rabattkoder</button>
            </div>

            {activeTab === 'overview' && <SalesOverview />}
            {activeTab === 'courses' && <SalesCourses />}
            {activeTab === 'promocodes' && <SalesPromoCodes />}
        </div>
    );
};

export default SalesDashboard;
