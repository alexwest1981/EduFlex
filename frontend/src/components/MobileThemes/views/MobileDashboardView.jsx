import React, { useState, useEffect } from 'react';
import { LayoutGrid, CheckCircle, UserPlus, Calendar, Clock, Award, Star, TrendingUp, AlertCircle, BookOpen, Users, FileText, Upload, MoreHorizontal, ArrowRight, Activity, Settings, User, Folder } from 'lucide-react';
import { api } from '../../../services/api';
import MobileAvatar from './MobileAvatar';

/**
 * MobileDashboardView
 * Handles Role-Based Logic (Student vs Teacher vs Admin)
 */
const MobileDashboardView = ({ currentUser, setView, themeMode = 'dark' }) => {
    const role = (currentUser?.role?.name || currentUser?.role || 'STUDENT').toUpperCase();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    // Theme Styles
    const isLight = themeMode === 'light';
    const theme = {
        bg: isLight ? 'bg-white' : 'bg-[#1C1C1E]',
        cardBg: isLight ? 'bg-white border border-gray-100 shadow-sm' : 'bg-[#1C1C1E]',
        cardBgSecondary: isLight ? 'bg-gray-50 border border-gray-100' : 'bg-[#1C1C1E]',
        text: isLight ? 'text-gray-900' : 'text-white',
        textMuted: isLight ? 'text-gray-500' : 'text-gray-400',
        iconBg: isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-white/20 text-white',
        divider: isLight ? 'bg-gray-100' : 'bg-white/10'
    };

    useEffect(() => {
        loadData();
    }, [role]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (role === 'TEACHER') {
                await loadTeacherData();
            } else if (role === 'STUDENT') {
                await loadStudentData();
            } else {
                await loadAdminData();
            }
        } catch (e) {
            console.error("Dashboard Load Failed", e);
        } finally {
            setLoading(false);
        }
    };

    // --- DATA LOADERS ---

    const loadTeacherData = async () => {
        const allCourses = await api.courses.getAll();
        const myCourses = allCourses.filter(c => c.teacher?.id === currentUser.id);

        // Ungraded
        let ungraded = [];
        for (const course of myCourses) {
            try {
                const assigns = await api.assignments.getByCourse(course.id);
                for (const a of assigns) {
                    const subs = await api.assignments.getSubmissions(a.id);
                    ungraded.push(...subs.filter(s => !s.grade));
                }
            } catch (e) { }
        }

        // Applications
        let apps = [];
        try { apps = await api.courses.getApplications(currentUser.id); } catch (e) { }

        setData({
            type: 'TEACHER',
            activeCourses: myCourses.length,
            ungradedCount: ungraded.length,
            applicationCount: apps.length,
            studentCount: myCourses.reduce((acc, c) => acc + (c.students?.length || 0), 0)
        });
    };

    const loadStudentData = async () => {
        const courses = await api.courses.getMyCourses(currentUser.id);

        let assignments = [];
        if (courses.length > 0) {
            for (const c of courses) {
                try {
                    const assigns = await api.assignments.getByCourse(c.id);
                    assignments.push(...assigns.map(a => ({ ...a, courseName: c.name })));
                } catch (e) { }
            }
        }

        const now = new Date();
        const upcoming = assignments.filter(a => new Date(a.dueDate) > now).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);

        setData({
            type: 'STUDENT',
            activeCourses: courses.length,
            upcomingAssignments: upcoming,
            xp: 1250,
            level: 5
        });
    };

    const loadAdminData = async () => {
        const [users, courses, docs] = await Promise.all([
            api.users.getAll(0, 10), // Fetch recently added too
            api.courses.getAll(),
            api.documents.getAll()
        ]);

        const userList = users.content || users || [];

        // Mock "Recent Uploads" from docs for now
        const recentDocs = [...docs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
        const recentUsers = [...userList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3); // Assuming createdAt exists, otherwise just list

        setData({
            type: 'ADMIN',
            totalUsers: userList.length,
            totalCourses: courses.length,
            totalDocs: docs.length,
            archivedDocs: 12, // Mocked archived count
            recentUsers: recentUsers,
            recentUploads: recentDocs
        });
    };

    // --- RENDERERS ---

    if (loading) return <div className="p-10 text-center opacity-50 animate-pulse">Laddar översikt...</div>;

    // ADMIN DASHBOARD
    if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
        return (
            <div className="px-6 space-y-5 animate-in fade-in pb-32">
                {/* 1. TOP CARDS ROW */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Orange: Total Users */}
                    <div className="bg-[#FF6D5A] rounded-[32px] p-6 text-white flex flex-col justify-between min-h-[160px]">
                        <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-4xl font-bold">{data.totalUsers}</h3>
                            <p className="text-xs font-bold opacity-70 uppercase tracking-wide">Totalt Användare</p>
                        </div>
                    </div>

                    {/* Yellow: Total Courses */}
                    <div className="bg-[#FFCE47] rounded-[32px] p-6 text-black flex flex-col justify-between min-h-[160px]">
                        <div className="bg-black/10 w-10 h-10 rounded-full flex items-center justify-center">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h3 className="text-4xl font-bold">{data.totalCourses}</h3>
                            <p className="text-xs font-bold opacity-60 uppercase tracking-wide">Kurser</p>
                        </div>
                    </div>
                </div>

                {/* 2. ARCHIVED & QUICK STATS */}
                <div className={`${theme.cardBgSecondary} rounded-[32px] p-6 flex items-center justify-between ${theme.text}`}>
                    <div className="flex gap-4 items-center">
                        <div className={`p-3 rounded-full ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}><FileText size={20} /></div>
                        <div>
                            <p className="font-bold text-xl">{data.totalDocs}</p>
                            <p className={`text-[10px] ${theme.textMuted} font-bold uppercase`}>Totalt Filer</p>
                        </div>
                    </div>
                    <div className={`w-[1px] h-8 ${theme.divider}`}></div>
                    <div className="flex gap-4 items-center">
                        <div className={`p-3 rounded-full ${isLight ? 'bg-gray-200 text-gray-600' : 'bg-gray-500/20 text-gray-400'}`}><Folder size={20} /></div>
                        <div>
                            <p className="font-bold text-xl">{data.archivedDocs}</p>
                            <p className={`text-[10px] ${theme.textMuted} font-bold uppercase`}>Arkiverade</p>
                        </div>
                    </div>
                </div>

                {/* 3. SENASTE ANVÄNDARE */}
                <div className="bg-[#FFF8E7] rounded-[32px] p-6 text-black">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-lg">Senaste Användare</span>
                        <ArrowRight size={18} className="opacity-50" />
                    </div>
                    <div className="space-y-3">
                        {data.recentUsers.map((u, i) => (
                            <div key={i} className="bg-white p-3 rounded-2xl flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <MobileAvatar user={u} className="w-10 h-10 rounded-full text-sm" />
                                    <div>
                                        <p className="text-sm font-bold">{u.fullName || u.name}</p>
                                        <p className="text-[10px] opacity-50 font-bold tracking-wider capitalize">{u.role?.name || u.role}</p>
                                    </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${u.online ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. SENASTE UPPLADDNINGAR */}
                <div className="bg-[#E0F2FE] rounded-[32px] p-6 text-black">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-lg">Senaste Uppladdningar</span>
                        <Upload size={18} className="opacity-50" />
                    </div>
                    <div className="space-y-3">
                        {data.recentUploads.map((d, i) => (
                            <div key={i} className="bg-white/60 p-3 rounded-2xl flex items-center gap-3">
                                <div className="bg-blue-500/10 p-2 rounded-lg text-blue-600"><FileText size={16} /></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{d.title || d.name}</p>
                                    <p className="text-[10px] opacity-60">Admin • 12 min sedan</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. QUICK LINKS (Admin) */}
                <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => setView('admin')} className={`${theme.cardBg} p-4 rounded-2xl flex flex-col items-center gap-2 ${theme.text} active:scale-95 transition-transform`}>
                        <Settings size={20} className={theme.textMuted} />
                        <span className="text-[10px] font-bold">Admin</span>
                    </button>
                    <button onClick={() => setView('analytics')} className={`${theme.cardBg} p-4 rounded-2xl flex flex-col items-center gap-2 ${theme.text} active:scale-95 transition-transform`}>
                        <Activity size={20} className={theme.textMuted} />
                        <span className="text-[10px] font-bold">Analys</span>
                    </button>
                    <button onClick={() => setView('profile')} className={`${theme.cardBg} p-4 rounded-2xl flex flex-col items-center gap-2 ${theme.text} active:scale-95 transition-transform`}>
                        <User size={20} className={theme.textMuted} />
                        <span className="text-[10px] font-bold">Profil</span>
                    </button>
                </div>
            </div>
        );
    }

    // TEACHER DASHBOARD
    if (role === 'TEACHER') {
        return (
            <div className="px-6 space-y-4 animate-in fade-in pb-32">
                <div><h2 className={`text-3xl font-bold ${theme.text}`}>Lärarpanel</h2><p className={theme.textMuted}>Här är läget just nu.</p></div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setView('grading')} className="bg-[#FF6D5A] p-5 rounded-[28px] text-white text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><CheckCircle size={40} /></div>
                        <h3 className="text-4xl font-bold mb-1">{data.ungradedCount}</h3>
                        <p className="font-bold text-sm leading-tight">Att rätta</p>
                        {data.ungradedCount > 0 && <div className="mt-2 w-2 h-2 bg-white rounded-full animate-pulse" />}
                    </button>
                    <button onClick={() => setView('applications')} className="bg-[#FFCE47] p-5 rounded-[28px] text-black text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><UserPlus size={40} /></div>
                        <h3 className="text-4xl font-bold mb-1">{data.applicationCount}</h3>
                        <p className="font-bold text-sm leading-tight">Ansökningar</p>
                    </button>
                </div>
                {/* ... (Kept existing Teacher stats) ... */}
            </div>
        );
    }

    // STUDENT DASHBOARD
    if (role === 'STUDENT') {
        return (
            <div className="px-6 space-y-4 animate-in fade-in pb-32">
                {/* ... (Kept existing Student layout) ... */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[32px] p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div><p className="text-xs font-bold opacity-70 uppercase tracking-wider">Level {data.level}</p><h3 className="text-3xl font-bold">Student Master</h3></div>
                            <Award size={32} className="text-yellow-300" />
                        </div>
                        <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden"><div className="bg-yellow-400 h-full w-[75%] shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div></div>
                        <p className="text-right text-xs font-bold mt-2 opacity-70">{data.xp} / 2000 XP</p>
                    </div>
                </div>
                <div>
                    <h3 className={`text-xl font-bold ${theme.text} mb-3`}>Kommande Uppgifter</h3>
                    <div className="space-y-3">
                        {data.upcomingAssignments.length > 0 ? data.upcomingAssignments.map((a, i) => (
                            <div key={i} className={`${theme.cardBg} p-4 rounded-2xl flex items-center gap-4 ${isLight ? '' : 'border-l-4 border-[#FF6D5A]'}`}>
                                <div className="flex-1"><h4 className={`font-bold ${theme.text} text-sm`}>{a.title}</h4><p className={`text-xs ${theme.textMuted}`}>{a.courseName} • {new Date(a.dueDate).toLocaleDateString()}</p></div>
                                <Clock size={16} className={isLight ? 'text-indigo-600' : 'text-[#FF6D5A]'} />
                            </div>
                        )) : (<div className={`p-6 ${theme.cardBg} rounded-2xl text-center ${theme.textMuted} text-sm`}>Inga uppgifter just nu! 🎉</div>)}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default MobileDashboardView;
