import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, Send, Download, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

const InvoiceManagement = () => {
    const { t } = useTranslation();
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        paidCount: 0
    });
    const [isExporting, setIsExporting] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false); // Added for the button onClick

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const data = await api.get('/invoices');
            setInvoices(data);
        } catch (error) {
            console.error('Failed to load invoices:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeneratePdf = async (invoiceId) => {
        alert("PDF generation started... (Check console for dummy link)");
        await api.post(`/invoices/${invoiceId}/generate-pdf`);
        fetchInvoices();
    };

    const handleExportCsv = async () => {
        setIsExporting(true);
        try {
            const response = await api.get('/revenue/export/invoices', {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Failed to export CSV:", error);
            alert("Failed to export CSV");
        } finally {
            setIsExporting(false);
        }
    };

    const handleSendReminder = async (id) => {
        if (!confirm(t('invoices.send_reminder_confirm'))) return;
        try {
            await api.post(`/invoices/${id}/send-reminder`);
            alert(t('invoices.reminder_sent'));
            fetchInvoices();
        } catch (error) {
            console.error('Failed to send reminder:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('invoices.delete_confirm'))) return;
        try {
            await api.delete(`/invoices/${id}`);
            fetchInvoices();
        } catch (error) {
            console.error('Failed to delete invoice:', error);
        }
    };

    const handleRefund = async (invoiceId, paymentId) => {
        if (!confirm(t('invoices.refund_confirm'))) return;

        // If paymentId is missing, try to find it from the invoice object (assuming backend provides it)
        // In this current implementation invoice.payment might be an object or id.
        // Based on Invoice.java, it's a @ManyToOne Payment payment. 
        // We need to ensure the invoice object in state has the payment details.

        if (!paymentId) {
            alert(t('invoices.no_payment_details'));
            return;
        }

        try {
            await api.post(`/payments/${paymentId}/refund`);
            alert(t('invoices.refund_success'));
            fetchInvoices();
        } catch (error) {
            console.error('Failed to refund payment:', error);
            alert(t('invoices.refund_failed'));
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            DRAFT: { color: 'bg-gray-100 text-gray-700', icon: <Edit size={14} /> },
            PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={14} /> },
            SENT: { color: 'bg-blue-100 text-blue-700', icon: <Send size={14} /> },
            PAID: { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> },
            OVERDUE: { color: 'bg-red-100 text-red-700', icon: <AlertTriangle size={14} /> },
            CANCELLED: { color: 'bg-gray-100 text-gray-500', icon: <XCircle size={14} /> }
        };
        const badge = badges[status] || badges.DRAFT;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                {badge.icon}
                {t(`invoices.${status.toLowerCase()}`)}
            </span>
        );
    };

    const filteredInvoices = filterStatus === 'ALL'
        ? invoices
        : invoices.filter(inv => inv.status === filterStatus);

    if (isLoading) {
        return <div className="p-8 text-center">{t('invoices.loading')}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            {/* Header / Actions */}
            <div className="flex justify-between items-center bg-white dark:bg-[#1E1F20] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043] mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <FileText className="text-indigo-600 dark:text-indigo-400" /> {t('invoices.title')}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportCsv}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        <Download size={18} /> {isExporting ? t('invoices.exporting') : t('invoices.export_csv')}
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={18} /> {t('invoices.create_invoice')}
                    </button>
                </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['ALL', 'DRAFT', 'PENDING', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filterStatus === status
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-[#282a2c] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3c4043]'
                            }`}
                    >
                        {status} ({status === 'ALL' ? invoices.length : invoices.filter(i => i.status === status).length})
                    </button>
                ))}
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-[#282a2c] border-b border-gray-200 dark:border-[#3c4043]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('invoices.invoice_number')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('invoices.customer')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('invoices.amount')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('invoices.issue_date')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('invoices.due_date')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('invoices.status')}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('invoices.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-[#3c4043]">
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    {t('invoices.no_invoices_found')}
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} className="text-gray-400" />
                                            <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                                                {invoice.invoiceNumber}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white font-bold">
                                            {invoice.user?.fullName || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {invoice.user?.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-black text-gray-900 dark:text-white">
                                            {invoice.amount?.toFixed(2)} {invoice.currency}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                        {new Date(invoice.issueDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                        {new Date(invoice.dueDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(invoice.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex gap-2 justify-end">
                                            {invoice.pdfUrl ? (
                                                <button
                                                    onClick={() => window.open(invoice.pdfUrl, '_blank')}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="View PDF"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleGeneratePdf(invoice.id)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                    title="Generate PDF"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            )}
                                            {invoice.status === 'PAID' && invoice.payment && (
                                                <button
                                                    onClick={() => handleRefund(invoice.id, invoice.payment.id)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                    title="Refund Payment"
                                                >
                                                    <RefreshCw size={16} />
                                                </button>
                                            )}
                                            {invoice.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleSendReminder(invoice.id)}
                                                    className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                    title="Send Reminder"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(invoice.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t('invoices.total_invoices')}</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{invoices.length}</p>
                </div>
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t('invoices.pending')}</p>
                    <p className="text-3xl font-black text-yellow-600">
                        {invoices.filter(i => i.status === 'PENDING').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t('invoices.paid')}</p>
                    <p className="text-3xl font-black text-green-600">
                        {invoices.filter(i => i.status === 'PAID').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t('invoices.overdue')}</p>
                    <p className="text-3xl font-black text-red-600">
                        {invoices.filter(i => i.status === 'OVERDUE').length}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InvoiceManagement;
