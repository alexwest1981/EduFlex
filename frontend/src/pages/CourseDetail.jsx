import React, { useState } from 'react';
import {
    Plus, ArrowLeft, CheckCircle, Eye, Trash2, Video,
    Link as LinkIcon, Download, Clock, ChevronRight,
    Upload, GraduationCap, CheckSquare, File, Users, UserPlus,
    ClipboardList, PlayCircle, Calendar, Star, FileText // <--- Lade till FileText här
} from 'lucide-react';

import AttendanceView from '../components/AttendanceView';
import AssessmentView from '../components/AssessmentView';

const CourseDetail = ({
                          currentCourse, activeTab, setActiveTab, selectedAssignment, setSelectedAssignment,
                          currentUser, materials, assignments, submissions, grading, setGrading,
                          readMaterials, setShowAssignmentModal, handleMaterialSubmit, handleStudentSubmit,
                          handleGradeSubmission, handleDeleteMaterial, toggleReadStatus, getIcon,
                          getYoutubeEmbed, getMySubmission, matTitle, setMatTitle, matContent, setMatContent,
                          matLink, setMatLink, matType, setMatType, setMatFile, setSubmissionFile, navigateTo,
                          users, handleAddStudentToCourse,
                          handleCreateEvaluation
                      }) => {

    const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('');
    const [evalQuestions, setEvalQuestions] = useState(['']);

    // Filtrera studenter
    const availableStudents = users ? users.filter(u =>
        u.role === 'STUDENT' && !currentCourse.students?.some(s => s.id === u.id)
    ) : [];

    const addQuestion = () => { if (evalQuestions.length < 10) setEvalQuestions([...evalQuestions, '']); };
    const updateQuestion = (idx, text) => { const newQ = [...evalQuestions]; newQ[idx] = text; setEvalQuestions(newQ); };
    const removeQuestion = (idx) => { const newQ = evalQuestions.filter((_, i) => i !== idx); setEvalQuestions(newQ); };

    return (
        <div className="animate-in slide-in-from-right-4 duration-500 pb-20">
            {/* Header / Tillbaka */}
            <button onClick={() => navigateTo('courses')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 font-medium transition-colors">
                <ArrowLeft size={18}/> Tillbaka till översikt
            </button>

            {/* Kurs Info Kort */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-l-4 border-l-indigo-600 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">{currentCourse.courseCode}</span>
                            {currentCourse.endDate && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar size={12}/> Slutar: {new Date(currentCourse.endDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">{currentCourse.name}</h1>
                        <div
                            className="text-gray-600 prose prose-indigo max-w-none leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: currentCourse.description }}
                        />
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ansvarig Lärare</div>
                        <div className="font-bold text-gray-800 text-lg">{currentCourse.teacher?.fullName || "Ej tilldelad"}</div>
                    </div>
                </div>
            </div>

            {/* --- FLIK-NAVIGERING --- */}
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto gap-2">
                {[
                    { id: 'material', label: 'Material', icon: <FileText size={18}/> },
                    { id: 'assignments', label: 'Uppgifter', icon: <CheckSquare size={18}/> },
                    { id: 'students', label: `Deltagare (${currentCourse.students?.length || 0})`, icon: <Users size={18}/> },
                    { id: 'attendance', label: 'Närvaro', icon: <Calendar size={18}/> },
                    { id: 'assessment', label: 'Bedömning', icon: <Star size={18}/> },
                ].map(tab => {
                    return (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSelectedAssignment(null); }}
                            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    )})}

                {/* Lärar-specifik flik: Utvärdering */}
                {(currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') && (
                    <button onClick={() => { setActiveTab('evaluation'); setSelectedAssignment(null); }} className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'evaluation' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
                        <ClipboardList size={18}/> Utvärdering
                    </button>
                )}
            </div>

            {/* --- INNEHÅLL --- */}
            <div className="min-h-[400px]">

                {/* 1. NÄRVARO */}
                {activeTab === 'attendance' && (
                    <AttendanceView
                        courseId={currentCourse.id}
                        currentUser={currentUser}
                        API_BASE="http://127.0.0.1:8080/api"
                        token={localStorage.getItem('token')}
                    />
                )}

                {/* 2. BEDÖMNING */}
                {activeTab === 'assessment' && (
                    <AssessmentView
                        assignments={assignments}
                        submissions={submissions}
                        navigateTo={navigateTo}
                        courseId={currentCourse.id}
                    />
                )}

                {/* 3. DELTAGARE */}
                {activeTab === 'students' && (
                    <div className="space-y-6 animate-in fade-in">
                        {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && (
                            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2"><UserPlus size={20}/> Lägg till Student</h3>
                                    <select className="w-full border border-indigo-200 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={selectedStudentToAdd} onChange={(e) => setSelectedStudentToAdd(e.target.value)}>
                                        <option value="">-- Välj student att lägga till --</option>
                                        {availableStudents.map(s => (<option key={s.id} value={s.id}>{s.fullName} ({s.username})</option>))}
                                    </select>
                                </div>
                                <button onClick={() => { handleAddStudentToCourse(selectedStudentToAdd); setSelectedStudentToAdd(''); }} disabled={!selectedStudentToAdd} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors w-full md:w-auto">Lägg till</button>
                            </div>
                        )}
                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                            {currentCourse.students?.length > 0 ? (
                                <div className="divide-y">
                                    {currentCourse.students.map(student => (
                                        <div key={student.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                    {student.firstName?.[0]}{student.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{student.firstName} {student.lastName}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{student.username}</div>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Registrerad</span>
                                        </div>
                                    ))}</div>
                            ) : <div className="p-12 text-center text-gray-400 italic">Inga studenter registrerade på denna kurs än.</div>}
                        </div>
                    </div>
                )}

                {/* 4. UTVÄRDERING (LÄRARE) */}
                {activeTab === 'evaluation' && (currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-blue-50 border border-blue-200 p-8 rounded-xl">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><ClipboardList size={32}/></div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-blue-900 mb-2">Hantera Kursutvärdering</h2>
                                    <p className="text-blue-700 mb-6 text-sm leading-relaxed">Skapa frågor för att få feedback från dina studenter. När du aktiverar utvärderingen blir den synlig för alla registrerade studenter på deras översikt.</p>

                                    {currentCourse.evaluation && currentCourse.evaluation.active ? (
                                        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                                            <div className="flex items-center gap-3 text-green-600 font-bold mb-4 bg-green-50 p-3 rounded-lg w-fit">
                                                <CheckCircle size={20}/> Utvärdering Aktiv
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Aktiva Frågor</h4>
                                                <ul className="space-y-2">
                                                    {currentCourse.evaluation.questions.map((q, i) => (
                                                        <li key={i} className="flex gap-3 text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                            <span className="font-bold text-blue-500">{i + 1}.</span> {q}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                                            <h3 className="font-bold text-gray-800 mb-4">Skapa frågor (Max 10)</h3>
                                            <div className="space-y-3 mb-6">
                                                {evalQuestions.map((q, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center group">
                                                        <span className="text-gray-400 font-bold w-6 text-right text-sm">{idx + 1}.</span>
                                                        <input
                                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                            placeholder={`Skriv fråga ${idx + 1}...`}
                                                            value={q}
                                                            onChange={(e) => updateQuestion(idx, e.target.value)}
                                                        />
                                                        {evalQuestions.length > 1 && (
                                                            <button onClick={() => removeQuestion(idx)} className="text-gray-300 hover:text-red-500 transition-colors p-2"><Trash2 size={18}/></button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center pt-4 border-t">
                                                <button onClick={addQuestion} disabled={evalQuestions.length >= 10} className="text-blue-600 font-bold text-sm hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                                                    <Plus size={18}/> Lägg till rad
                                                </button>
                                                <button onClick={() => handleCreateEvaluation(evalQuestions.filter(q => q.trim() !== ''))} className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2 transition-all transform hover:scale-105">
                                                    <PlayCircle size={20}/> Publicera Utvärdering
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. MATERIAL */}
                {activeTab === 'material' && (
                    <div className="space-y-8 animate-in fade-in">
                        {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && (
                            <div className="bg-white border border-dashed border-gray-300 p-6 rounded-xl hover:border-indigo-300 transition-colors">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-700"><Plus size={20} className="text-indigo-500"/> Lägg till nytt material</h3>
                                <form onSubmit={handleMaterialSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Titel på materialet" value={matTitle} onChange={e => setMatTitle(e.target.value)} />
                                        <select className="border rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={matType} onChange={e => setMatType(e.target.value)}><option value="TEXT">Text / Artikel</option><option value="VIDEO">Video (YouTube)</option><option value="FILE">Fil / Dokument</option><option value="LINK">Extern Länk</option></select>
                                    </div>
                                    <textarea className="border rounded-lg w-full px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]" placeholder="Beskrivning eller innehåll..." value={matContent} onChange={e => setMatContent(e.target.value)} />
                                    {(matType === 'VIDEO' || matType === 'LINK') && <input className="border rounded-lg w-full px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Klistra in länk här..." value={matLink} onChange={e => setMatLink(e.target.value)} />}
                                    {matType === 'FILE' && <input className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors" id="matFileInput" type="file" onChange={e => setMatFile(e.target.files[0])} />}
                                    <div className="flex justify-end"><button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-all">Publicera Material</button></div>
                                </form>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {materials.map(mat => {
                                const youtubeId = getYoutubeEmbed(mat.link);
                                const isRead = readMaterials[mat.id];
                                return (
                                    <div key={mat.id} className={`bg-white rounded-xl border p-6 transition-all hover:shadow-lg flex flex-col ${isRead ? 'border-green-200 bg-green-50/20' : 'border-gray-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-2.5 rounded-xl border ${isRead ? 'bg-green-100 text-green-600 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>{getIcon(mat.type)}</div>
                                            <div className="flex gap-1">
                                                <button onClick={() => toggleReadStatus(mat.id)} className={`p-2 rounded-full transition-colors ${isRead ? 'text-green-600 bg-green-100 hover:bg-green-200' : 'text-gray-300 hover:bg-gray-100 hover:text-gray-600'}`} title={isRead ? "Markerad som läst" : "Markera som läst"}>{isRead ? <CheckCircle size={18}/> : <Eye size={18}/>}</button>
                                                {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && <button onClick={() => handleDeleteMaterial(mat.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18}/></button>}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight">{mat.title}</h3>
                                        {youtubeId && <iframe className="w-full h-40 rounded-lg mb-4 shadow-sm" src={`https://www.youtube.com/embed/${youtubeId}`} frameBorder="0" allowFullScreen title="video"></iframe>}
                                        <p className="text-sm text-gray-600 mb-6 flex-1 whitespace-pre-wrap leading-relaxed">{mat.content}</p>
                                        <div className="pt-4 border-t border-gray-100 mt-auto">
                                            {mat.fileUrl ? <a href={`http://127.0.0.1:8080${mat.fileUrl}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 bg-indigo-50 p-2 rounded-lg justify-center transition-colors"><Download size={16}/> Ladda ner fil</a> : null}
                                            {mat.link && !youtubeId && <a href={mat.link} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2 bg-blue-50 p-2 rounded-lg justify-center transition-colors"><LinkIcon size={16}/> Öppna länk</a>}
                                        </div>
                                    </div>
                                )})}
                        </div>
                    </div>
                )}

                {/* 6. UPPGIFTER */}
                {activeTab === 'assignments' && (
                    <div className="animate-in fade-in">
                        {!selectedAssignment ? (
                            <div className="space-y-6">
                                {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && (
                                    <button onClick={() => setShowAssignmentModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold shadow-md shadow-indigo-200">
                                        <Plus size={20}/> Skapa Ny Uppgift
                                    </button>
                                )}
                                <div className="grid gap-4">
                                    {assignments.map(assign => (
                                        <div key={assign.id} onClick={() => setSelectedAssignment(assign)} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all flex justify-between items-center group">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700 transition-colors mb-1">{assign.title}</h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded text-xs font-medium"><Clock size={14}/> Deadline: {new Date(assign.dueDate).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
                                                <ChevronRight className="text-gray-400 group-hover:text-indigo-600"/>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-right-8 duration-300">
                                <button onClick={() => setSelectedAssignment(null)} className="text-sm font-bold text-gray-500 hover:text-indigo-600 mb-6 flex items-center gap-2 transition-colors">
                                    <ArrowLeft size={16}/> Tillbaka till listan
                                </button>

                                <div className="bg-white rounded-2xl border p-8 mb-8 shadow-sm">
                                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 border-b border-gray-100 pb-6">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedAssignment.title}</h2>
                                            <div className="flex items-center gap-2 text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-lg w-fit">
                                                <Clock size={18}/><span>Deadline: {new Date(selectedAssignment.dueDate).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600"><CheckSquare size={32}/></div>
                                    </div>
                                    <div className="prose prose-indigo text-gray-600 max-w-none whitespace-pre-wrap leading-relaxed text-lg">{selectedAssignment.description}</div>
                                </div>

                                {/* STUDENTENS INLÄMNING */}
                                {currentUser.role === 'STUDENT' && (
                                    <div className="bg-white rounded-2xl border p-8 shadow-sm">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800"><Upload size={24} className="text-indigo-600"/> Din Inlämning</h3>
                                        {getMySubmission() ? (
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                                <div className="flex items-center gap-3 text-green-800 font-bold mb-2 text-lg"><CheckCircle size={24}/> Inlämnad</div>
                                                <p className="text-sm text-green-700 mb-1">Fil: <span className="font-mono bg-white/50 px-2 py-0.5 rounded">{getMySubmission().fileName}</span></p>
                                                <p className="text-xs text-green-600 mb-4 font-medium uppercase tracking-wide">{new Date(getMySubmission().submittedAt).toLocaleString()}</p>
                                                {getMySubmission().grade && (
                                                    <div className="mt-4 pt-4 border-t border-green-200">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="bg-white p-2 rounded-lg text-indigo-600 shadow-sm"><GraduationCap size={24}/></div>
                                                            <span className="font-bold text-gray-900 text-lg">Betyg: <span className={getMySubmission().grade === 'IG' ? 'text-red-600' : 'text-green-600'}>{getMySubmission().grade}</span></span>
                                                        </div>
                                                        {getMySubmission().feedback && (
                                                            <div className="bg-white/60 p-4 rounded-lg text-gray-700 italic border border-green-100 text-sm">
                                                                "{getMySubmission().feedback}"
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <form onSubmit={handleStudentSubmit} className="space-y-6">
                                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-gray-50 transition-all cursor-pointer relative">
                                                    <Upload size={40} className="text-gray-400 mb-4"/>
                                                    <p className="font-bold text-gray-700">Klicka för att välja fil</p>
                                                    <p className="text-sm text-gray-500 mb-4">eller dra och släpp här</p>
                                                    <input type="file" onChange={e => setSubmissionFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer"/>
                                                    <div className="text-xs text-gray-400 mt-2">PDF, DOCX, ZIP (Max 10MB)</div>
                                                </div>
                                                <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.01]">Lämna In Uppgift</button>
                                            </form>
                                        )}
                                    </div>
                                )}

                                {/* LÄRARENS RÄTTNINGSVY */}
                                {(currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') && (
                                    <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                                        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-800 flex items-center gap-2"><Users size={20}/> Inlämningar ({submissions.length})</h3>
                                        </div>
                                        {submissions.length === 0 ? <div className="p-8 text-center text-gray-500 italic">Inga inlämningar än.</div> : (
                                            <div className="divide-y">
                                                {submissions.map(sub => (
                                                    <div key={sub.id} className="p-6 hover:bg-indigo-50/30 transition-colors">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className="flex gap-4">
                                                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                                                                    {sub.studentName?.[0]}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-gray-900 text-lg">{sub.studentName}</h4>
                                                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                                        <span className="flex items-center gap-1"><Clock size={14}/> {new Date(sub.submittedAt).toLocaleDateString()}</span>
                                                                        <a href={`http://127.0.0.1:8080${sub.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 font-medium bg-indigo-50 px-2 py-0.5 rounded">
                                                                            <File size={14}/> {sub.fileName}
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {sub.grade ? (
                                                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${sub.grade === 'IG' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                                    {sub.grade}
                                                                </span>
                                                            ) : (
                                                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">Ny Inlämning</span>
                                                            )}
                                                        </div>

                                                        {/* Rättningsformulär */}
                                                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                                            <div className="flex gap-4 mb-4">
                                                                <div className="w-32">
                                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Betyg</label>
                                                                    <select
                                                                        className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                                                        value={grading[sub.id]?.grade || 'G'}
                                                                        onChange={e => setGrading({...grading, [sub.id]: { ...grading[sub.id], grade: e.target.value }})}
                                                                    >
                                                                        <option value="IG">IG</option>
                                                                        <option value="G">G</option>
                                                                        <option value="VG">VG</option>
                                                                    </select>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Feedback till eleven</label>
                                                                    <input
                                                                        className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                                        placeholder="Skriv en kommentar..."
                                                                        value={grading[sub.id]?.feedback || ''}
                                                                        onChange={e => setGrading({...grading, [sub.id]: { ...grading[sub.id], feedback: e.target.value }})}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <button
                                                                    onClick={() => handleGradeSubmission(sub.id)}
                                                                    className="text-sm bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-bold shadow-sm transition-colors"
                                                                >
                                                                    Spara Bedömning
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDetail;