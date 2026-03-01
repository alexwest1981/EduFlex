import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, Users, Download, Search, Filter, Calendar, Award } from 'lucide-react';
import { api } from '../../services/api';

const ComplianceDashboard = () => {
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ active: 0, expiring: 0, expired: 0, total: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCerts = async () => {
            try {
                const data = await api.certifications.getAll();
                setCerts(data);

                // Calculate stats
                const active = data.filter(c => c.status === 'ACTIVE').length;
                const expiring = data.filter(c => c.status === 'EXPIRING_SOON').length;
                const expired = data.filter(c => c.status === 'EXPIRED').length;

                setStats({ active, expiring, expired, total: data.length });
            } catch (err) {
                console.error("Failed to load certifications", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCerts();
    }, []);

    const filteredCerts = certs.filter(c =>
        c.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase"><CheckCircle size={12} /> Giltig</span>;
            case 'EXPIRING_SOON':
                return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase"><AlertTriangle size={12} /> Utgår snart</span>;
            case 'EXPIRED':
                return <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-[10px] font-bold uppercase"><XCircle size={12} /> Utgången</span>;
            default:
                return <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-[10px] font-bold uppercase">{status}</span>;
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Laddar compliance-data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
                        <Shield className="text-brand-blue" /> Compliance Center
                    </h2>
                    <p className="text-gray-500">Övervaka organisationens certifieringar och regelefterlevnad.</p>
                </div>
                <button className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 dark:text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                    <Download size={18} /> Exportera Rapport (PDF)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1a1b1d] p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                    <div className="text-gray-500 text-xs font-bold uppercase mb-1">Totala Certifikat</div>
                    <div className="text-2xl font-black dark:text-white">{stats.total}</div>
                </div>
                <div className="bg-white dark:bg-[#1a1b1d] p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm border-l-4 border-l-green-500">
                    <div className="text-green-600 dark:text-green-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><CheckCircle size={12} /> Giltiga</div>
                    <div className="text-2xl font-black dark:text-white">{stats.active}</div>
                </div>
                <div className="bg-white dark:bg-[#1a1b1d] p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm border-l-4 border-l-yellow-500">
                    <div className="text-yellow-600 dark:text-yellow-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Utgår snart</div>
                    <div className="text-2xl font-black dark:text-white">{stats.expiring}</div>
                </div>
                <div className="bg-white dark:bg-[#1a1b1d] p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm border-l-4 border-l-red-500">
                    <div className="text-red-600 dark:text-red-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><XCircle size={12} /> Utgångna</div>
                    <div className="text-2xl font-black dark:text-white">{stats.expired}</div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a1b1d] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-white/5 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Sök anställd eller certifikat..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-brand-blue rounded-xl outline-none dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Anställd</th>
                                <th className="px-6 py-4">Certifikat / Utbildning</th>
                                <th className="px-6 py-4">Utfärdat</th>
                                <th className="px-6 py-4">Giltigt till</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Åtgärder</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filteredCerts.map(cert => (
                                <tr key={cert.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-xs uppercase">
                                                {cert.user?.firstName?.[0]}{cert.user?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold dark:text-white text-sm">{cert.user?.firstName} {cert.user?.lastName}</div>
                                                <div className="text-xs text-gray-500">{cert.user?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 font-bold dark:text-gray-200 text-sm">
                                            <Award size={14} className="text-brand-gold" />
                                            {cert.title}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-mono">ID: {cert.verifyCode}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(cert.issuedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {cert.expiresAt ? new Date(cert.expiresAt).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={cert.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors" title="Visa Certifiering">
                                            <Award size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredCerts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                                        Inga certifieringar matchar din sökning.
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

export default ComplianceDashboard;
