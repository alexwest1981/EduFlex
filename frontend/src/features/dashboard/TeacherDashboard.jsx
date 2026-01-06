import React, { useState, useEffect } from 'react';
import {
    Users, BookOpen, Clock, AlertTriangle, Mail, CheckCircle,
    Calendar as CalendarIcon, Search, Filter, MessageSquare,
    ChevronRight, ArrowUpRight, GraduationCap, X, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import MessageCenter from '../messages/MessageCenter';

const TeacherDashboard = ({ currentUser }) => {
    const navigate = useNavigate();

    // --- STATE ---
    const [activeTab, setActiveTab] = useState('OVERVIEW');
    const [isLoading, setIsLoading] = useState(true);

    // Data
    const [myCourses, setMyCourses] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [ungradedSubmissions, setUngradedSubmissions] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    // UI
    const [searchTerm, setSearchTerm] = useState('');
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageRecipient, setMessageRecipient] = useState(null); // Student objekt eller null

    useEffect(() => {
        loadDashboardData();
    }, [currentUser]);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // 1. Hämta alla kurser
            const allCourses = await api.courses.getAll();

            // 2. Filtrera fram mina kurser (där jag är lärare)
            const teacherCourses = allCourses.filter(c => c.teacher?.id === currentUser.id);
            setMyCourses(teacherCourses);

            // 3. Extrahera unika studenter från mina kurser
            const uniqueStudentsMap = new Map();
            teacherCourses.forEach(c => {
                c.students?.forEach(s => {
                    if (!uniqueStudentsMap.has(s.id)) {
                        // Beräkna "risk" baserat på lastLogin
                        const lastLogin = s.lastLogin ? new Date(s.lastLogin) : null;
                        const daysSinceLogin = lastLogin ? Math.floor((new Date() - lastLogin) / (1000 * 60 * 60 * 24)) : 999;

                        uniqueStudentsMap.set(s.id, {
                            ...s,
                            daysSinceLogin,
                            riskLevel: daysSinceLogin > 14 ? 'HIGH' : daysSinceLogin > 7 ? 'MEDIUM' : 'LOW'
                        });
                    }
                });
            });
            setAllStudents(Array.from(uniqueStudentsMap.values()));

            // 4. Hämta inlämningar för mina kurser (för att hitta orättade)
            // (Detta är en förenkling, i ett skarpt läge kanske man har en dedikerad endpoint för detta)
            let ungraded = [];
            let events = [];

            for (const course of teacherCourses) {
                // Hämta assignments
                try {
                    const assignments = await api.assignments.getByCourse(course.id);
                    // Hämta events (schema)
                    // ... (här skulle vi hämta events, vi mockar lite för nu)
                    if (course.startDate) events.push({ date: new Date(course.startDate), title: `Kursstart: ${course.name}`, type: 'START' });

                    // Kolla submission status (kräver API-stöd, vi simulerar orättat om vi inte har endpoint)
                } catch (e) { console.log("Kunde inte hämta detaljer för kurs", course.id); }
            }

            // Sortera events
            setUpcomingEvents(events.sort((a,b) => a.date - b.date));

        } catch (error) {
            console.error("Kunde inte ladda lärarpanelen", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- HJÄLPFUNKTIONER ---
    const getRiskColor = (level) => {
        if (level === 'HIGH') return 'text-red-600 bg-red-50 border-red-200';
        if (level === 'MEDIUM') return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    const handleSendMessage = (student) => {
        setMessageRecipient(student);
        setShowMessageModal(true);
    };

    if (isLoading) return <div className="p-20 text-center text-gray-500">Laddar ditt klassrum...</div>;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in pb-20">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lärarpanel</h1>
                    <p className="text-gray-500 dark:text-gray-400">Översikt för {currentUser.fullName}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowMessageModal(true)} className="bg-white dark:bg-[#1E1F20] text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-[#3c4043] px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors">
                        <Mail size={18}/> Meddelande
                    </button>
                    <button onClick={() => navigate('/courses/create')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                        <BookOpen size={18}/> Skapa Kurs
                    </button>
                </div>
            </div>

            {/* TAB MENY */}
            <div className="flex overflow-x-auto gap-1 border-b border-gray-200 dark:border-[#3c4043] mb-8">
                {[
                    { id: 'OVERVIEW', label: 'Översikt', icon: <ArrowUpRight size={18}/> },
                    { id: 'COURSES', label: 'Mina Kurser', icon: <BookOpen size={18}/> },
                    { id: 'STUDENTS', label: 'Studentuppföljning', icon: <Users size={18}/> },
                    { id: 'GRADING', label: 'Att Rätta', icon: <CheckCircle size={18}/> },
                    { id: 'COMMUNICATION', label: 'Kommunikation', icon: <MessageSquare size={18}/> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap
                            ${activeTab === tab.id
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* --- FLIK: ÖVERSIKT --- */}
            {activeTab === 'OVERVIEW' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                    {/* KPI Kort */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <div className="flex justify-between items-start">
                                <div><p className="text-gray-500 text-xs font-bold uppercase">Aktiva Kurser</p><h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{myCourses.length}</h3></div>
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600"><BookOpen size={24}/></div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <div className="flex justify-between items-start">
                                <div><p className="text-gray-500 text-xs font-bold uppercase">Mina Studenter</p><h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{allStudents.length}</h3></div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600"><Users size={24}/></div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                            <div className="flex justify-between items-start">
                                <div><p className="text-gray-500 text-xs font-bold uppercase">Att Rätta</p><h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">0</h3></div>
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600"><CheckCircle size={24}/></div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm cursor-pointer hover:border-red-300 transition-colors" onClick={() => setActiveTab('STUDENTS')}>
                            <div className="flex justify-between items-start">
                                <div><p className="text-gray-500 text-xs font-bold uppercase">Riskzon</p><h3 className="text-3xl font-black text-red-600 mt-1">{allStudents.filter(s => s.riskLevel === 'HIGH').length}</h3></div>
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600"><AlertTriangle size={24}/></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Kommande händelser */}
                        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CalendarIcon className="text-indigo-600"/> Kommande Schema</h3>
                            <div className="space-y-4">
                                {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 5).map((evt, idx) => (
                                    <div key={idx} className="flex gap-4 items-center p-3 rounded-xl bg-gray-50 dark:bg-[#131314]">
                                        <div className="bg-white dark:bg-[#1E1F20] shadow-sm rounded-lg p-2 text-center min-w-[50px]">
                                            <span className="block text-xs font-bold text-red-500 uppercase">{evt.date.toLocaleString('default', { month: 'short' })}</span>
                                            <span className="block text-lg font-black">{evt.date.getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{evt.title}</h4>
                                            <p className="text-xs text-gray-500">Kommande händelse</p>
                                        </div>
                                    </div>
                                )) : <p className="text-gray-500 text-sm italic">Inga inbokade händelser.</p>}
                            </div>
                        </div>

                        {/* Snabbgenvägar */}
                        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-6">
                            <h3 className="font-bold text-lg mb-4">Genvägar</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => navigate('/calendar')} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-700 dark:text-indigo-300 font-bold text-sm hover:bg-indigo-100 transition-colors text-left">📅 Gå till Kalender</button>
                                <button onClick={() => setActiveTab('STUDENTS')} className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl text-pink-700 dark:text-pink-300 font-bold text-sm hover:bg-pink-100 transition-colors text-left">🎓 Hantera Studenter</button>
                                <button onClick={() => setActiveTab('COURSES')} className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl text-teal-700 dark:text-teal-300 font-bold text-sm hover:bg-teal-100 transition-colors text-left">📚 Mina Kurser</button>
                                <button onClick={() => setShowMessageModal(true)} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-700 dark:text-blue-300 font-bold text-sm hover:bg-blue-100 transition-colors text-left">✉️ Skicka Mail</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FLIK: KURSER --- */}
            {activeTab === 'COURSES' && (
                <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-2 duration-300">
                    {myCourses.map(course => (
                        <div key={course.id} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${course.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{course.isOpen ? 'Öppen' : 'Stängd'}</span>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{course.name}</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-2 line-clamp-1">{course.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                                    <span>KOD: {course.courseCode}</span>
                                    <span>•</span>
                                    <span>{course.students?.length || 0} studenter</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => navigate(`/course/${course.id}`)} className="px-4 py-2 bg-gray-100 dark:bg-[#282a2c] hover:bg-gray-200 text-gray-700 dark:text-white rounded-lg font-bold text-sm">Gå till kurs</button>
                                <button className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm hover:bg-indigo-100">Redigera</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- FLIK: STUDENTER & RISK --- */}
            {activeTab === 'STUDENTS' && (
                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                    <div className="p-4 border-b border-gray-200 dark:border-[#3c4043] bg-gray-50 dark:bg-[#131314] flex justify-between items-center">
                        <h3 className="font-bold">Alla Studenter ({allStudents.length})</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                            <input
                                type="text"
                                placeholder="Sök student..."
                                className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-[#3c4043] text-sm bg-white dark:bg-[#1E1F20] dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 uppercase text-xs font-bold border-b dark:border-[#3c4043]">
                        <tr>
                            <th className="p-4">Namn</th>
                            <th className="p-4">Senast inloggad</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Åtgärd</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                        {allStudents
                            .filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(student => (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{student.fullName}</div>
                                        <div className="text-xs text-gray-500">{student.email}</div>
                                    </td>
                                    <td className="p-4 text-gray-500">{student.daysSinceLogin === 999 ? 'Aldrig' : `${student.daysSinceLogin} dagar sedan`}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getRiskColor(student.riskLevel)}`}>
                                            {student.riskLevel === 'HIGH' ? 'Risk' : student.riskLevel === 'MEDIUM' ? 'Varning' : 'Aktiv'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleSendMessage(student)} className="text-indigo-600 hover:underline font-bold text-xs">Kontakta</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- FLIK: KOMMUNIKATION (Mail) --- */}
            {/* --- FLIK: KOMMUNIKATION --- */}
            {activeTab === 'COMMUNICATION' && (
                <div className="animate-in slide-in-from-bottom-2 duration-300">
                    <MessageCenter preSelectedRecipient={messageRecipient} />
                </div>
            )}

            {/* --- FLIK: RÄTTNING --- */}
            {activeTab === 'GRADING' && (
                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm p-12 text-center animate-in slide-in-from-bottom-2 duration-300">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4"/>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Allt är rättat!</h3>
                    <p className="text-gray-500">Du har inga väntande inlämningar just nu.</p>
                </div>
            )}

            {/* --- MODAL: SKICKA MEDDELANDE --- */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#3c4043]">
                        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold flex items-center gap-2"><Mail size={18}/> Skicka Meddelande</h3>
                            <button onClick={() => { setShowMessageModal(false); setMessageRecipient(null); }}><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Mottagare</label>
                                {messageRecipient ? (
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg font-bold text-sm flex justify-between items-center">
                                        {messageRecipient.fullName} ({messageRecipient.email})
                                        <button onClick={() => setMessageRecipient(null)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                                    </div>
                                ) : (
                                    <select className="w-full p-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" onChange={(e) => {
                                        const student = allStudents.find(s => s.id.toString() === e.target.value);
                                        setMessageRecipient(student);
                                    }}>
                                        <option value="">Välj mottagare...</option>
                                        <optgroup label="Mina Studenter">
                                            {allStudents.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                                        </optgroup>
                                        <optgroup label="System">
                                            <option value="ADMIN">Till Administrationen</option>
                                        </optgroup>
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Ämne</label>
                                <input className="w-full p-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" placeholder="Vad gäller det?" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Meddelande</label>
                                <textarea className="w-full p-3 bg-gray-50 dark:bg-[#131314] border border-gray-200 dark:border-[#3c4043] rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none dark:text-white" placeholder="Skriv ditt meddelande..." />
                            </div>
                            <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 flex justify-center items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
                                <Send size={18}/> Skicka
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TeacherDashboard;