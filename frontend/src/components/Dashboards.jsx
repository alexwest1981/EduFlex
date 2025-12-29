import React, { useState, useEffect } from 'react';
import {
    Users, Briefcase, FileText, User, AlertTriangle, CheckCircle, Bell, CheckSquare,
    BookOpen, ClipboardList, Clock, ChevronRight, Star, Layers, Search, Filter, Lock, Unlock,
    MessageSquare, Mail, Phone, X, Loader2, File as FileIcon // <--- VIKTIGT: Alias här
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const getOwnerName = (doc) => {
    const u = doc.user || doc.owner;
    if (!u) return "Okänd";
    if (typeof u === 'string') return u;
    if (typeof u === 'object') return u.fullName || u.username || "Namnlös";
    return "Okänd";
};

// --- MODAL FÖR STUDENTINFO (RIKTIG DATA) ---
const StudentDetailModal = ({ student, myCourses, onClose }) => {
    if (!student) return null;

    // Hitta vilka av *lärarens* kurser som studenten är med i
    const enrolledCourses = myCourses.filter(course =>
        course.students && course.students.some(s => s.id === student.id)
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 hover:bg-white/20 p-1 rounded-full"><X size={20}/></button>
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold border-4 border-indigo-400 mb-3">
                        {student.firstName?.[0]}{student.lastName?.[0]}
                    </div>
                    <h2 className="text-xl font-bold">{student.fullName}</h2>
                    <p className="text-indigo-200 text-sm">@{student.username}</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-gray-700">
                        <Mail size={18} className="text-indigo-500"/>
                        <a href={`mailto:${student.email}`} className="hover:underline">{student.email}</a>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <Phone size={18} className="text-indigo-500"/>
                        <span>{student.phone || "Ingen telefon"}</span>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">Dina kurser:</h4>
                        <div className="flex flex-wrap gap-2">
                            {enrolledCourses.length > 0 ? (
                                enrolledCourses.map(c => (
                                    <span key={c.id} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded text-xs font-bold">
                                        {c.name}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-gray-400 italic">Ingen aktiv kurs.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AdminDashboard = ({ users, courses, documents, handleToggleCourseStatus }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const studentCount = users.filter(u => u.role === 'STUDENT').length;
    const teacherCount = users.filter(u => u.role === 'TEACHER').length;

    // Filtrering
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || (course.courseCode && course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'ALL' ? true : filterStatus === 'OPEN' ? course.isOpen : !course.isOpen;
        return matchesSearch && matchesFilter;
    });

    const latestUsers = [...users].reverse().slice(0, 5);
    const latestDocs = [...documents].reverse().slice(0, 5);

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.live_overview')}</h1>
                <p className="text-gray-500">{t('dashboard.realtime_data')}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">{t('dashboard.users')}</p>
                        <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                        <p className="text-xs text-green-600 font-medium mt-1">{studentCount} Stud, {teacherCount} Lär</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">{t('dashboard.courses')}</p>
                        <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                        <p className="text-xs text-gray-500 font-medium mt-1">{courses.filter(c => c.isOpen).length} {t('course.active')}</p>
                    </div>
                    <div className="bg-indigo-100 p-3 rounded-full text-indigo-600"><Briefcase size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">{t('dashboard.archived_files')}</p>
                        <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full text-orange-600"><FileText size={24}/></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><User size={18}/> {t('dashboard.latest_registered')}</h3>
                        <button onClick={() => navigate('/admin')} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded font-bold hover:bg-indigo-100">{t('dashboard.manage')}</button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {latestUsers.map(u => (
                            <div key={u.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-gray-900">{u.fullName}</p>
                                    <p className="text-xs text-gray-500">{u.email || u.username}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded font-bold ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'TEACHER' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><FileText size={18}/> {t('dashboard.latest_uploads')}</h3>
                        <button onClick={() => navigate('/documents')} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded font-bold hover:bg-indigo-100">{t('dashboard.archive')}</button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {latestDocs.length > 0 ? latestDocs.map(d => (
                            <div key={d.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <FileIcon size={16} className="text-gray-400"/> {/* <--- Använd FileIcon */}
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{d.title || d.fileName}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                    <p>{getOwnerName(d)}</p>
                                    <p>{d.uploadDate || d.date}</p>
                                </div>
                            </div>
                        )) : <div className="p-6 text-center text-gray-400">{t('dashboard.no_archive_docs')}</div>}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-gray-50 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><Layers size={20}/> {t('dashboard.course_registry')}</h3>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                            <input type="text" placeholder={t('dashboard.search_placeholder')} className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <select className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="ALL">{t('dashboard.all_statuses')}</option>
                            <option value="OPEN">{t('dashboard.open')}</option>
                            <option value="CLOSED">{t('dashboard.closed')}</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b text-xs font-bold text-gray-500 uppercase bg-gray-50">
                            <th className="p-4 w-24">{t('course.status')}</th>
                            <th className="p-4">{t('admin.course_code')}</th>
                            <th className="p-4">{t('admin.course_name')}</th>
                            <th className="p-4">{t('admin.teacher')}</th>
                            <th className="p-4 text-center">{t('dashboard.active_students')}</th>
                            <th className="p-4 text-right">{t('common.action')}</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                        {filteredCourses.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">{t('dashboard.no_match')}</td></tr>
                        ) : (
                            filteredCourses.map(course => (
                                <tr key={course.id} className={`hover:bg-gray-50 transition-colors ${!course.isOpen ? 'bg-gray-50/50' : ''}`}>
                                    <td className="p-4">
                                        <button onClick={() => handleToggleCourseStatus(course.id)} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border transition-all ${course.isOpen ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}>
                                            {course.isOpen ? <><Unlock size={10}/> {t('dashboard.open')}</> : <><Lock size={10}/> {t('dashboard.closed')}</>}
                                        </button>
                                    </td>
                                    <td className="p-4 font-mono text-gray-600 font-medium">{course.courseCode}</td>
                                    <td className="p-4 font-bold text-gray-800">{course.name}</td>
                                    <td className="p-4 text-gray-600">{course.teacher?.fullName || "-"}</td>
                                    <td className="p-4 text-center"><span className="font-bold text-gray-700">{course.students?.length || 0}</span></td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => navigate(`/course/${course.id}`)} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50">{t('dashboard.manage')}</button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const TeacherDashboard = ({ currentUser, myCourses, ungradedSubmissions, allAssignments, allSubmissions }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [tab, setTab] = useState('overview');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [recentThreads, setRecentThreads] = useState([]);
    const [isLoadingThreads, setIsLoadingThreads] = useState(false);

    useEffect(() => {
        if (tab === 'communication' && myCourses.length > 0) {
            const fetchRecentActivity = async () => {
                setIsLoadingThreads(true);
                try {
                    let allThreads = [];
                    for (const course of myCourses.slice(0, 5)) {
                        const categories = await api.forum.getCategories(course.id);
                        if (categories && categories.length > 0) {
                            const threads = await api.forum.getThreads(categories[0].id);
                            if (threads) {
                                const threadsWithCourse = threads.map(th => ({...th, courseName: course.name, courseId: course.id}));
                                allThreads = [...allThreads, ...threadsWithCourse];
                            }
                        }
                    }
                    allThreads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setRecentThreads(allThreads.slice(0, 10));
                } catch (e) { console.error(e); } finally { setIsLoadingThreads(false); }
            };
            fetchRecentActivity();
        }
    }, [tab, myCourses]);

    const allUniqueStudents = Array.from(new Set(myCourses.flatMap(c => c.students || []).map(s => s.id)))
        .map(id => myCourses.flatMap(c => c.students || []).find(s => s.id === id));

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
            {selectedStudent && <StudentDetailModal student={selectedStudent} myCourses={myCourses} onClose={() => setSelectedStudent(null)} />}

            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.teacher_panel')}</h1>
                <p className="text-gray-500">{t('dashboard.overview_for', {name: currentUser.fullName})}</p>
            </header>

            <div className="flex gap-4 mb-6 border-b">
                <button onClick={() => setTab('overview')} className={`pb-3 px-2 font-bold transition-colors ${tab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>Översikt</button>
                <button onClick={() => setTab('students')} className={`pb-3 px-2 font-bold transition-colors ${tab === 'students' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>Mina Studenter</button>
                <button onClick={() => setTab('communication')} className={`pb-3 px-2 font-bold transition-colors ${tab === 'communication' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>Kommunikation</button>
            </div>

            {tab === 'overview' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><h3 className="text-gray-500 text-xs font-bold uppercase mb-1">{t('dashboard.my_students')}</h3><p className="text-3xl font-bold text-indigo-600">{allUniqueStudents.length}</p></div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><h3 className="text-gray-500 text-xs font-bold uppercase mb-1">{t('dashboard.to_grade')}</h3><p className="text-3xl font-bold text-orange-500">{ungradedSubmissions.length}</p></div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"><h3 className="text-gray-500 text-xs font-bold uppercase mb-1">{t('dashboard.active_courses')}</h3><p className="text-3xl font-bold text-green-600">{myCourses.length}</p></div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Aktiva Kurser</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myCourses.map(course => (
                            <div key={course.id} onClick={() => navigate(`/course/${course.id}`)} className="bg-white p-6 rounded-xl border hover:shadow-lg transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-3"><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded font-bold text-gray-600">{course.courseCode}</span><ChevronRight className="text-gray-300 group-hover:text-indigo-600"/></div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{course.name}</h3>
                                <p className="text-xs text-gray-500 mb-4">{course.students?.length || 0} studenter</p>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-1/3"></div></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'students' && (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold"><tr><th className="p-4">Namn</th><th className="p-4">Användarnamn</th><th className="p-4">E-post</th><th className="p-4 text-right">Info</th></tr></thead>
                        <tbody className="divide-y text-sm">
                        {allUniqueStudents.length === 0 ? <tr><td colSpan="4" className="p-6 text-center text-gray-500">Inga studenter.</td></tr> : allUniqueStudents.map(s => (<tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedStudent(s)}><td className="p-4 font-bold text-gray-900">{s.fullName}</td><td className="p-4 font-mono text-gray-600">@{s.username}</td><td className="p-4 text-gray-600">{s.email}</td><td className="p-4 text-right"><span className="text-indigo-600 font-bold hover:underline text-xs">Visa</span></td></tr>))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'communication' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare className="text-indigo-600"/> Forumaktivitet</h3>
                        {isLoadingThreads ? <Loader2 className="animate-spin text-indigo-600"/> : recentThreads.length === 0 ? <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded border border-dashed text-center">Inga nya inlägg.</p> : (
                            <div className="mt-4 space-y-3">
                                {recentThreads.map(thread => (
                                    <div key={thread.id} onClick={() => navigate(`/course/${thread.courseId}`)} className="p-3 bg-gray-50 rounded-lg border hover:bg-white hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex justify-between"><span className="font-bold text-sm text-gray-900">{thread.title}</span><span className="text-xs text-gray-400">{new Date(thread.createdAt).toLocaleDateString()}</span></div>
                                        <p className="text-xs text-gray-600 truncate mt-1">{thread.content}</p>
                                        <div className="flex justify-between items-center mt-2"><span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">{thread.courseName}</span><span className="text-[10px] text-gray-500">{thread.author?.fullName}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Mail className="text-green-600"/> Chattsammanfattning</h3>
                        <p className="text-sm text-gray-500 italic">Chatten nås via ikonen nere till höger.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export const StudentDashboard = ({ currentUser, myCourses, upcomingAssignments, fetchCourseDetails }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
            <header className="mb-8"><h1 className="text-3xl font-bold text-gray-900">{t('dashboard.hi_student', {name: currentUser.firstName})}</h1><p className="text-gray-500">{t('dashboard.student_subtitle')}</p></header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle size={20} className="text-indigo-600"/> {t('dashboard.my_courses')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myCourses.length === 0 ? <p className="text-gray-400 italic bg-white p-6 rounded-xl border">{t('dashboard.not_registered')}</p> : myCourses.map(course => (
                                <div key={course.id} onClick={() => navigate(`/course/${course.id}`)} className="bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all group overflow-hidden">
                                    <div className={`h-3 w-full ${course.color || 'bg-indigo-600'}`}></div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2"><span className="text-xs font-bold font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{course.courseCode}</span>{!course.isOpen && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">{t('dashboard.closed')}</span>}</div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{course.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description || "Ingen beskrivning"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Bell size={20} className="text-orange-500"/> {t('dashboard.comming_assignments')}</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y">
                            {upcomingAssignments.length === 0 ? <div className="p-6 text-center text-gray-400">{t('dashboard.no_upcoming_assignments')}</div> : upcomingAssignments.map(a => (
                                <div key={a.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                    <div><h4 className="font-bold text-sm text-gray-900">{a.title}</h4><p className="text-xs text-gray-500">{a.courseName}</p></div>
                                    <button onClick={() => navigate(`/course/${a.courseId}`)} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold hover:bg-indigo-100">{t('dashboard.go_to')}</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-gray-400 text-sm font-bold uppercase mb-1">{t('dashboard.avg_grade')}</h3>
                        <p className="text-4xl font-bold text-green-600">B</p>
                        <p className="text-xs text-gray-400 mt-2">{t('dashboard.based_on', {count: 4})}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard = ({ currentUser, myCourses, allCourses, documents, upcomingAssignments, ungradedSubmissions, pendingEvaluations, openEvaluationModal, setSelectedAssignment, fetchCourseDetails, handleToggleCourseStatus, users, allAssignments, allSubmissions }) => {
    const navigate = useNavigate();
    if (currentUser.role === 'ADMIN') return <AdminDashboard users={users} courses={allCourses} documents={documents} handleToggleCourseStatus={handleToggleCourseStatus} />;
    else if (currentUser.role === 'TEACHER') return <TeacherDashboard currentUser={currentUser} myCourses={myCourses} ungradedSubmissions={ungradedSubmissions} allAssignments={allAssignments} allSubmissions={allSubmissions} />;
    else return <StudentDashboard currentUser={currentUser} myCourses={myCourses} upcomingAssignments={upcomingAssignments} fetchCourseDetails={fetchCourseDetails} />;
};

export default Dashboard;