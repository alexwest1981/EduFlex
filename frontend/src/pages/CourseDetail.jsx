import React, { useState } from 'react';
import {
    Plus, ArrowLeft, CheckCircle, Eye, Trash2, Video,
    Link as LinkIcon, Download, Clock, ChevronRight,
    Upload, GraduationCap, CheckSquare, File, Users, UserPlus,
    ClipboardList, PlayCircle
} from 'lucide-react';

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

    // State för utvärderingsbyggaren
    const [evalQuestions, setEvalQuestions] = useState(['']);

    // Filtrera studenter
    const availableStudents = users ? users.filter(u =>
        u.role === 'STUDENT' && !currentCourse.students?.some(s => s.id === u.id)
    ) : [];

    // Hantera frågor i byggaren
    const addQuestion = () => {
        if (evalQuestions.length < 10) setEvalQuestions([...evalQuestions, '']);
    };
    const updateQuestion = (idx, text) => {
        const newQ = [...evalQuestions];
        newQ[idx] = text;
        setEvalQuestions(newQ);
    };
    const removeQuestion = (idx) => {
        const newQ = evalQuestions.filter((_, i) => i !== idx);
        setEvalQuestions(newQ);
    };

    return (
        <div className="animate-in slide-in-from-right-4 duration-500">
            <button onClick={() => navigateTo('courses')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6">
                <ArrowLeft size={18}/> Tillbaka
            </button>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-l-4 border-l-indigo-600 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{currentCourse.courseCode}</span>
                        <h1 className="text-4xl font-bold mt-4 mb-2">{currentCourse.name}</h1>
                        <p className="text-gray-600">{currentCourse.description}</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-sm text-gray-500">Lärare</div>
                        <div className="font-bold text-gray-800">{currentCourse.teacher?.fullName || "Ej tilldelad"}</div>
                    </div>
                </div>
            </div>

            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                <button onClick={() => { setActiveTab('material'); setSelectedAssignment(null); }} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${activeTab === 'material' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Kursmaterial</button>
                <button onClick={() => { setActiveTab('assignments'); setSelectedAssignment(null); }} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${activeTab === 'assignments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Uppgifter</button>
                <button onClick={() => { setActiveTab('students'); setSelectedAssignment(null); }} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${activeTab === 'students' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Deltagare ({currentCourse.students?.length || 0})</button>

                {(currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') && (
                    <button onClick={() => { setActiveTab('evaluation'); setSelectedAssignment(null); }} className={`px-6 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${activeTab === 'evaluation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Utvärdering</button>
                )}
            </div>

            {/* --- FLIK: DELTAGARE --- */}
            {activeTab === 'students' && (
                <div className="space-y-6">
                    {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && (
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><UserPlus size={20} className="text-indigo-600"/> Lägg till Student</h3>
                            <div className="flex gap-4">
                                <select className="flex-1 border rounded-lg px-4 py-2 bg-gray-50" value={selectedStudentToAdd} onChange={(e) => setSelectedStudentToAdd(e.target.value)}>
                                    <option value="">-- Välj student --</option>
                                    {availableStudents.map(s => (<option key={s.id} value={s.id}>{s.fullName} ({s.username})</option>))}
                                </select>
                                <button onClick={() => { handleAddStudentToCourse(selectedStudentToAdd); setSelectedStudentToAdd(''); }} disabled={!selectedStudentToAdd} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">Lägg till</button>
                            </div>
                        </div>
                    )}
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <div className="p-6 border-b bg-gray-50"><h3 className="font-bold text-gray-800 flex items-center gap-2"><Users size={18}/> Kursdeltagare</h3></div>
                        {currentCourse.students?.length > 0 ? (
                            <div className="divide-y">{currentCourse.students.map(student => (
                                <div key={student.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">{student.firstName?.[0]}{student.lastName?.[0]}</div>
                                        <div><div className="font-bold text-gray-900">{student.firstName} {student.lastName}</div><div className="text-xs text-gray-500">{student.username}</div></div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Registrerad</span>
                                </div>
                            ))}</div>
                        ) : <div className="p-8 text-center text-gray-500 italic">Inga studenter registrerade.</div>}
                    </div>
                </div>
            )}

            {/* --- FLIK: UTVÄRDERING --- */}
            {activeTab === 'evaluation' && (currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') && (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                        <h2 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2"><ClipboardList/> Kursutvärdering</h2>
                        <p className="text-blue-700 mb-4 text-sm">Här kan du skapa en utvärdering som eleverna kan svara på. När du aktiverar den dyker den upp på deras Dashboard.</p>

                        {currentCourse.evaluation && currentCourse.evaluation.active ? (
                            <div className="bg-white p-6 rounded-lg border border-blue-100 shadow-sm">
                                <div className="flex items-center gap-3 text-green-600 font-bold mb-4">
                                    <CheckCircle size={24}/> Utvärdering Aktiv
                                </div>
                                <p className="text-gray-600 mb-4">Utvärderingen är igång och eleverna kan svara.</p>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-sm text-gray-500 uppercase">Frågor:</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-700">
                                        {currentCourse.evaluation.questions.map((q, i) => <li key={i}>{q}</li>)}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-lg border shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4">Bygg frågor (Max 10)</h3>
                                <div className="space-y-3 mb-6">
                                    {evalQuestions.map((q, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <span className="text-gray-400 font-bold w-6">{idx + 1}.</span>
                                            <input
                                                className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder={`Fråga ${idx + 1}...`}
                                                value={q}
                                                onChange={(e) => updateQuestion(idx, e.target.value)}
                                            />
                                            {evalQuestions.length > 1 && (
                                                <button onClick={() => removeQuestion(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={addQuestion}
                                        disabled={evalQuestions.length >= 10}
                                        className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <Plus size={16}/> Lägg till fråga
                                    </button>

                                    <button
                                        onClick={() => handleCreateEvaluation(evalQuestions.filter(q => q.trim() !== ''))}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-sm flex items-center gap-2"
                                    >
                                        <PlayCircle size={20}/> Aktivera Utvärdering
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- FLIK: MATERIAL --- */}
            {activeTab === 'material' && (
                <div className="space-y-8">
                    {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && (
                        <div className="bg-gray-50 border border-dashed p-6 rounded-xl">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18}/> Nytt Material</h3>
                            <form onSubmit={handleMaterialSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="border rounded-lg px-4 py-2" placeholder="Titel" value={matTitle} onChange={e => setMatTitle(e.target.value)} />
                                    <select className="border rounded-lg px-4 py-2 bg-white" value={matType} onChange={e => setMatType(e.target.value)}><option value="TEXT">Text</option><option value="VIDEO">Video</option><option value="FILE">Fil</option><option value="LINK">Länk</option></select>
                                </div>
                                <textarea className="border rounded-lg w-full px-4 py-2" placeholder="Innehåll..." value={matContent} onChange={e => setMatContent(e.target.value)} />
                                {(matType === 'VIDEO' || matType === 'LINK') && <input className="border rounded-lg w-full px-4 py-2" placeholder="Länk..." value={matLink} onChange={e => setMatLink(e.target.value)} />}
                                {matType === 'FILE' && <input id="matFileInput" type="file" onChange={e => setMatFile(e.target.files[0])} />}
                                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg">Publicera</button>
                            </form>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map(mat => {
                            const youtubeId = getYoutubeEmbed(mat.link);
                            const isRead = readMaterials[mat.id];
                            return (
                                <div key={mat.id} className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-lg ${isRead ? 'border-green-200 bg-green-50/30' : ''}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-gray-50 rounded-lg border">{getIcon(mat.type)}</div>
                                        <div className="flex gap-1">
                                            <button onClick={() => toggleReadStatus(mat.id)} className={`p-1.5 rounded-full ${isRead ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}>{isRead ? <CheckCircle size={18}/> : <Eye size={18}/>}</button>
                                            {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && <button onClick={() => handleDeleteMaterial(mat.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>}
                                        </div>
                                    </div>
                                    <h3 className="font-bold mb-2">{mat.title}</h3>
                                    {youtubeId && <iframe className="w-full h-40 rounded-lg mb-4" src={`https://www.youtube.com/embed/${youtubeId}`} frameBorder="0" allowFullScreen title="video"></iframe>}
                                    <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{mat.content}</p>
                                    {mat.fileUrl ? <a href={`http://127.0.0.1:8080${mat.fileUrl}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Download size={14}/> Ladda ner</a> : null}
                                    {mat.link && !youtubeId && <a href={mat.link} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 flex items-center gap-1"><LinkIcon size={14}/> Öppna länk</a>}
                                </div>
                            )})}
                    </div>
                </div>
            )}

            {/* --- FLIK: UPPGIFTER --- */}
            {activeTab === 'assignments' && (
                <div>
                    {!selectedAssignment ? (
                        <div className="space-y-6">
                            {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && (
                                <button onClick={() => setShowAssignmentModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                                    <Plus size={18}/> Skapa Ny Uppgift
                                </button>
                            )}
                            <div className="grid gap-4">
                                {assignments.map(assign => (
                                    <div key={assign.id} onClick={() => setSelectedAssignment(assign)} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center group">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{assign.title}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                <span className="flex items-center gap-1"><Clock size={14}/> Deadline: {new Date(assign.dueDate).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-gray-300 group-hover:text-indigo-500"/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <button onClick={() => setSelectedAssignment(null)} className="text-sm text-gray-500 hover:text-indigo-600 mb-4 flex items-center gap-1">
                                <ArrowLeft size={14}/> Tillbaka
                            </button>

                            <div className="bg-white rounded-xl border p-8 mb-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedAssignment.title}</h2>
                                        <div className="flex items-center gap-2 text-indigo-600 mt-2 font-medium">
                                            <Clock size={18}/><span>Deadline: {new Date(selectedAssignment.dueDate).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600"><CheckSquare size={24}/></div>
                                </div>
                                <div className="prose text-gray-600 max-w-none whitespace-pre-wrap">{selectedAssignment.description}</div>
                            </div>

                            {/* STUDENTENS INLÄMNING */}
                            {currentUser.role === 'STUDENT' && (
                                <div className="bg-white rounded-xl border p-6">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Upload size={20}/> Din Inlämning</h3>
                                    {getMySubmission() ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center gap-3 text-green-800 font-bold mb-2"><CheckCircle size={20}/> Inlämnad</div>
                                            <p className="text-sm text-green-700">Fil: <strong>{getMySubmission().fileName}</strong></p>
                                            <p className="text-xs text-green-600 mt-1">{new Date(getMySubmission().submittedAt).toLocaleString()}</p>
                                            {getMySubmission().grade && (
                                                <div className="mt-4 pt-4 border-t border-green-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <GraduationCap size={20} className="text-indigo-600"/>
                                                        <span className="font-bold text-gray-800">Betyg: {getMySubmission().grade}</span>
                                                    </div>
                                                    {getMySubmission().feedback && (<p className="text-sm text-gray-600 italic">"{getMySubmission().feedback}"</p>)}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <form onSubmit={handleStudentSubmit} className="space-y-4">
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500">
                                                <input type="file" onChange={e => setSubmissionFile(e.target.files[0])} className="mb-4"/>
                                                <p className="text-sm">Välj en fil att ladda upp.</p>
                                            </div>
                                            <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Lämna In</button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* LÄRARENS INLÄMNINGSLISTA (MED RÄTTNING) */}
                            {(currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') && (
                                <div className="bg-white rounded-xl border overflow-hidden">
                                    <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-800">Inlämningar ({submissions.length})</h3>
                                    </div>
                                    <div className="divide-y">
                                        {submissions.map(sub => (
                                            <div key={sub.id} className="p-6 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-lg">{sub.studentName}</h4>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                            <span>{new Date(sub.submittedAt).toLocaleString()}</span>
                                                            <span>•</span>
                                                            <a href={`http://127.0.0.1:8080${sub.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                                                                <File size={14}/> {sub.fileName}
                                                            </a>
                                                        </div>
                                                    </div>
                                                    {sub.grade ? (
                                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${sub.grade === 'IG' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                            Betyg: {sub.grade}
                                                        </span>
                                                    ) : (
                                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Ej Rättad</span>
                                                    )}
                                                </div>

                                                {/* RÄTTNINGS-SEKTIONEN (FIXAD SYNTAX HÄR) */}
                                                <div className="bg-gray-50 p-4 rounded-lg border">
                                                    <div className="flex gap-4 mb-3">
                                                        <div className="w-32">
                                                            <label className="block text-xs font-bold text-gray-500 mb-1">Betyg</label>
                                                            <select
                                                                className="w-full border rounded p-1 bg-white"
                                                                value={grading[sub.id]?.grade || 'G'}
                                                                onChange={e => setGrading({...grading, [sub.id]: { ...grading[sub.id], grade: e.target.value }})}
                                                            >
                                                                <option value="IG">IG</option>
                                                                <option value="G">G</option>
                                                                <option value="VG">VG</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="block text-xs font-bold text-gray-500 mb-1">Feedback</label>
                                                            <input
                                                                className="w-full border rounded p-1 bg-white"
                                                                placeholder="Kommentar..."
                                                                value={grading[sub.id]?.feedback || ''}
                                                                onChange={e => setGrading({...grading, [sub.id]: { ...grading[sub.id], feedback: e.target.value }})}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <button
                                                            onClick={() => handleGradeSubmission(sub.id)}
                                                            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 font-medium"
                                                        >
                                                            Spara
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseDetail;