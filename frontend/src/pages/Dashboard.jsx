import React from 'react';
import { BookOpen, FileText, Clock, AlertCircle, CheckCircle, ChevronRight, File, Star, ClipboardList } from 'lucide-react';

const Dashboard = ({
                       currentUser, myCourses, documents, navigateTo,
                       upcomingAssignments = [], ungradedSubmissions = [],
                       pendingEvaluations = [], // NY PROP
                       setSelectedAssignment, fetchCourseDetails,
                       openEvaluationModal // NY PROP för att öppna modalen
                   }) => {

    const handleJumpToAssignment = async (courseId) => {
        await fetchCourseDetails(courseId);
        navigateTo('course-detail', courseId);
    };

    return (
        <div className="animate-in fade-in space-y-8">
            {/* Välkomst-banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Välkommen tillbaka, {currentUser.firstName}!</h1>
                    <p className="text-indigo-100 opacity-90">
                        Du är inloggad som <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-xs uppercase">{currentUser.role}</span>.
                        Här är vad som händer idag.
                    </p>
                </div>
                <div className="hidden md:block text-right">
                    <div className="text-4xl font-bold">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="text-indigo-200">{new Date().toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* VÄNSTER KOLUMN: Statistik & Kurser (2/3 bredd) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Statistik-kort */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Aktiva Kurser</p>
                                <h3 className="text-3xl font-bold text-gray-800">{myCourses.length}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={24}/></div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Uppladdade Filer</p>
                                <h3 className="text-3xl font-bold text-gray-800">{documents.length}</h3>
                            </div>
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><FileText size={24}/></div>
                        </div>
                    </div>

                    {/* Kurs-lista */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Mina Kurser</h2>
                            <button onClick={() => navigateTo('courses')} className="text-sm text-indigo-600 font-bold hover:underline">Visa alla</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myCourses.length === 0 && <p className="text-gray-500 italic col-span-2 bg-white p-6 rounded-xl border text-center">Du är inte registrerad på några kurser än.</p>}
                            {myCourses.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => navigateTo('course-detail', c.id)}
                                    className="bg-white p-5 rounded-xl border hover:shadow-md cursor-pointer transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:w-2 transition-all"></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{c.courseCode}</span>
                                        <ChevronRight className="text-gray-300 group-hover:text-indigo-600 transition-colors" size={20}/>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{c.name}</h3>
                                    <p className="text-xs text-gray-500">{c.description ? c.description.substring(0, 50) + "..." : "Ingen beskrivning"}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* HÖGER KOLUMN: Widgets (1/3 bredd) */}
                <div className="space-y-6">

                    {/* WIDGET: KURSUTVÄRDERINGAR (NY!) */}
                    {pendingEvaluations.length > 0 && (
                        <div className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden animate-pulse-slow">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 flex justify-between items-center text-white">
                                <h3 className="font-bold flex items-center gap-2"><ClipboardList size={18}/> Utvärderingar</h3>
                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">{pendingEvaluations.length}</span>
                            </div>
                            <div className="divide-y">
                                {pendingEvaluations.map(course => (
                                    <div key={course.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="text-sm font-bold text-gray-800 mb-1">{course.name}</div>
                                        <p className="text-xs text-gray-500 mb-3">Tyck till om kursen och hjälp oss förbättras.</p>
                                        <button
                                            onClick={() => openEvaluationModal(course)}
                                            className="w-full py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded border border-indigo-100 hover:bg-indigo-100 flex items-center justify-center gap-1"
                                        >
                                            <Star size={12}/> Ge betyg
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* WIDGET: ATT RÄTTA (Endast Lärare/Admin) */}
                    {(currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') && (
                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                            <div className="bg-orange-50 border-b border-orange-100 p-4 flex justify-between items-center">
                                <h3 className="font-bold text-orange-800 flex items-center gap-2"><AlertCircle size={18}/> Att Rätta</h3>
                                <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">{ungradedSubmissions.length}</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {ungradedSubmissions.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-gray-500">
                                        <CheckCircle size={24} className="mx-auto mb-2 text-green-400"/>
                                        Inga inlämningar väntar!
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {ungradedSubmissions.map(sub => (
                                            <div key={sub.id} className="p-4 hover:bg-gray-50 transition-colors text-sm">
                                                <div className="font-bold text-gray-800">{sub.studentName}</div>
                                                <div className="text-gray-500 mb-1">{sub.assignmentTitle}</div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{sub.courseName}</span>
                                                    {sub.fileUrl && <a href={`http://127.0.0.1:8080${sub.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 text-xs"><File size={12}/> Fil</a>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* WIDGET: KOMMANDE DEADLINES (Alla) */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="bg-indigo-50 border-b border-indigo-100 p-4">
                            <h3 className="font-bold text-indigo-800 flex items-center gap-2"><Clock size={18}/> Nästa Deadlines</h3>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {upcomingAssignments.length === 0 ? (
                                <div className="p-6 text-center text-sm text-gray-500">Inga kommande inlämningar.</div>
                            ) : (
                                <div className="divide-y">
                                    {upcomingAssignments.map(assign => {
                                        const daysLeft = Math.ceil((new Date(assign.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                                        const isUrgent = daysLeft <= 2;

                                        return (
                                            <div key={assign.id} onClick={() => handleJumpToAssignment(assign.courseId)} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-gray-800 text-sm group-hover:text-indigo-600">{assign.title}</h4>
                                                    {isUrgent && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">Bråttom!</span>}
                                                </div>
                                                <div className="text-xs text-gray-500 mb-2">{assign.courseName}</div>
                                                <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
                                                    <Clock size={12}/>
                                                    {new Date(assign.dueDate).toLocaleDateString()} kl {new Date(assign.dueDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;