import React, { useState, useEffect } from 'react';
import {
    Users, BookOpen, FileText, Settings, Plus, Trash2, Search,
    Save, X, Upload, Edit2, Mail, UserCheck, UserX,
    Moon, Cpu, Activity, Phone, MapPin, Badge
} from 'lucide-react';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';

// Moduler
import { QuizModuleMetadata } from '../../modules/quiz-runner/QuizModule';
import { AssignmentsModuleMetadata } from '../../modules/assignments/AssignmentsModule';
import { ForumModuleMetadata } from '../../modules/forum/ForumModule';
import { ChatModuleMetadata } from '../../modules/chat/ChatModule';
import { GamificationModuleMetadata } from '../../modules/gamification/GamificationModule';
import { useModules } from '../../context/ModuleContext';
import UserImport from './UserImport';

const AdminPanel = ({ currentUser }) => {
    const { t } = useTranslation();
    const { systemSettings, updateSystemSetting } = useAppContext();
    const { isModuleActive, refreshModules } = useModules();

    const handleToggleModule = async (moduleId, isActive) => {
        try {
            await api.modules.toggle(moduleId, isActive);
            // Wait a bit or optimistic update? Refresh modules after toggle
            await refreshModules();
        } catch (e) {
            console.error("Failed to toggle module", e);
            alert("Kunde inte ändra modulstatus");
        }
    };

    // --- DATA STATE ---
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [allDocuments, setAllDocuments] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]); // NYTT: För dynamiska roller

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // --- UI STATES ---
    const [adminTab, setAdminTab] = useState('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Forms & Modals
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUserCourses, setViewingUserCourses] = useState(null);
    const [isRegisteringUser, setIsRegisteringUser] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // FIX: Lade till ssn, phone, address i state
    const [registerForm, setRegisterForm] = useState({
        firstName: '', lastName: '', email: '', username: '', password: '',
        role: 'STUDENT', ssn: '', phone: '', address: ''
    });

    const [isCreatingCourse, setIsCreatingCourse] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [courseForm, setCourseForm] = useState({
        name: '', courseCode: '', category: 'IT', description: '',
        startDate: '', endDate: '', teacherId: '', isOpen: true
    });

    const COURSE_CATEGORIES = ["IT & Teknik", "Ekonomi", "Design", "Språk", "Ledarskap", "Hälsa", "Övrigt"];
    const inputClass = "w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-colors bg-white border-gray-300 text-gray-900 dark:bg-[#131314] dark:border-[#3c4043] dark:text-white";
    const labelClass = "text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block";

    const modules = [
        { id: 'dark_mode_enabled', name: 'Dark Mode Core', description: 'Globalt mörkt tema.', version: 'v2.4.0', icon: <Moon size={24} className="text-indigo-500" />, isCore: true },
        { ...QuizModuleMetadata, icon: <QuizModuleMetadata.icon size={24} className="text-purple-500" /> },
        { ...AssignmentsModuleMetadata, icon: <AssignmentsModuleMetadata.icon size={24} className="text-blue-500" /> },
        { ...ForumModuleMetadata, icon: <ForumModuleMetadata.icon size={24} className="text-pink-500" /> },
        { ...ChatModuleMetadata, icon: <ChatModuleMetadata.icon size={24} className="text-green-500" /> },
        { ...GamificationModuleMetadata, icon: <GamificationModuleMetadata.icon size={24} className="text-amber-500" /> },
    ];

    // --- DATA FETCHING ---
    useEffect(() => {
        fetchData();
        fetchUsers(0);
    }, []);

    const fetchUsers = async (page = 0) => {
        try {
            const uData = await api.users.getAll(page, 20);
            if (uData.content) {
                setUsers(uData.content);
                setTotalPages(uData.totalPages);
                setCurrentPage(uData.number);
            } else {
                setUsers(Array.isArray(uData) ? uData : []);
                setTotalPages(1);
            }
        } catch (e) {
            console.error("Kunde inte hämta användare", e);
        }
    };

    const fetchData = async () => {
        try {
            const [cData, dData, rData] = await Promise.all([
                api.courses.getAll(),
                api.documents.getAll(),
                api.roles.getAll() // Hämta dynamiska roller
            ]);
            setCourses(cData);
            setAllDocuments(dData);
            setAvailableRoles(rData || []);
        } catch (e) {
            console.error("Kunde inte hämta admin-data", e);
        }
    };

    // --- USER ACTIONS ---
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Använd api.users.register (enligt din api.js)
            await api.users.register(registerForm);
            alert("Användare skapad!");
            setIsRegisteringUser(false);
            // Rensa alla fält
            setRegisterForm({
                firstName: '', lastName: '', email: '', username: '', password: '',
                role: 'STUDENT', ssn: '', phone: '', address: ''
            });
            fetchUsers(0);
        } catch (e) {
            console.error(e);
            alert("Kunde inte skapa användare. Kontrollera att alla fält är korrekta.");
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editingUser) return;
        try {
            await api.users.update(editingUser.id, editingUser);
            alert("Användare uppdaterad!");
            setEditingUser(null);
            fetchUsers(currentPage);
        } catch (e) { alert("Kunde inte uppdatera."); }
    };

    const handleAttemptDeleteUser = async (user) => {
        if (!confirm(`Är du säker på att du vill ta bort ${user.fullName}?`)) return;
        try {
            await api.users.delete(user.id);
            setUsers(prev => prev.filter(u => u.id !== user.id));
        } catch (e) { alert("Kunde inte ta bort användare."); }
    };

    const handleGenerateUsernames = () => {
        const base = (registerForm.firstName.substring(0, 3) + registerForm.lastName.substring(0, 3)).toLowerCase();
        setRegisterForm(prev => ({ ...prev, username: base + Math.floor(Math.random() * 1000) }));
    };

    // --- COURSE ACTIONS ---
    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...courseForm, teacherId: courseForm.teacherId };
            if (editingCourseId) await api.courses.update(editingCourseId, payload);
            else await api.courses.create(payload, courseForm.teacherId);
            setIsCreatingCourse(false); setEditingCourseId(null);
            setCourseForm({ name: '', courseCode: '', category: 'IT', description: '', startDate: '', endDate: '', teacherId: '', isOpen: true });
            fetchData();
        } catch (e) { alert("Fel vid sparande."); }
    };

    const handleDeleteCourse = async (id) => {
        if (!confirm("Radera kurs?")) return;
        try { await api.courses.delete(id); fetchData(); } catch (e) { alert("Kunde inte radera."); }
    };

    const startEditCourse = (c) => {
        setCourseForm({
            name: c.name,
            courseCode: c.courseCode || '',
            category: c.category || 'Övrigt',
            description: c.description || '',
            startDate: c.startDate || '',
            endDate: c.endDate || '',
            teacherId: c.teacher?.id || '',
            isOpen: c.isOpen
        });
        setEditingCourseId(c.id);
        setIsCreatingCourse(true);
    };

    // --- CONTENT ACTIONS ---
    const handleAdminUpload = async (file, title) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        try {
            const token = localStorage.getItem('token');
            await fetch('http://127.0.0.1:8080/api/documents/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            alert("Fil uppladdad!");
            fetchData();
        } catch (e) { alert("Uppladdning misslyckades."); }
    };

    const handleDeleteDoc = async (id) => {
        if (!confirm("Radera fil?")) return;
        try { await api.documents.delete(id); fetchData(); } catch (e) { alert("Fel vid radering."); }
    };

    // --- FILTERS ---
    const filteredUsers = users.filter(u => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = (u.fullName || "").toLowerCase().includes(search) || (u.username || "").toLowerCase().includes(search) || (u.email || "").toLowerCase().includes(search);
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        const isActive = u.isActive !== false;
        const matchesStatus = statusFilter === 'ALL' ? true : statusFilter === 'ACTIVE' ? isActive : !isActive;
        return matchesSearch && matchesRole && matchesStatus;
    });
    const filteredCourses = courses.filter(c => (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (c.courseCode || "").toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredDocs = allDocuments ? allDocuments.filter(d => (d.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || (d.filename || "").toLowerCase().includes(searchTerm.toLowerCase())) : [];

    // --- MODALS (Inner components) ---
    const UserEditModal = () => {
        if (!editingUser) return null;
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-[#1E1F20] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50 dark:bg-[#131314]">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Redigera Användare</h3>
                        <button onClick={() => setEditingUser(null)}><X size={20} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" /></button>
                    </div>
                    <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelClass}>Förnamn</label><input className={inputClass} value={editingUser.firstName} onChange={e => setEditingUser({ ...editingUser, firstName: e.target.value })} /></div>
                            <div><label className={labelClass}>Efternamn</label><input className={inputClass} value={editingUser.lastName} onChange={e => setEditingUser({ ...editingUser, lastName: e.target.value })} /></div>
                        </div>
                        <div><label className={labelClass}>Email</label><input className={inputClass} value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} /></div>

                        {/* Redigera SSN och Adress också */}
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelClass}>Personnummer</label><input className={inputClass} value={editingUser.ssn || ''} onChange={e => setEditingUser({ ...editingUser, ssn: e.target.value })} /></div>
                            <div><label className={labelClass}>Telefon</label><input className={inputClass} value={editingUser.phone || ''} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} /></div>
                        </div>
                        <div><label className={labelClass}>Adress</label><input className={inputClass} value={editingUser.address || ''} onChange={e => setEditingUser({ ...editingUser, address: e.target.value })} /></div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className={labelClass}>Roll</label>
                                <select
                                    className={inputClass}
                                    value={editingUser.role}
                                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                >
                                    {availableRoles && availableRoles.length > 0 ? (
                                        availableRoles.map(r => (
                                            <option key={r.id} value={r.name}>{r.name}</option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="STUDENT">Elev</option>
                                            <option value="TEACHER">Lärare</option>
                                            <option value="ADMIN">Administratör</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div><label className={labelClass}>Status</label><div className="flex items-center gap-2 mt-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-[#282a2c]" onClick={() => setEditingUser({ ...editingUser, isActive: !editingUser.isActive })}><div className={`w-10 h-5 rounded-full shadow-inner transition-colors relative ${editingUser.isActive ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'}`}><div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editingUser.isActive ? 'translate-x-5' : 'translate-x-0'}`}></div></div><span className="text-sm font-medium text-gray-700 dark:text-gray-300">{editingUser.isActive ? 'Aktiv' : 'Inaktiverad'}</span></div></div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-[#3c4043] mt-4">
                            <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 bg-gray-200 dark:bg-[#3c4043] text-gray-700 dark:text-white rounded-lg text-sm font-bold hover:bg-gray-300 dark:hover:bg-[#505357]">Avbryt</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Spara ändringar</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const UserCoursesModal = () => {
        if (!viewingUserCourses) return null;
        const userCourses = courses.filter(c => { if (viewingUserCourses.role === 'TEACHER') return c.teacher?.id === viewingUserCourses.id; return c.students?.some(s => s.id === viewingUserCourses.id); });
        return (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in"><div className="bg-white dark:bg-[#1E1F20] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden"><div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center bg-gray-50 dark:bg-[#131314]"><h3 className="text-lg font-bold text-gray-900 dark:text-white">Kurser för {viewingUserCourses.fullName}</h3><button onClick={() => setViewingUserCourses(null)}><X size={20} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" /></button></div><div className="p-6 max-h-[60vh] overflow-y-auto">{userCourses.length === 0 ? <div className="text-center text-gray-500 dark:text-gray-400 py-8"><BookOpen size={32} className="mx-auto mb-2 opacity-50" /><p>Inga kurser hittades.</p></div> : <div className="space-y-3">{userCourses.map(c => (<div key={c.id} className="p-3 bg-gray-50 dark:bg-[#282a2c] rounded-xl border border-gray-100 dark:border-[#3c4043] flex justify-between items-center"><div><div className="font-bold text-gray-900 dark:text-white">{c.name}</div><div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{c.courseCode || 'Ingen kod'}</div></div><span className={`text-xs px-2 py-1 rounded-full font-bold ${viewingUserCourses.role === 'TEACHER' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>{viewingUserCourses.role === 'TEACHER' ? 'Lärare' : 'Deltagare'}</span></div>))}</div>}</div><div className="p-4 border-t border-gray-100 dark:border-[#3c4043] flex justify-end"><button onClick={() => setViewingUserCourses(null)} className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold hover:opacity-90">Stäng</button></div></div></div>);
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Administration</h1>
                <p className="text-gray-500 dark:text-gray-400">Total kontroll över plattformen.</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-[#282a2c] pb-1">
                {['users', 'courses', 'content', 'settings'].map(tab => (
                    <button key={tab} onClick={() => setAdminTab(tab)} className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors flex items-center gap-2 capitalize ${adminTab === tab ? 'bg-gray-100 dark:bg-[#282a2c] text-indigo-600 dark:text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        {tab === 'users' ? 'Användare' : tab === 'courses' ? 'Kurser' : tab === 'content' ? 'Innehåll' : 'Inställningar'}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#282a2c] shadow-sm p-6 min-h-[500px]">

                {/* ANVÄNDARE FLIK */}
                {adminTab === 'users' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-[#131314] p-4 rounded-xl border border-gray-100 dark:border-[#3c4043]">
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-2.5 text-gray-400" size={16} /><input placeholder="Sök namn, email..." className={inputClass + " pl-9"} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                                <select className={inputClass + " w-auto"} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="ALL">Alla Roller</option><option value="STUDENT">Elever</option><option value="TEACHER">Lärare</option><option value="ADMIN">Admins</option></select>
                                <select className={inputClass + " w-auto"} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="ALL">Alla Statusar</option><option value="ACTIVE">Aktiva</option><option value="INACTIVE">Inaktiva</option></select>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setIsImporting(!isImporting); setIsRegisteringUser(false); }} className="bg-white dark:bg-[#282a2c] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2 shadow-sm"><Upload size={16} /> Importera (CSV)</button>
                                <button onClick={() => { setIsRegisteringUser(!isRegisteringUser); setIsImporting(false); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap shadow-sm">{isRegisteringUser ? <X size={16} /> : <Plus size={16} />} {isRegisteringUser ? 'Dölj formulär' : 'Ny Användare'}</button>
                            </div>
                        </div>

                        {isImporting && (
                            <UserImport onClose={() => setIsImporting(false)} onSuccess={() => { fetchUsers(0); setIsImporting(false); }} />
                        )}

                        {isRegisteringUser && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/30 animate-in slide-in-from-top-4">
                                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-4">Registrera ny användare</h3>
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input placeholder="Förnamn" className={inputClass} value={registerForm.firstName} onChange={e => setRegisterForm({ ...registerForm, firstName: e.target.value })} required />
                                        <input placeholder="Efternamn" className={inputClass} value={registerForm.lastName} onChange={e => setRegisterForm({ ...registerForm, lastName: e.target.value })} required />
                                        <input placeholder="Email" type="email" className={inputClass} value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} required />

                                        <div className="flex gap-2">
                                            <input placeholder="Användarnamn" className={inputClass} value={registerForm.username} onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })} required />
                                            <button type="button" onClick={handleGenerateUsernames} className="bg-white dark:bg-[#282a2c] px-3 rounded-lg text-xs font-bold border border-gray-300 dark:border-[#3c4043] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#3c4043]">Förslag</button>
                                        </div>
                                    </div>

                                    {/* FIX: NYA FÄLT FÖR SSN, TELEFON, ADRESS */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input placeholder="Personnummer (ÅÅMMDD-XXXX)" className={inputClass} value={registerForm.ssn} onChange={e => setRegisterForm({ ...registerForm, ssn: e.target.value })} />
                                        <input placeholder="Telefonnummer" className={inputClass} value={registerForm.phone} onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })} />
                                    </div>
                                    <input placeholder="Adress (Gata, Postnr, Ort)" className={inputClass} value={registerForm.address} onChange={e => setRegisterForm({ ...registerForm, address: e.target.value })} />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input placeholder="Lösenord" type="password" className={inputClass} value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} required />
                                        <select
                                            className={inputClass}
                                            value={registerForm.role}
                                            onChange={e => setRegisterForm({ ...registerForm, role: e.target.value })}
                                        >
                                            {availableRoles.length > 0 ? (
                                                availableRoles.map(r => (
                                                    <option key={r.id} value={r.name}>{r.name}</option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="STUDENT">Elev</option>
                                                    <option value="TEACHER">Lärare</option>
                                                    <option value="ADMIN">Administratör</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-sm">Skapa Konto</button>
                                </form>
                            </div>
                        )}

                        <div className="overflow-x-auto border border-gray-200 dark:border-[#3c4043] rounded-xl">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#3c4043]">
                                    <tr><th className="px-4 py-3">Användare</th><th className="px-4 py-3">Personuppgifter</th><th className="px-4 py-3">Roll</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Åtgärder</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                    {filteredUsers.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">Inga användare matchade filtret.</td></tr> : filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-900 dark:text-white">{u.fullName}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                                                <div className="flex items-center gap-1 mb-1"><Mail size={12} /> {u.email}</div>
                                                {/* FIX: Visar SSN och Telefon i listan */}
                                                {u.ssn && <div className="flex items-center gap-1 mb-1"><Badge size={12} /> {u.ssn}</div>}
                                                {u.phone && <div className="flex items-center gap-1"><Phone size={12} /> {u.phone}</div>}
                                            </td>
                                            <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : u.role === 'TEACHER' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>{u.role}</span></td>
                                            <td className="px-4 py-3">{u.isActive !== false ? <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400"><UserCheck size={14} /> Aktiv</span> : <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"><UserX size={14} /> Inaktiv</span>}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => setViewingUserCourses(u)} title="Se kurser" className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3c4043] rounded-lg transition-colors"><BookOpen size={16} /></button>
                                                    <button onClick={() => setEditingUser(u)} title="Redigera" className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                                    {u.id !== currentUser.id && <button onClick={() => handleAttemptDeleteUser(u)} title="Radera" className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-50 hover:opacity-100"><Trash2 size={16} /></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 pt-4">
                                <button
                                    onClick={() => fetchUsers(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className="px-3 py-1 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#3c4043] disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                    Föregående
                                </button>
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-bold">
                                    Sida {currentPage + 1} av {totalPages}
                                </span>
                                <button
                                    onClick={() => fetchUsers(currentPage + 1)}
                                    disabled={currentPage === totalPages - 1}
                                    className="px-3 py-1 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#3c4043] disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                    Nästa
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* KURSER FLIK */}
                {adminTab === 'courses' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Kurshantering</h3>
                            <button onClick={() => { setIsCreatingCourse(!isCreatingCourse); setEditingCourseId(null); setCourseForm({ name: '', courseCode: '', category: 'IT', description: '', startDate: '', endDate: '', teacherId: '', isOpen: true }); }} className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">{isCreatingCourse ? <X size={16} /> : <Plus size={16} />} {isCreatingCourse ? 'Avbryt' : 'Skapa Kurs'}</button>
                        </div>
                        {isCreatingCourse && (
                            <div className="bg-gray-50 dark:bg-[#282a2c] p-6 rounded-xl border border-gray-100 dark:border-[#3c4043] animate-in slide-in-from-top-4">
                                <h4 className="font-bold mb-4 text-gray-800 dark:text-white">{editingCourseId ? 'Redigera kurs' : 'Skapa ny kurs'}</h4>
                                <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1"><label className={labelClass}>Kursnamn</label><input className={inputClass} value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} required /></div>
                                    <div className="col-span-2 md:col-span-1"><label className={labelClass}>Kurskod</label><input className={inputClass} value={courseForm.courseCode} onChange={e => setCourseForm({ ...courseForm, courseCode: e.target.value.toUpperCase() })} /></div>

                                    {/* --- NYA DATUMFÄLT --- */}
                                    <div className="col-span-2 md:col-span-1">
                                        <label className={labelClass}>Startdatum</label>
                                        <input
                                            type="date"
                                            className={inputClass}
                                            value={courseForm.startDate}
                                            onChange={e => setCourseForm({ ...courseForm, startDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className={labelClass}>Slutdatum</label>
                                        <input
                                            type="date"
                                            className={inputClass}
                                            value={courseForm.endDate}
                                            onChange={e => setCourseForm({ ...courseForm, endDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    {/* --------------------- */}

                                    <div className="col-span-2"><label className={labelClass}>Kategori</label><select className={inputClass} value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}>{COURSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                                    <div className="col-span-2"><label className={labelClass}>Beskrivning</label><textarea className={inputClass + " h-24"} value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} /></div>
                                    <div className="col-span-2 md:col-span-1"><label className={labelClass}>Lärare</label><select className={inputClass} value={courseForm.teacherId} onChange={e => setCourseForm({ ...courseForm, teacherId: e.target.value })}><option value="">Välj lärare...</option>{users.filter(u => u.role === 'TEACHER').map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}</select></div>
                                    <div className="col-span-2 md:col-span-1 flex items-center pt-6"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={courseForm.isOpen} onChange={e => setCourseForm({ ...courseForm, isOpen: e.target.checked })} className="w-5 h-5 accent-indigo-600" /> <span className="font-bold text-gray-700 dark:text-gray-300">Öppen för antagning</span></label></div>
                                    <div className="col-span-2 pt-2"><button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold w-full hover:bg-indigo-700">Spara Kurs</button></div>
                                </form>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredCourses.map(c => (
                                <div key={c.id} className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] p-4 rounded-xl flex justify-between items-center group">
                                    <div><h4 className="font-bold text-gray-900 dark:text-white">{c.name}</h4><div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.courseCode} • {c.isOpen ? <span className="text-green-600 dark:text-green-400 font-bold">Öppen</span> : <span className="text-red-600 dark:text-red-400 font-bold">Stängd</span>}</div></div>
                                    <div className="flex gap-2"><button onClick={() => startEditCourse(c)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Settings size={18} /></button><button onClick={() => handleDeleteCourse(c.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18} /></button></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* INNEHÅLL FLIK */}
                {adminTab === 'content' && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2"><Upload size={20} /> Ladda upp global fil</h3>
                            <form onSubmit={(e) => { e.preventDefault(); const file = e.target.file.files[0]; const title = e.target.title.value; if (file && title) handleAdminUpload(file, title); e.target.reset(); }} className="flex gap-4 items-end">
                                <div className="flex-1"><label className={labelClass}>Fil</label><input name="file" type="file" className={inputClass} required /></div>
                                <div className="flex-1"><label className={labelClass}>Titel</label><input name="title" className={inputClass} placeholder="Dokumentnamn" required /></div>
                                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 h-[42px] shadow-sm">Ladda upp</button>
                            </form>
                        </div>
                        <div className="overflow-x-auto">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Alla filer ({filteredDocs.length})</h3>
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#3c4043]">
                                    <tr><th className="px-4 py-3">Titel</th><th className="px-4 py-3">Ägare</th><th className="px-4 py-3 text-right">Åtgärd</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                    {filteredDocs.map(d => (
                                        <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50 transition-colors">
                                            <td className="px-4 py-3 text-gray-900 dark:text-white"><div className="font-medium">{d.title || "Namnlös"}</div>{d.filename && d.filename !== d.title && <div className="text-xs text-gray-500 dark:text-gray-400">{d.filename}</div>}</td>
                                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{d.owner?.fullName || "System"}</td>
                                            <td className="px-4 py-3 text-right"><button onClick={() => handleDeleteDoc(d.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg"><Trash2 size={16} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* INSTÄLLNINGAR FLIK */}
                {adminTab === 'settings' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-2xl p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl"><Settings size={24} /></div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Skolans Profil</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Anpassa namnet som visas i sidomenyn.</p>
                                    <div className="max-w-md">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Skolans Namn (site_name)</label>
                                        <div className="flex gap-2">
                                            <input className={inputClass} defaultValue={systemSettings['site_name'] || ''} placeholder="T.ex. Klinteskolan" onBlur={(e) => updateSystemSetting('site_name', e.target.value)} />
                                            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors">Spara</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold text-gray-900 dark:text-white">Systemmoduler</h3></div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {modules.map((mod) => (
                                    <div key={mod.id} className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#282a2c] group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">{mod.icon}</div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={mod.isCore ? systemSettings[mod.id] === 'true' : isModuleActive(mod.id)}
                                                    onChange={(e) => {
                                                        if (mod.isCore) {
                                                            updateSystemSetting(mod.id, e.target.checked ? 'true' : 'false');
                                                        } else {
                                                            handleToggleModule(mod.id, e.target.checked);
                                                        }
                                                    }}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-gray-700"></div>
                                            </label>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{mod.name}</h4>
                                                {mod.isCore && <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Core</span>}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{mod.description}</p>
                                        </div>
                                        <div className="pt-4 border-t border-gray-100 dark:border-[#3c4043] flex justify-between items-center text-xs font-mono text-gray-400">
                                            <div className="flex items-center gap-1"><Cpu size={12} /> {mod.version}</div>
                                            <div className="flex items-center gap-1.5">
                                                <Activity size={12} className={(mod.isCore ? systemSettings[mod.id] === 'true' : isModuleActive(mod.id)) ? "text-green-500" : "text-gray-400"} />
                                                {(mod.isCore ? systemSettings[mod.id] === 'true' : isModuleActive(mod.id)) ? 'Active' : 'Disabled'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <UserEditModal />
            <UserCoursesModal />
        </div>
    );
};

export default AdminPanel;