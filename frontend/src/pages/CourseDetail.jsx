import React from 'react';
import {
    ArrowLeft, BookOpen, FileText, CheckSquare, Users,
    Plus, Trash2, Download, ExternalLink, PlayCircle,
    HelpCircle, Clock, Award
} from 'lucide-react';

const CourseDetail = ({
                          currentCourse,
                          activeTab,
                          setActiveTab,
                          selectedAssignment,
                          setSelectedAssignment,
                          currentUser,
                          materials,
                          assignments,
                          submissions,
                          grading,
                          setGrading,
                          readMaterials,
                          setShowAssignmentModal,
                          handleMaterialSubmit,
                          handleStudentSubmit,
                          handleGradeSubmission,
                          handleDeleteMaterial,
                          toggleReadStatus,
                          getIcon,
                          getYoutubeEmbed,
                          getMySubmission,
                          matTitle, setMatTitle,
                          matContent, setMatContent,
                          matLink, setMatLink,
                          matType, setMatType,
                          setMatFile,
                          setSubmissionFile,
                          navigateTo,
                          users,
                          handleAddStudentToCourse,
                          handleCreateEvaluation,
                          // NYA PROPS
                          quizzes = [],
                          onStartQuiz,
                          onOpenQuizBuilder
                      }) => {

    const isTeacher = currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN';
    const students = users.filter(u => u.role === 'STUDENT');
    const enrolledStudentIds = currentCourse.students?.map(s => s.id) || [];
    const availableStudents = students.filter(s => !enrolledStudentIds.includes(s.id));

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <button onClick={() => navigateTo('dashboard')} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Tillbaka till översikten
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8"></div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 relative z-10">{currentCourse.name}</h1>
                <div className="flex items-center gap-4 text-gray-500 text-sm mb-6 relative z-10">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-mono font-bold">{currentCourse.courseCode}</span>
                    <span>{currentCourse.teacher?.fullName}</span>
                    <span>{currentCourse.startDate} — {currentCourse.endDate}</span>
                </div>
                <p className="text-gray-600 max-w-2xl relative z-10">{currentCourse.description}</p>

                {/* Course Tabs */}
                <div className="flex gap-6 mt-8 border-b border-gray-100">
                    <button onClick={() => setActiveTab('material')} className={`pb-3 flex items-center gap-2 transition-colors ${activeTab === 'material' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}>
                        <BookOpen size={18} /> Material
                    </button>
                    <button onClick={() => setActiveTab('assignments')} className={`pb-3 flex items-center gap-2 transition-colors ${activeTab === 'assignments' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}>
                        <FileText size={18} /> Uppgifter
                    </button>
                    {/* NY FLIK: QUIZ */}
                    <button onClick={() => setActiveTab('quiz')} className={`pb-3 flex items-center gap-2 transition-colors ${activeTab === 'quiz' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}>
                        <HelpCircle size={18} /> Quiz & Prov
                    </button>
                    {isTeacher && (
                        <button onClick={() => setActiveTab('students')} className={`pb-3 flex items-center gap-2 transition-colors ${activeTab === 'students' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}>
                            <Users size={18} /> Studenter & Betyg
                        </button>
                    )}
                </div>
            </div>

            {/* --- FLIK: MATERIAL --- */}
            {activeTab === 'material' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {materials.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <BookOpen size={48} className="mx-auto text-gray-300 mb-3"/>
                                <p className="text-gray-500">Inget kursmaterial uppladdat än.</p>
                            </div>
                        ) : (
                            materials.map(m => (
                                <div key={m.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className={`mt-1 p-2 rounded-lg ${readMaterials[m.id] ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                {getIcon(m.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{m.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1 mb-3">{m.content}</p>
                                                {m.link && (
                                                    m.type === 'VIDEO' && getYoutubeEmbed(m.link) ? (
                                                        <div className="mt-2 rounded-lg overflow-hidden shadow-lg max-w-md">
                                                            <iframe width="100%" height="200" src={`https://www.youtube.com/embed/${getYoutubeEmbed(m.link)}`} title="Video" frameBorder="0" allowFullScreen></iframe>
                                                        </div>
                                                    ) : (
                                                        <a href={m.link} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:underline flex items-center gap-1"><ExternalLink size={14}/> Öppna länk</a>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => toggleReadStatus(m.id)} className={`text-xs px-3 py-1 rounded-full font-bold transition-colors ${readMaterials[m.id] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                                {readMaterials[m.id] ? 'Läst' : 'Markera som läst'}
                                            </button>
                                            {isTeacher && (
                                                <button onClick={() => handleDeleteMaterial(m.id)} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {isTeacher && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18}/> Lägg till Material</h3>
                            <form onSubmit={handleMaterialSubmit} className="space-y-4">
                                <input className="w-full border p-2 rounded-lg text-sm" placeholder="Titel" value={matTitle} onChange={e => setMatTitle(e.target.value)} required />
                                <textarea className="w-full border p-2 rounded-lg text-sm" placeholder="Beskrivning" value={matContent} onChange={e => setMatContent(e.target.value)} />
                                <select className="w-full border p-2 rounded-lg text-sm bg-white" value={matType} onChange={e => setMatType(e.target.value)}>
                                    <option value="TEXT">Text / Artikel</option>
                                    <option value="VIDEO">Video (YouTube)</option>
                                    <option value="LINK">Extern Länk</option>
                                    <option value="FILE">Fil (PDF/Doc)</option>
                                </select>
                                {matType !== 'FILE' && <input className="w-full border p-2 rounded-lg text-sm" placeholder="Länk (URL)" value={matLink} onChange={e => setMatLink(e.target.value)} />}
                                {matType === 'FILE' && <input type="file" className="w-full text-sm" onChange={e => setMatFile(e.target.files[0])} />}
                                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">Ladda upp</button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* --- FLIK: UPPGIFTER --- */}
            {activeTab === 'assignments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-lg">Inlämningsuppgifter</h3>
                            {isTeacher && <button onClick={() => setShowAssignmentModal(true)} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold hover:bg-indigo-200">+ Ny Uppgift</button>}
                        </div>
                        {assignments.map(a => (
                            <div
                                key={a.id}
                                onClick={() => setSelectedAssignment(a)}
                                className={`p-5 rounded-xl border cursor-pointer transition-all ${selectedAssignment?.id === a.id ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-gray-200 hover:border-indigo-300'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{a.title}</h4>
                                        <p className="text-sm text-gray-500 mb-2">Deadline: {a.dueDate}</p>
                                    </div>
                                    <div className="bg-orange-100 text-orange-700 p-2 rounded-full"><Clock size={16}/></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 min-h-[400px]">
                        {selectedAssignment ? (
                            <>
                                <h3 className="text-xl font-bold mb-2">{selectedAssignment.title}</h3>
                                <p className="text-gray-600 mb-6">{selectedAssignment.description}</p>

                                {isTeacher ? (
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-500 uppercase mb-4">Inlämningar att rätta</h4>
                                        <div className="space-y-3">
                                            {submissions.length === 0 && <p className="text-sm text-gray-400 italic">Inga inlämningar än.</p>}
                                            {submissions.map(s => (
                                                <div key={s.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-sm">{s.studentName}</span>
                                                        <span className="text-xs text-gray-400">{s.submittedAt}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-3 text-sm text-indigo-600 bg-indigo-50 p-2 rounded">
                                                        <File size={14}/> <span className="truncate">inlämning_v1.pdf</span> <Download size={14} className="ml-auto cursor-pointer"/>
                                                    </div>
                                                    {s.grade ? (
                                                        <div className="text-sm bg-green-50 text-green-700 p-2 rounded border border-green-200 flex justify-between">
                                                            <span>Betyg: <b>{s.grade}</b></span>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <select
                                                                className="w-full text-sm border p-1 rounded"
                                                                onChange={(e) => setGrading({...grading, [s.id]: { ...grading[s.id], grade: e.target.value }})}
                                                            >
                                                                <option value="">- Sätt Betyg -</option>
                                                                <option value="IG">IG (Underkänd)</option>
                                                                <option value="G">G (Godkänd)</option>
                                                                <option value="VG">VG (Väl Godkänd)</option>
                                                            </select>
                                                            <input
                                                                className="w-full text-sm border p-1 rounded"
                                                                placeholder="Feedback..."
                                                                onChange={(e) => setGrading({...grading, [s.id]: { ...grading[s.id], feedback: e.target.value }})}
                                                            />
                                                            <button onClick={() => handleGradeSubmission(s.id)} className="w-full bg-indigo-600 text-white text-xs py-1.5 rounded font-bold hover:bg-indigo-700">Spara Bedömning</button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
                                        {getMySubmission() ? (
                                            <div>
                                                <CheckCircle size={48} className="mx-auto text-green-500 mb-2"/>
                                                <h3 className="font-bold text-green-700">Inlämnad!</h3>
                                                <p className="text-sm text-gray-500 mb-4">Du lämnade in {getMySubmission().submittedAt}</p>
                                                {getMySubmission().grade && (
                                                    <div className="bg-indigo-50 p-4 rounded-lg text-indigo-900 mt-4">
                                                        <p className="font-bold text-lg">Betyg: {getMySubmission().grade}</p>
                                                        <p className="text-sm italic">"{getMySubmission().feedback}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <form onSubmit={handleStudentSubmit}>
                                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-4 hover:bg-gray-50 transition-colors">
                                                    <input type="file" onChange={e => setSubmissionFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                                                </div>
                                                <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">Lämna in uppgift</button>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <FileText size={48} className="mb-2 opacity-50"/>
                                <p>Välj en uppgift till vänster</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- NY FLIK: QUIZ & PROV --- */}
            {activeTab === 'quiz' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                        <div>
                            <h2 className="text-xl font-bold text-indigo-900">Quiz & Diagnostiska Prov</h2>
                            <p className="text-indigo-700 text-sm">Testa dina kunskaper och få direkt feedback.</p>
                        </div>
                        {isTeacher && (
                            <button onClick={onOpenQuizBuilder} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2">
                                <Plus size={18} /> Skapa Nytt Quiz
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes && quizzes.length > 0 ? (
                            quizzes.filter(q => q.courseId === currentCourse.id).map(quiz => (
                                <div key={quiz.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                                            <HelpCircle size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            {quiz.questions.length} Frågor
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{quiz.title}</h3>
                                    <p className="text-sm text-gray-500 mb-6">Testa dina kunskaper inom detta område.</p>

                                    <button
                                        onClick={() => onStartQuiz(quiz)}
                                        className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <PlayCircle size={18} /> Starta Quiz
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                                <Award size={48} className="mx-auto mb-2 opacity-50"/>
                                <p>Inga quiz tillgängliga för denna kurs än.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- FLIK: STUDENTER & BETYG (Lärare) --- */}
            {activeTab === 'students' && isTeacher && (
                <div className="space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Kursdeltagare</h3>
                            <div className="flex gap-2">
                                <select id="studentSelect" className="text-sm border p-2 rounded-lg w-64">
                                    <option value="">Välj student att lägga till...</option>
                                    {availableStudents.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.username})</option>)}
                                </select>
                                <button
                                    onClick={() => {
                                        const sid = document.getElementById('studentSelect').value;
                                        if(sid) handleAddStudentToCourse(sid);
                                    }}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700"
                                >
                                    Lägg till
                                </button>
                            </div>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase">
                            <tr>
                                <th className="p-4">Namn</th>
                                <th className="p-4">Användarnamn</th>
                                <th className="p-4">Roll</th>
                                <th className="p-4">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {currentCourse.students?.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-900">{s.fullName}</td>
                                    <td className="p-4 text-gray-600">{s.username}</td>
                                    <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">STUDENT</span></td>
                                    <td className="p-4 text-green-600 font-bold flex items-center gap-1"><CheckSquare size={14}/> Aktiv</td>
                                </tr>
                            ))}
                            {(!currentCourse.students || currentCourse.students.length === 0) && (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-400">Inga studenter registrerade på kursen.</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                        <h3 className="font-bold text-indigo-900 mb-4">Kursutvärdering</h3>
                        {currentCourse.evaluation && currentCourse.evaluation.active ? (
                            <div className="bg-white p-4 rounded shadow-sm">
                                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold mb-2">Aktiv</span>
                                <p className="text-sm text-gray-600">Utvärdering pågår. Resultat visas när den stängs.</p>
                            </div>
                        ) : (
                            <button onClick={() => handleCreateEvaluation(['Hur upplevde du kursens tempo?', 'Vad var mest lärorikt?', 'Övriga kommentarer'])} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-indigo-700">Starta Utvärdering</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetail;