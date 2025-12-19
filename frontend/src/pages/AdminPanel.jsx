import React from 'react';
import { Plus, Trash2, File } from 'lucide-react';
import { RegistrationForm } from '../components/Auth.jsx'; // Återanvänd formuläret

const AdminPanel = ({
                        adminTab, setAdminTab, users, currentUser, handleAttemptDeleteUser,
                        courses, setShowCourseModal, handleDeleteCourse,
                        allDocuments, fetchAllDocuments, handleDeleteDoc,
                        // Props för RegistrationForm
                        registerForm, setRegisterForm, handleRegister, handleGenerateUsernames, usernameSuggestions
                    }) => {

    return (
        <div className="animate-in fade-in">
            <h1 className="text-3xl font-bold mb-6">Systemadministration</h1>
            <div className="flex border-b border-gray-200 mb-6 space-x-6">
                {['users', 'courses', 'docs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setAdminTab(tab)}
                        className={`pb-3 font-medium transition-colors border-b-2 ${adminTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab === 'users' ? 'Användare' : tab === 'courses' ? 'Kurser' : 'Dokumentarkiv'}
                    </button>
                ))}
            </div>

            {/* USERS TAB */}
            {adminTab === 'users' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl border h-fit">
                        <h3 className="font-bold mb-4">Registrera Ny Användare</h3>
                        <RegistrationForm
                            isAdminContext={true}
                            registerForm={registerForm}
                            setRegisterForm={setRegisterForm}
                            handleRegister={handleRegister}
                            handleGenerateUsernames={handleGenerateUsernames}
                            usernameSuggestions={usernameSuggestions}
                        />
                    </div>
                    <div className="bg-white p-6 rounded-xl border h-fit">
                        <h3 className="font-bold mb-4">Alla Användare ({users.length})</h3>
                        <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                            {users.map(u => (
                                <div key={u.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'TEACHER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {u.role[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold">{u.fullName}</div>
                                            <div className="text-xs text-gray-500">{u.username}</div>
                                        </div>
                                    </div>
                                    {u.id !== currentUser.id && (
                                        <button onClick={() => handleAttemptDeleteUser(u)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors">
                                            <Trash2 size={18}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* COURSES TAB */}
            {adminTab === 'courses' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-500">Hantera alla kurser i systemet.</p>
                        <button onClick={() => setShowCourseModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm transition-all">
                            <Plus size={18}/> Skapa Ny Kurs
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(c => (
                            <div key={c.id} className="bg-white p-6 rounded-xl border shadow-sm relative group hover:shadow-md transition-shadow">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => handleDeleteCourse(c.id, e)} className="p-2 bg-white text-red-500 shadow-sm border rounded-lg hover:bg-red-50 transition-colors" title="Radera kurs">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{c.courseCode}</span>
                                <h3 className="text-lg font-bold mt-2">{c.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">Lärare: {c.teacher?.fullName}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">Startdatum: {c.startDate || 'Ej satt'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DOCS TAB */}
            {adminTab === 'docs' && (
                <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold">Systemarkiv ({allDocuments.length} filer)</h3>
                        <button onClick={fetchAllDocuments} className="text-sm text-indigo-600 hover:underline font-medium">Uppdatera lista</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Filnamn</th>
                                <th className="px-6 py-3">Ägare</th>
                                <th className="px-6 py-3">Typ</th>
                                <th className="px-6 py-3">Datum</th>
                                <th className="px-6 py-3 text-right">Åtgärd</th>
                            </tr>
                            </thead>
                            <tbody>
                            {allDocuments.map(doc => (
                                <tr key={doc.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                        <File size={16} className="text-gray-400"/>
                                        {doc.fileName || doc.title}
                                    </td>
                                    <td className="px-6 py-4">{doc.owner?.fullName || "Okänd"}</td>
                                    <td className="px-6 py-4"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">{doc.type}</span></td>
                                    <td className="px-6 py-4 text-gray-500">{doc.uploadDate}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <a href={`http://127.0.0.1:8080${doc.fileUrl}`} target="_blank" className="text-indigo-600 hover:text-indigo-800 font-medium">Ladda ner</a>
                                            <button onClick={() => handleDeleteDoc(doc.id, true)} className="text-red-500 hover:text-red-700 font-medium">Ta bort</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {allDocuments.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">Inga filer i systemet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;