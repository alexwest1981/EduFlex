import React from 'react';
import {
    Users, Briefcase, FileText, User, File, AlertTriangle, CheckCircle, Bell, CheckSquare,
    BookOpen, ClipboardList, Clock, ChevronRight, Star, Layers, Search, Filter, Lock, Unlock
} from 'lucide-react';
import { useTranslation } from 'react-i18next'; // <---

const getOwnerName = (doc) => {
    const u = doc.user || doc.owner;
    if (!u) return "Okänd";
    if (typeof u === 'string') return u;
    if (typeof u === 'object') return u.fullName || u.username || "Namnlös";
    return "Okänd";
};

export const AdminDashboard = ({ users, courses, documents, navigateTo, handleToggleCourseStatus }) => {
    const { t } = useTranslation();
    const studentCount = users.filter(u => u.role === 'STUDENT').length;
    const teacherCount = users.filter(u => u.role === 'TEACHER').length;
    const latestUsers = [...users].reverse().slice(0, 5);
    const latestDocs = [...documents].reverse().slice(0, 5);

    // Enkel filtrering för dashboard-vyn
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('ALL');

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' ? true : filterStatus === 'OPEN' ? course.isOpen : !course.isOpen;
        return matchesSearch && matchesFilter;
    });

    const lockedCoursesCount = courses.filter(c => !c.isOpen).length;

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
                        <p className="text-xs text-green-600 font-medium mt-1">{studentCount} {t('auth.student')}, {teacherCount} {t('auth.teacher')}</p>
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
                        <button onClick={() => navigateTo('admin')} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded font-bold hover:bg-indigo-100">{t('dashboard.manage')}</button>
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
                        <button onClick={() => navigateTo('documents')} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded font-bold hover:bg-indigo-100">{t('dashboard.archive')}</button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {latestDocs.length > 0 ? latestDocs.map(d => (
                            <div key={d.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <File size={16} className="text-gray-400"/>
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

            {/* KURSREGISTER */}
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
                                        <button onClick={() => navigateTo('course-detail', course.id)} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50">{t('dashboard.manage')}</button>
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

export const TeacherDashboard = ({ currentUser, myCourses, ungradedSubmissions, allAssignments, allSubmissions, navigateTo }) => {
    const { t } = useTranslation();
    const now = new Date();
    const atRiskMap = {};

    allAssignments.forEach(assignment => {
        const dueDate = new Date(assignment.dueDate);
        if (dueDate < now) {
            const course = myCourses.find(c => c.id === assignment.courseId);
            if (course && course.students) {
                course.students.forEach(student => {
                    const hasSubmitted = allSubmissions.some(s => s.assignmentId === assignment.id && s.studentId === student.id);
                    if (!hasSubmitted) {
                        if (!atRiskMap[student.id]) {
                            atRiskMap[student.id] = { id: student.id, name: student.fullName, missedCount: 0, courses: new Set() };
                        }
                        atRiskMap[student.id].missedCount++;
                        atRiskMap[student.id].courses.add(course.name);
                    }
                });
            }
        }
    });

    const atRiskStudents = Object.values(atRiskMap);
    const totalStudents = myCourses.reduce((acc, course) => acc + (course.students ? course.students.length : 0), 0);

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.teacher_panel')}</h1>
                <p className="text-gray-500">{t('dashboard.overview_for', {name: currentUser.fullName})}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-1">{t('dashboard.my_students')}</h3>
                    <p className="text-3xl font-bold text-indigo-600">{totalStudents}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-1">{t('dashboard.to_grade')}</h3>
                    <p className="text-3xl font-bold text-orange-500">{ungradedSubmissions.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-1">{t('dashboard.active_courses')}</h3>
                    <p className="text-3xl font-bold text-green-600">{myCourses.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="p-5 border-b border-red-50 bg-red-50 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-red-600"/>
                        <h3 className="font-bold text-red-900">{t('dashboard.students_at_risk')}</h3>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {atRiskStudents.length > 0 ? atRiskStudents.map(s => (
                            <div key={s.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <p className="font-bold text-gray-900">{s.name}</p>
                                    <p className="text-xs text-red-500 font-medium">{t('dashboard.missed_deadlines', {count: s.missedCount})}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{Array.from(s.courses)[0]}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-6 text-center">
                                <CheckCircle size={48} className="mx-auto text-green-200 mb-2"/>
                                <p className="text-green-600 font-medium">{t('dashboard.no_risk_students')}</p>
                                <p className="text-xs text-gray-400">{t('dashboard.all_in_phase')}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                            <CheckSquare size={18} className="text-orange-500"/>
                            <h3 className="font-bold text-gray-900">{t('dashboard.grading_todo')}</h3>
                        </div>
                        {ungradedSubmissions.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {ungradedSubmissions.slice(0, 5).map(s => (
                                    <div key={s.id} className="p-4 hover:bg-gray-50 flex justify-between items-center cursor-pointer" onClick={() => navigateTo('course-detail', s.courseId)}>
                                        <div>
                                            <p className="font-bold text-sm">{s.assignmentTitle}</p>
                                            <p className="text-xs text-gray-500">{s.studentName} • {s.courseName}</p>
                                        </div>
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">{t('dashboard.grade_now')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-400 text-sm">{t('dashboard.all_graded')}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const StudentDashboard = ({ currentUser, myCourses, upcomingAssignments, navigateTo, fetchCourseDetails }) => {
    const { t, i18n } = useTranslation();
    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.hi_student', {name: currentUser.fullName.split(' ')[0]})}</h1>
                <p className="text-gray-500">{t('dashboard.student_subtitle')}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle size={20} className="text-indigo-600"/> {t('dashboard.my_courses')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myCourses.map(course => (
                                <div key={course.id} onClick={() => navigateTo('course-detail', course.id)} className="bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all group overflow-hidden">
                                    <div className={`h-3 w-full ${course.color || 'bg-indigo-600'}`}></div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{course.courseCode}</span>
                                            {!course.isOpen && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">{t('dashboard.closed')}</span>}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{course.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description}</p>
                                    </div>
                                </div>
                            ))}
                            {myCourses.length === 0 && <p className="text-gray-400 italic">{t('dashboard.not_registered')}</p>}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Bell size={20} className="text-orange-500"/> {t('dashboard.comming_assignments')}</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y">
                            {upcomingAssignments.length === 0 ? (
                                <div className="p-6 text-center text-gray-400">{t('dashboard.no_upcoming_assignments')}</div>
                            ) : (
                                upcomingAssignments.map(a => (
                                    <div key={a.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900">{a.title}</h4>
                                            <p className="text-xs text-gray-500">{a.courseName} • {new Date(a.dueDate).toLocaleDateString(i18n.language)}</p>
                                        </div>
                                        <button onClick={() => { fetchCourseDetails(a.courseId); navigateTo('course-detail', a.courseId); }} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold hover:bg-indigo-100">{t('dashboard.go_to')}</button>
                                    </div>
                                ))
                            )}
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

// Detta är huvudkomponenten som exporteras default
const Dashboard = ({
                       currentUser, myCourses, allCourses, documents, navigateTo,
                       upcomingAssignments, ungradedSubmissions, pendingEvaluations,
                       openEvaluationModal, setSelectedAssignment, fetchCourseDetails,
                       handleToggleCourseStatus, users, allAssignments, allSubmissions
                   }) => {
    if (currentUser.role === 'ADMIN') {
        return <AdminDashboard users={users} courses={allCourses} documents={documents} navigateTo={navigateTo} handleToggleCourseStatus={handleToggleCourseStatus} />;
    } else if (currentUser.role === 'TEACHER') {
        return <TeacherDashboard currentUser={currentUser} myCourses={myCourses} ungradedSubmissions={ungradedSubmissions} allAssignments={allAssignments} allSubmissions={allSubmissions} navigateTo={navigateTo} />;
    } else {
        return <StudentDashboard currentUser={currentUser} myCourses={myCourses} upcomingAssignments={upcomingAssignments} navigateTo={navigateTo} fetchCourseDetails={fetchCourseDetails} />;
    }
};

export default Dashboard;