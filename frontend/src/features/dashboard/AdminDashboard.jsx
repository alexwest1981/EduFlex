import React, { useState, useEffect } from 'react';
import {
    Users, Briefcase, FileText, User, Layers, Search,
    Lock, Unlock, File as FileIcon, Loader2, LayoutDashboard,
    BarChart3, MessageSquare, Settings, Plus, X, Save, Calendar, Edit2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import MessageCenter from '../messages/MessageCenter';
import SettingsTab from '../admin/SettingsTab';

// --- MODAL: SKAPA ANVÄNDARE ---
const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
    if (!isOpen) return null;
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', username: '', password: '', role: 'STUDENT' });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onUserCreated();
                onClose();
            } else {
                const errorText = await response.text();
                if (response.status === 401 || response.status === 403) {
                    setErrorMsg("Behörighet saknas. Kontrollera Admin-rättigheter.");
                } else {
                    setErrorMsg(`Fel: ${errorText || response.status}`);
                }
            }
        } catch (error) {
            setErrorMsg("Kunde inte ansluta till servern.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Registrera ny användare</h3>
                    <button onClick={onClose}><X className="text-gray-500" size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorMsg && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">{errorMsg}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Förnamn</label>
                            <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                   value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Efternamn</label>
                            <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                   value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Användarnamn</label>
                        <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                               value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                        <input required type="email" className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                               value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Lösenord</label>
                        <input required type="password" className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                               value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Roll</label>
                        <select className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Lärare</option>
                            <option value="ADMIN">Administratör</option>
                        </select>
                    </div>
                    <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg mt-2">
                        {loading ? 'Sparar...' : 'Skapa Användare'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- MODAL: SKAPA KURS ---
const CreateCourseModal = ({ isOpen, onClose, onCourseCreated, teachers }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        name: '',
        courseCode: '',
        description: '',
        category: 'Programmering',
        teacherId: '',
        startDate: '',
        endDate: '',
        color: 'bg-indigo-600',
        maxStudents: 30 // Standardvärde
    });

    const [loading, setLoading] = useState(false);

    const colors = [
        { name: 'Indigo', value: 'bg-indigo-600' },
        { name: 'Röd', value: 'bg-red-600' },
        { name: 'Grön', value: 'bg-emerald-600' },
        { name: 'Blå', value: 'bg-blue-600' },
        { name: 'Orange', value: 'bg-orange-500' },
        { name: 'Lila', value: 'bg-purple-600' },
        { name: 'Rosa', value: 'bg-pink-600' },
        { name: 'Svart', value: 'bg-gray-800' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:8080/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    courseCode: formData.courseCode,
                    category: formData.category,
                    description: formData.description,
                    teacherId: formData.teacherId || 1,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    color: formData.color,
                    maxStudents: parseInt(formData.maxStudents) // Skicka med antal platser
                })
            });

            if (response.ok) {
                onCourseCreated();
                onClose();
            } else {
                alert("Kunde inte skapa kursen.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Skapa ny kurs</h3>
                    <button onClick={onClose}><X className="text-gray-500" size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Kursnamn</label>
                        <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                               value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="T.ex. Java Grundkurs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Kurskod</label>
                            <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                   value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value})} placeholder="T.ex. JAV101" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Kategori</label>
                            <input className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                   value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="T.ex. Data" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Startdatum</label>
                            <input type="date" className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white text-sm"
                                   value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Slutdatum</label>
                            <input type="date" className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white text-sm"
                                   value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                        </div>
                    </div>

                    {/* NYTT: Max antal platser */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Max antal platser</label>
                        <input type="number" min="1" className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                               value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: e.target.value})} placeholder="30" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Välj Kursfärg</label>
                        <div className="flex gap-2 flex-wrap">
                            {colors.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setFormData({...formData, color: c.value})}
                                    className={`w-8 h-8 rounded-full ${c.value} transition-transform hover:scale-110 ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Ansvarig Lärare</label>
                        <select className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})}>
                            <option value="">Välj lärare...</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Beskrivning</label>
                        <textarea className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white h-20 resize-none"
                                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg mt-2">
                        {loading ? 'Skapar...' : 'Skapa Kurs'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- MODAL: REDIGERA KURS ---
const EditCourseModal = ({ isOpen, onClose, onCourseUpdated, teachers, courseToEdit }) => {
    if (!isOpen || !courseToEdit) return null;

    const [formData, setFormData] = useState({
        name: '',
        courseCode: '',
        category: '',
        description: '',
        teacherId: '',
        startDate: '',
        endDate: '',
        color: '',
        maxStudents: 30
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (courseToEdit) {
            setFormData({
                name: courseToEdit.name || '',
                courseCode: courseToEdit.courseCode || '',
                category: courseToEdit.category || '',
                description: courseToEdit.description || '',
                teacherId: courseToEdit.teacher?.id || '',
                startDate: courseToEdit.startDate || '',
                endDate: courseToEdit.endDate || '',
                color: courseToEdit.color || 'bg-indigo-600',
                maxStudents: courseToEdit.maxStudents || 30 // Ladda in befintligt värde
            });
        }
    }, [courseToEdit]);

    const colors = [
        { name: 'Indigo', value: 'bg-indigo-600' },
        { name: 'Röd', value: 'bg-red-600' },
        { name: 'Grön', value: 'bg-emerald-600' },
        { name: 'Blå', value: 'bg-blue-600' },
        { name: 'Orange', value: 'bg-orange-500' },
        { name: 'Lila', value: 'bg-purple-600' },
        { name: 'Rosa', value: 'bg-pink-600' },
        { name: 'Svart', value: 'bg-gray-800' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:8080/api/courses/${courseToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    maxStudents: parseInt(formData.maxStudents)
                })
            });

            if (response.ok) {
                onCourseUpdated();
                onClose();
            } else {
                alert("Kunde inte uppdatera kursen.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Redigera kurs</h3>
                    <button onClick={onClose}><X className="text-gray-500" size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Kursnamn</label>
                        <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                               value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Kurskod</label>
                            <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                   value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Kategori</label>
                            <input className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                   value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Startdatum</label>
                            <input type="date" className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white text-sm"
                                   value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Slutdatum</label>
                            <input type="date" className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white text-sm"
                                   value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                        </div>
                    </div>

                    {/* NYTT: Max antal platser */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Max antal platser</label>
                        <input type="number" min="1" className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                               value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Välj Kursfärg</label>
                        <div className="flex gap-2 flex-wrap">
                            {colors.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setFormData({...formData, color: c.value})}
                                    className={`w-8 h-8 rounded-full ${c.value} transition-transform hover:scale-110 ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Ansvarig Lärare</label>
                        <select className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})}>
                            <option value="">Välj lärare...</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Beskrivning</label>
                        <textarea className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white h-20 resize-none"
                                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg mt-2">
                        {loading ? 'Spara ändringar' : 'Uppdatera Kurs'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- HUVUDKOMPONENT ---
const AdminDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modals
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCourseModal, setShowCourseModal] = useState(false);

    // Redigering state
    const [showEditCourseModal, setShowEditCourseModal] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const [u, c, d] = await Promise.all([
                api.users.getAll(),
                api.courses.getAll(),
                api.documents.getAll()
            ]);
            setUsers(u);
            setCourses(c);
            setDocuments(d);
        } catch (error) {
            console.error("Kunde inte hämta dashboard-data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const handleEditClick = (course) => {
        setCourseToEdit(course);
        setShowEditCourseModal(true);
    };

    const formatDate = (dateInput) => {
        if (!dateInput) return "-";
        if (Array.isArray(dateInput)) return new Date(dateInput[0], dateInput[1] - 1, dateInput[2]).toLocaleDateString();
        return new Date(dateInput).toLocaleDateString();
    };

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.courseCode && c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'ALL' ? true : filterStatus === 'OPEN' ? c.isOpen : !c.isOpen;
        return matchesSearch && matchesFilter;
    });

    const teachers = users.filter(u => u.role === 'TEACHER' || u.role === 'ADMIN');
    const latestUsers = [...users].reverse().slice(0, 5);
    const latestDocs = [...documents].reverse().slice(0, 5);

    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.live_overview')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('dashboard.realtime_data')}</p>
            </header>

            <div className="flex gap-6 border-b border-gray-200 dark:border-[#3c4043] mb-8 overflow-x-auto">
                {['overview', 'analytics', 'messages', 'settings'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 flex items-center gap-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap capitalize ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        {tab === 'overview' && <LayoutDashboard size={18}/>}
                        {tab === 'analytics' && <BarChart3 size={18}/>}
                        {tab === 'messages' && <MessageSquare size={18}/>}
                        {tab === 'settings' && <Settings size={18}/>}
                        {tab === 'overview' ? 'Översikt' : tab === 'analytics' ? 'Analys' : tab === 'messages' ? 'Meddelanden' : 'Inställningar'}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Stats Cards */}
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex items-center justify-between">
                            <div><p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">{t('dashboard.users')}</p><p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p></div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400"><Users size={24}/></div>
                        </div>
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex items-center justify-between">
                            <div><p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">{t('dashboard.courses')}</p><p className="text-3xl font-bold text-gray-900 dark:text-white">{courses.length}</p></div>
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full text-indigo-600 dark:text-indigo-400"><Briefcase size={24}/></div>
                        </div>
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex items-center justify-between">
                            <div><p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">{t('dashboard.archived_files')}</p><p className="text-3xl font-bold text-gray-900 dark:text-white">{documents.length}</p></div>
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-orange-600 dark:text-orange-400"><FileText size={24}/></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Senaste Användare */}
                        <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><User size={18}/> {t('dashboard.latest_registered')}</h3>
                                <button onClick={() => setShowUserModal(true)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-1"><Plus size={14}/> Ny Användare</button>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                {latestUsers.map(u => (
                                    <div key={u.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors flex justify-between items-center">
                                        <div><p className="font-bold text-sm text-gray-900 dark:text-white">{u.fullName}</p><p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p></div>
                                        <span className="text-[10px] bg-gray-100 dark:bg-[#3c4043] text-gray-600 dark:text-gray-300 px-2 py-1 rounded font-bold uppercase">{u.role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Senaste Filer */}
                        <div className="bg-white dark:bg-[#1E1F20] rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><FileText size={18}/> {t('dashboard.latest_uploads')}</h3>
                                <Link to="/documents" className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded font-bold hover:bg-indigo-100">{t('dashboard.archive')}</Link>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                {latestDocs.map(d => (
                                    <div key={d.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#282a2c] flex justify-between items-center transition-colors">
                                        <div className="flex items-center gap-3">
                                            <FileIcon size={16} className="text-indigo-500"/>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{d.title || d.fileName}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(d.uploadedAt || d.createdAt)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Kursregister */}
                    <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-[#3c4043] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-[#131314]">
                            <div className="flex items-center gap-4">
                                <h3 className="font-bold text-gray-800 dark:text-white">Kursregister</h3>
                                <button onClick={() => setShowCourseModal(true)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-1"><Plus size={14}/> Ny Kurs</button>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:flex-none">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                                    <input className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-[#1E1F20] dark:text-white dark:border-[#3c4043]" placeholder="Sök..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                                </div>
                                <select className="border dark:border-[#3c4043] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                    <option value="ALL">{t('dashboard.all_statuses')}</option>
                                    <option value="OPEN">{t('dashboard.open')}</option>
                                    <option value="CLOSED">{t('dashboard.closed')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 dark:text-gray-400 border-b dark:border-[#3c4043]">
                                <tr><th className="p-4">Status</th><th className="p-4">Kod</th><th className="p-4">Namn</th><th className="p-4">Datum</th><th className="p-4 text-right">Åtgärd</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                {filteredCourses.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${c.color || 'bg-gray-300'}`} title="Kursfärg"></div>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${c.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.isOpen ? 'Öppen' : 'Stängd'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-gray-600 dark:text-gray-400">{c.courseCode}</td>
                                        <td className="p-4 font-bold text-gray-900 dark:text-white">{c.name}</td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400 text-xs">
                                            {formatDate(c.startDate)} - {formatDate(c.endDate)}
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            {/* NY KNAPP: Redigera (pennan) */}
                                            <button onClick={() => handleEditClick(c)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Redigera kurs">
                                                <Edit2 size={16} />
                                            </button>

                                            <button onClick={() => navigate(`/course/${c.id}`)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline px-2 py-1">Hantera</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'analytics' && <AnalyticsDashboard />}
            {activeTab === 'messages' && <MessageCenter />}
            {activeTab === 'settings' && <SettingsTab />}

            <CreateUserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} onUserCreated={fetchStats} />
            <CreateCourseModal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} onCourseCreated={fetchStats} teachers={teachers} />

            {/* Ny modal för redigering */}
            <EditCourseModal
                isOpen={showEditCourseModal}
                onClose={() => setShowEditCourseModal(false)}
                onCourseUpdated={fetchStats}
                teachers={teachers}
                courseToEdit={courseToEdit}
            />
        </div>
    );
};

export default AdminDashboard;