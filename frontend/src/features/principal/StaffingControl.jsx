import React, { useState, useEffect } from 'react';
import {
    UserCheck,
    UserX,
    Search,
    Calendar,
    Phone,
    Mail,
    BadgeCheck,
    MoreHorizontal,
    Briefcase
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const StaffingControl = () => {
    const [staff, setStaff] = useState([]);
    const [substitutes, setSubstitutes] = useState([
        { id: 1, name: 'Erik Andersson', subjects: ['Svenska', 'Engelska'], rating: 4.8, status: 'AVAILABLE', phone: '070-1234567' },
        { id: 2, name: 'Anna Berg', subjects: ['Matematik', 'NO'], rating: 4.9, status: 'BUSY', phone: '070-7654321' },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            const users = await api.users.getAll();
            // Filter for teachers/admin for this view
            const staffList = users.content.filter(u =>
                u.role?.name?.includes('TEACHER') || u.role?.name?.includes('ADMIN') || u.role === 'TEACHER'
            );
            setStaff(staffList);
        } catch (err) {
            toast.error('Kunde inte hämta personallista');
        } finally {
            setLoading(false);
        }
    };

    const toggleSickLeave = async (userId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'SICK' ? 'WORKING' : 'SICK';
            await api.users.update(userId, { staffStatus: newStatus });
            toast.success(newStatus === 'SICK' ? 'Sjukanmäld registrerad' : 'Friskanmäld registrerad');
            loadStaff();
        } catch (err) {
            toast.error('Kunde inte uppdatera status');
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Personal & Bemanning</h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Resursplanering • Vikariepool • Frånvaro</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Staff List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-lg font-black underline decoration-indigo-500 underline-offset-4">Aktuell Personalstatus</h2>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                                    <UserCheck size={12} /> {staff.filter(s => s.staffStatus !== 'SICK').length} I tjänst
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                                    <UserX size={12} /> {staff.filter(s => s.staffStatus === 'SICK').length} Frånvarande
                                </span>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                            {staff.map((member) => (
                                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${member.staffStatus === 'SICK' ? 'bg-red-400' : 'bg-indigo-600'}`}>
                                            {member.username?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{member.username}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{member.role?.name || 'Personal'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleSickLeave(member.id, member.staffStatus)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${member.staffStatus === 'SICK'
                                                    ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'
                                                }`}
                                        >
                                            {member.staffStatus === 'SICK' ? 'Sjukanmäld' : 'Sjukanmäl'}
                                        </button>
                                        <button className="p-2 text-gray-300 hover:text-gray-600">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Substitute Pool */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                        <Briefcase className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform" size={120} />
                        <h3 className="text-xl font-black mb-2">Vikariepool</h3>
                        <p className="text-xs text-indigo-100 font-bold uppercase tracking-widest mb-6">Lediga resurser för skolan</p>

                        <div className="space-y-4">
                            {substitutes.map((sub) => (
                                <div key={sub.id} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-sm">{sub.name}</p>
                                            <div className="flex gap-1 mt-1">
                                                {sub.subjects.map(s => <span key={s} className="text-[8px] bg-white/20 px-1.5 py-0.5 rounded uppercase font-black">{s}</span>)}
                                            </div>
                                        </div>
                                        <span className={`w-2 h-2 rounded-full ${sub.status === 'AVAILABLE' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex items-center gap-1 text-[10px] font-bold">
                                            <BadgeCheck size={12} className="text-emerald-400" /> {sub.rating}
                                        </div>
                                        <button className="bg-white text-indigo-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                                            Boka NU
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 bg-white/20 rounded-2xl text-sm font-bold hover:bg-white/30 transition-all">
                            Visa hela poolen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffingControl;
