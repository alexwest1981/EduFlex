import React, { useState, useEffect } from 'react';
import { Shield, Users, RefreshCw, UserPlus, CheckCircle2, ChevronDown, Download } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const CompanyLicenses = () => {
    const [licenses, setLicenses] = useState([]);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLicense, setSelectedLicense] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [assigning, setAssigning] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [licData, usrData, crsData] = await Promise.all([
                api.get('/licenses'),
                api.users.getAll(0, 500),
                api.courses.getAll()
            ]);

            setLicenses(licData);
            setUsers(Array.isArray(usrData) ? usrData : (usrData?.content || []));
            setCourses(Array.isArray(crsData) ? crsData : (crsData?.content || []));
        } catch (error) {
            console.error("Failed to load company licenses", error);
            toast.error("Kunde inte hämta licenser");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getCourseName = (courseId) => {
        const c = courses.find(crs => crs.id === courseId);
        return c ? c.name : `Kurs #${courseId}`;
    };

    const handleAssign = async () => {
        if (!selectedLicense || !selectedUserId) return;
        setAssigning(true);
        try {
            await api.post(`/licenses/${selectedLicense.id}/assign/${selectedUserId}`);
            toast.success("Plats tilldelad och elev inrullad!");
            setSelectedLicense(null);
            setSelectedUserId('');
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Kunde inte tilldela licens");
        } finally {
            setAssigning(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-4 animate-pulse"><RefreshCw className="animate-spin" size={32} /> Laddar licensdata...</div>;

    const activeLicenses = licenses.filter(l => l.status === 'ACTIVE');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
                        <Shield className="text-brand-gold" /> Företagslicenser
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Hantera edra köpta "Seat Licenses" (platser) och tilldela användare manuellt.</p>
                </div>
            </div>

            {activeLicenses.length === 0 ? (
                <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800">
                    <div className="size-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="text-gray-400" size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Inga aktiva licenser</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">Ni har för närvarande inga köpta licensplatser. Gå till Storefront för att köpa B2B-licenspaket.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {activeLicenses.map((license) => {
                        const availableSeats = license.totalSeats - license.usedSeats;
                        const isExhausted = availableSeats <= 0;
                        const progressPercent = (license.usedSeats / license.totalSeats) * 100;

                        return (
                            <div key={license.id} className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] border border-gray-100 dark:border-gray-800 p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                                {isExhausted && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">Fullsatt</div>
                                )}

                                <div className="flex-1 space-y-6 w-full">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center shrink-0">
                                            <Users className="text-brand-teal" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{getCourseName(license.courseId)}</h3>
                                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono">Order #{license.orderId}</span>
                                                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><CheckCircle2 size={14} /> Aktiv tills {new Date(license.expiresAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Usage Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="text-gray-500 uppercase tracking-widest text-[10px]">Utnyttjandegrad</span>
                                            <span className="dark:text-white">{license.usedSeats} / {license.totalSeats} platser</span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${isExhausted ? 'bg-red-500' : 'bg-brand-teal'}`}
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        {availableSeats > 0 && <p className="text-xs text-brand-teal font-medium mt-1">{availableSeats} lediga platser kvar att tilldela</p>}
                                    </div>
                                </div>

                                <div className="w-full md:w-[350px] shrink-0 bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                                    <h4 className="font-bold text-sm mb-4 flex items-center gap-2 dark:text-white"><UserPlus size={16} className="text-indigo-400" /> Manuell Tilldelning</h4>

                                    {isExhausted ? (
                                        <div className="text-center py-4 text-gray-500 text-sm font-medium">Inga fler platser kan tilldelas.</div>
                                    ) : selectedLicense?.id === license.id ? (
                                        <div className="space-y-3 animate-in fade-in zoom-in-95">
                                            <select
                                                className="w-full bg-white dark:bg-[#1a1b1d] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                                value={selectedUserId}
                                                onChange={(e) => setSelectedUserId(e.target.value)}
                                            >
                                                <option value="">Välj en elev/anställd...</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedLicense(null)}
                                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm transition-colors"
                                                >
                                                    Avbryt
                                                </button>
                                                <button
                                                    onClick={handleAssign}
                                                    disabled={!selectedUserId || assigning}
                                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                                >
                                                    {assigning ? <RefreshCw className="animate-spin" size={16} /> : 'Bekräfta'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedLicense(license)}
                                            className="w-full px-4 py-3 bg-white dark:bg-[#1a1b1d] hover:border-indigo-500 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold transition-all flex items-center justify-between group dark:text-white shadow-sm"
                                        >
                                            Tilldela plats <ChevronDown size={16} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CompanyLicenses;
