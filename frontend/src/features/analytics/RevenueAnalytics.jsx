import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp, CreditCard, CheckCircle, XCircle, Users, Calendar } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../../services/api';

const RevenueAnalytics = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month'); // day, week, month, year

    useEffect(() => {
        fetchRevenueData();
    }, [timeRange]);

    const fetchRevenueData = async () => {
        try {
            const [statsData, paymentsData] = await Promise.all([
                api.get('/payments/stats'),
                api.get('/payments')
            ]);
            setStats(statsData);
            setPayments(paymentsData);
        } catch (error) {
            console.error('Failed to load revenue data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500 font-mono animate-pulse">{t('analytics.loading_revenue_data')}</div>;
    }

    // Payment method distribution
    const paymentMethodData = payments.reduce((acc, payment) => {
        const method = payment.paymentMethod || 'OTHER';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
    }, {});

    const methodChartData = Object.entries(paymentMethodData).map(([name, value]) => ({
        name,
        value
    }));

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    // Revenue trend data (mock - should come from backend with time series)
    const revenueTrendData = [
        { month: 'Jan', revenue: 12000, payments: 45 },
        { month: 'Feb', revenue: 15000, payments: 52 },
        { month: 'Mar', revenue: 18000, payments: 61 },
        { month: 'Apr', revenue: 21000, payments: 68 },
        { month: 'May', revenue: 24000, payments: 75 },
        { month: 'Jun', revenue: 27000, payments: 82 }
    ];

    const kpiCards = [
        {
            title: t('analytics.monthly_recurring_revenue'),
            value: `${stats?.mrr || 0} SEK`,
            change: '+12.5%',
            icon: <DollarSign size={24} />,
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            title: t('analytics.annual_recurring_revenue'),
            value: `${stats?.arr || 0} SEK`,
            change: '+8.2%',
            icon: <TrendingUp size={24} />,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            title: t('analytics.payment_success_rate'),
            value: `${stats?.paymentSuccessRate?.toFixed(1) || 0}%`,
            change: stats?.paymentSuccessRate > 95 ? t('analytics.excellent') : t('analytics.good'),
            icon: <CheckCircle size={24} />,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20'
        },
        {
            title: t('analytics.avg_payment_amount'),
            value: `${stats?.averagePaymentAmount || 0} SEK`,
            change: '+5.3%',
            icon: <CreditCard size={24} />,
            color: 'text-purple-600',
            bg: 'bg-purple-50 dark:bg-purple-900/20'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 animate-in fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <DollarSign className="text-green-600" />
                        {t('analytics.revenue_title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t('analytics.revenue_subtitle')}
                    </p>
                </div>

                {/* Time Range Filter */}
                <div className="inline-flex items-center gap-2 bg-white dark:bg-[#1E1F20] p-1.5 rounded-lg border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <Calendar size={16} className="text-gray-400 ml-2" />
                    {['day', 'week', 'month', 'year'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${timeRange === range
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#282a2c]'
                                }`}
                        >
                            {t(`analytics.${range}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpiCards.map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {card.title}
                                </p>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                                    {card.value}
                                </h3>
                            </div>
                            <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                                {card.icon}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400">
                            <TrendingUp size={12} />
                            {card.change}
                            <span className="text-gray-400 font-normal ml-1">{t('analytics.vs_last_month')}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Revenue Trend */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">
                        {t('analytics.revenue_growth_trend')}
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrendData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', color: '#fff', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Method Distribution */}
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">
                        {t('analytics.payment_methods')}
                    </h3>
                    <div className="h-80 w-full flex items-center justify-center">
                        {methodChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={methodChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {methodChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-sm">{t('analytics.no_payment_data')}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase">{t('analytics.total_payments')}</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">
                                {stats?.totalPaymentsThisMonth || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase">{t('analytics.successful')}</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">
                                {stats?.successfulPaymentsThisMonth || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-red-50 text-red-600 dark:bg-red-900/20">
                            <XCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase">{t('analytics.failed')}</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">
                                {(stats?.totalPaymentsThisMonth || 0) - (stats?.successfulPaymentsThisMonth || 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueAnalytics;
