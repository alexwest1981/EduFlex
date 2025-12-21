import React, { useState } from 'react';
import {
    BookOpen, FileText, Clock, AlertCircle, CheckCircle, ChevronRight, File,
    Star, ClipboardList, Users, BarChart3, Layers, Search, Lock, Unlock, Filter
} from 'lucide-react';

const Dashboard = ({
                       currentUser, myCourses, allCourses, documents, navigateTo,
                       upcomingAssignments = [], ungradedSubmissions = [],
                       pendingEvaluations = [],
                       setSelectedAssignment, fetchCourseDetails,
                       openEvaluationModal,
                       handleToggleCourseStatus // NY PROP
                   }) => {

    // State för Admin-sökning
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'OPEN', 'CLOSED'

    const handleJumpToAssignment = async (courseId) => {
        await fetchCourseDetails(courseId);
        navigateTo('course-detail', courseId);
    };

    // --- ADMIN DASHBOARD ---
    if (currentUser.role === 'ADMIN') {

        // 1. Filtrera kurser baserat på sökning och status
        const filteredCourses = allCourses.filter(course => {
            const matchesSearch =
                course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter =
                filterStatus === 'ALL' ? true :
                    filterStatus === 'OPEN' ? course.isOpen :
                        !course.isOpen;

            return matchesSearch && matchesFilter;
        });

        // Statistik
        const totalStudents = allCourses.reduce((acc, c) => acc + (c.students?.length || 0), 0);
        const lockedCoursesCount = allCourses.filter(c => !c.isOpen).length;

        return (
            <div className="animate-in fade-in space-y-8">
                {/* Admin Header */}
                <div className="bg-gray-900 rounded-2xl p-8 text-white shadow-lg flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Systemöversikt</h1>
                        <p className="text-gray-400">Administration och Kursstyrning</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{allCourses.length}</div>
                        <div className="text-gray-400 text-sm">Totalt antal kurser</div>
                    </div>
                </div>

                {/* KPI Kort */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Aktiva Studenter</p>
                        <h3 className="text-2xl font-bold text-gray-800">{totalStudents}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Låsta Kurser</p>
                        <h3 className="text-2xl font-bold text-gray-800">{lockedCoursesCount}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Att Behandla</p>
                        <h3 className="text-2xl font-bold text-orange-600">{ungradedSubmissions.length}</h3>
                        <p className="text-[10px] text-gray-400">Inlämningar</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Filer i system</p>
                        <h3 className="text-2xl font-bold text-indigo-600">{documents.length || 0}</h3>
                    </div>
                </div>

                {/* KURS-HANTERING (Tidigare tabell, nu uppgraderad) */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-6 border-b bg-gray-50 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><Layers size={20}/> Kursregister</h3>

                        {/* Sök och Filter Verktyg */}
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                                <input
                                    type="text"
                                    placeholder="Sök kurskod eller namn..."
                                    className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="ALL">Alla Statusar</option>
                                <option value="OPEN">Öppna</option>
                                <option value="CLOSED">Stängda</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b text-xs font-bold text-gray-500 uppercase bg-gray-50">
                                <th className="p-4 w-24">Status</th>
                                <th className="p-4">Kurskod</th>
                                <th className="p-4">Namn</th>
                                <th className="p-4">Lärare</th>
                                <th className="p-4 text-center">Anmälda</th>
                                <th className="p-4 text-center">Ansökningar</th> {/* Simulerad kolumn */}
                                <th className="p-4 text-right">Hantera</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                            {filteredCourses.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500 italic">Inga kurser matchade din sökning.</td></tr>
                            ) : (
                                filteredCourses.map(course => (
                                    <tr key={course.id} className={`hover:bg-gray-50 transition-colors ${!course.isOpen ? 'bg-gray-50/50' : ''}`}>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleToggleCourseStatus(course.id)}
                                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                                    course.isOpen
                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                }`}
                                            >
                                                {course.isOpen ? <><Unlock size={10}/> Öppen</> : <><Lock size={10}/> Stängd</>}
                                            </button>
                                        </td>
                                        <td className="p-4 font-mono text-gray-600 font-medium">{course.courseCode}</td>
                                        <td className="p-4 font-bold text-gray-800">
                                            {course.name}
                                            {!course.isOpen && <span className="ml-2 text-xs font-normal text-gray-400 italic">(Stängd för ansökan)</span>}
                                        </td>
                                        <td className="p-4 text-gray-600">{course.teacher?.fullName || <span className="text-gray-400 italic">-</span>}</td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-gray-700">{course.students?.length || 0}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {/* Här skulle vi visa 'Pending' om backend stödde det. Nu visar vi 0 eller "-" */}
                                            <span className="text-gray-400">-</span>
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => navigateTo('course-detail', course.id)} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50">Öppna</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t bg-gray-50 text-xs text-gray-500 text-center">
                        Visar {filteredCourses.length} av {allCourses.length} kurser
                    </div>
                </div>
            </div>
        );
    }

    // --- LÄRARE & STUDENT DASHBOARD (Oförändrad logik, bara inlistad här för komplett fil) ---
    return (
        <div className="animate-in fade-in space-y-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Välkommen tillbaka, {currentUser.firstName}!</h1>
                    <p className="text-indigo-100 opacity-90">Du är inloggad som <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-xs uppercase">{currentUser.role}</span>.</p>
                </div>
                <div className="hidden md:block text-right">
                    <div className="text-4xl font-bold">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="text-indigo-200">{new Date().toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
                            <div><p className="text-gray-500 text-sm font-medium">Mina Kurser</p><h3 className="text-3xl font-bold text-gray-800">{myCourses.length}</h3></div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={24}/></div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
                            <div><p className="text-gray-500 text-sm font-medium">Filer</p><h3 className="text-3xl font-bold text-gray-800">{documents.length}</h3></div>
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><FileText size={24}/></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">Mina Kurser</h2></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myCourses.length === 0 && <p className="text-gray-500 italic col-span-2 bg-white p-6 rounded-xl border text-center">Du har inga aktiva kurser.</p>}
                            {myCourses.map(c => (
                                <div key={c.id} onClick={() => navigateTo('course-detail', c.id)} className="bg-white p-5 rounded-xl border hover:shadow-md cursor-pointer transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:w-2 transition-all"></div>
                                    <div className="flex justify-between items-start mb-2"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{c.courseCode}</span><ChevronRight className="text-gray-300 group-hover:text-indigo-600 transition-colors" size={20}/></div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{c.name}</h3>
                                    <p className="text-xs text-gray-500">{c.description ? c.description.substring(0, 50) + "..." : "Ingen beskrivning"}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    {pendingEvaluations.length > 0 && (
                        <div className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden animate-pulse-slow">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 flex justify-between items-center text-white"><h3 className="font-bold flex items-center gap-2"><ClipboardList size={18}/> Utvärderingar</h3><span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">{pendingEvaluations.length}</span></div>
                            <div className="divide-y">{pendingEvaluations.map(course => (<div key={course.id} className="p-4 hover:bg-gray-50 transition-colors"><div className="text-sm font-bold text-gray-800 mb-1">{course.name}</div><button onClick={() => openEvaluationModal(course)} className="w-full py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded border border-indigo-100 hover:bg-indigo-100 flex items-center justify-center gap-1"><Star size={12}/> Ge betyg</button></div>))}</div>
                        </div>
                    )}
                    {currentUser.role === 'TEACHER' && (
                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                            <div className="bg-orange-50 border-b border-orange-100 p-4 flex justify-between items-center"><h3 className="font-bold text-orange-800 flex items-center gap-2"><AlertCircle size={18}/> Att Rätta</h3><span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">{ungradedSubmissions.length}</span></div>
                            <div className="max-h-64 overflow-y-auto">{ungradedSubmissions.length === 0 ? (<div className="p-6 text-center text-sm text-gray-500"><CheckCircle size={24} className="mx-auto mb-2 text-green-400"/>Inga inlämningar väntar!</div>) : (<div className="divide-y">{ungradedSubmissions.map(sub => (<div key={sub.id} className="p-4 hover:bg-gray-50 transition-colors text-sm"><div className="font-bold text-gray-800">{sub.studentName}</div><div className="text-gray-500 mb-1">{sub.assignmentTitle}</div><span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{sub.courseName}</span></div>))}</div>)}</div>
                        </div>
                    )}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="bg-indigo-50 border-b border-indigo-100 p-4"><h3 className="font-bold text-indigo-800 flex items-center gap-2"><Clock size={18}/> Nästa Deadlines</h3></div>
                        <div className="max-h-80 overflow-y-auto">{upcomingAssignments.length === 0 ? (<div className="p-6 text-center text-sm text-gray-500">Inga kommande inlämningar.</div>) : (<div className="divide-y">{upcomingAssignments.map(assign => { const daysLeft = Math.ceil((new Date(assign.dueDate) - new Date()) / (1000 * 60 * 60 * 24)); return (<div key={assign.id} onClick={() => handleJumpToAssignment(assign.courseId)} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"><div className="flex justify-between items-start mb-1"><h4 className="font-bold text-gray-800 text-sm group-hover:text-indigo-600">{assign.title}</h4>{daysLeft <= 2 && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">Bråttom!</span>}</div><div className="flex items-center gap-1 text-xs font-medium text-gray-600"><Clock size={12}/>{new Date(assign.dueDate).toLocaleDateString()}</div></div>); })}</div>)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;