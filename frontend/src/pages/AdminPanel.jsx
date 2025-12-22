import React, { useState } from 'react';
import {
    Users, BookOpen, FileText, Trash2, Plus,
    MoreVertical, Settings, ExternalLink, X, Save, Palette
} from 'lucide-react';

// Färgval för kurs-widgets
const WIDGET_COLORS = [
    { name: 'Indigo', value: 'bg-indigo-600' },
    { name: 'Blue', value: 'bg-blue-600' },
    { name: 'Green', value: 'bg-emerald-600' },
    { name: 'Red', value: 'bg-red-600' },
    { name: 'Orange', value: 'bg-orange-500' },
    { name: 'Purple', value: 'bg-purple-600' },
    { name: 'Gray', value: 'bg-gray-700' },
    { name: 'Pink', value: 'bg-pink-600' },
];

const EditCourseModal = ({ course, onClose, onSave }) => {
    const [formData, setFormData] = useState({ ...course });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg">Redigera Kursinställningar</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Kursnamn</label>
                        <input
                            className="w-full border p-2 rounded-lg"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Kurskod</label>
                            <input
                                className="w-full border p-2 rounded-lg font-mono uppercase"
                                value={formData.courseCode}
                                onChange={e => setFormData({...formData, courseCode: e.target.value.toUpperCase()})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Färgtema</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {WIDGET_COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => setFormData({...formData, color: c.value})}
                                        className={`w-6 h-6 rounded-full ${c.value} ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Beskrivning</label>
                        <textarea
                            className="w-full border p-2 rounded-lg h-24 resize-none"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Avbryt</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2">
                            <Save size={16}/> Spara ändringar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminPanel = ({
                        adminTab, setAdminTab, users, currentUser, handleAttemptDeleteUser,
                        courses, setShowCourseModal, handleDeleteCourse, handleUpdateCourse,
                        allDocuments, fetchAllDocuments, handleDeleteDoc, navigateTo,
                        registerForm, setRegisterForm, handleRegister, handleGenerateUsernames,
                        usernameSuggestions, checkUsernameAvailability
                    }) => {

    const [editingCourse, setEditingCourse] = useState(null);

    // Filtrera bort chattfiler från arkivet
    const safeDocuments = Array.isArray(allDocuments) ? allDocuments.filter(d => d.source !== 'chat') : [];

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {editingCourse && (
                <EditCourseModal
                    course={editingCourse}
                    onClose={() => setEditingCourse(null)}
                    onSave={(updatedData) => {
                        handleUpdateCourse(updatedData);
                        setEditingCourse(null);
                    }}
                />
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Systemadministration</h1>
            <p className="text-gray-500 mb-8">Hantera användare, kurser och systemarkiv.</p>

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button onClick={() => setAdminTab('users')} className={`pb-3 px-2 flex items-center gap-2 transition-colors ${adminTab === 'users' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}>
                    <Users size={18} /> Användare
                </button>
                <button onClick={() => setAdminTab('courses')} className={`pb-3 px-2 flex items-center gap-2 transition-colors ${adminTab === 'courses' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}>
                    <BookOpen size={18} /> Kurser
                </button>
                <button onClick={() => setAdminTab('docs')} className={`pb-3 px-2 flex items-center gap-2 transition-colors ${adminTab === 'docs' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}>
                    <FileText size={18} /> Dokumentarkiv
                </button>
            </div>

            {/* --- FLIK: ANVÄNDARE --- */}
            {adminTab === 'users' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Skapa Användare Formulär */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Plus size={20} className="text-indigo-600"/> Registrera ny användare</h3>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input className="border p-2 rounded-lg text-sm" placeholder="Förnamn" value={registerForm.firstName} onChange={e => setRegisterForm({...registerForm, firstName: e.target.value})} required />
                                <input className="border p-2 rounded-lg text-sm" placeholder="Efternamn" value={registerForm.lastName} onChange={e => setRegisterForm({...registerForm, lastName: e.target.value})} required />
                            </div>
                            <input className="w-full border p-2 rounded-lg text-sm" placeholder="Personnummer (12 siffror)" value={registerForm.ssn} onChange={e => setRegisterForm({...registerForm, ssn: e.target.value})} required />
                            <input className="w-full border p-2 rounded-lg text-sm" placeholder="E-post" type="email" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} required />

                            <div className="border-t pt-4 mt-2">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Konto & Roll</label>
                                <div className="flex gap-2 mb-3">
                                    <button type="button" onClick={() => setRegisterForm({...registerForm, role: 'STUDENT'})} className={`flex-1 py-2 text-xs font-bold rounded ${registerForm.role === 'STUDENT' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Student</button>
                                    <button type="button" onClick={() => setRegisterForm({...registerForm, role: 'TEACHER'})} className={`flex-1 py-2 text-xs font-bold rounded ${registerForm.role === 'TEACHER' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Lärare</button>
                                    <button type="button" onClick={() => setRegisterForm({...registerForm, role: 'ADMIN'})} className={`flex-1 py-2 text-xs font-bold rounded ${registerForm.role === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Admin</button>
                                </div>

                                <div className="flex gap-2">
                                    <input className="flex-1 border p-2 rounded-lg text-sm font-mono" placeholder="Användarnamn" value={registerForm.username} onChange={e => setRegisterForm({...registerForm, username: e.target.value})} required />
                                    <button type="button" onClick={handleGenerateUsernames} className="bg-gray-200 px-3 rounded-lg text-xs font-bold hover:bg-gray-300">Generera</button>
                                </div>
                                {usernameSuggestions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {usernameSuggestions.map(u => (
                                            <span key={u} onClick={() => setRegisterForm({...registerForm, username: u})} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded cursor-pointer hover:bg-indigo-100">{u}</span>
                                        ))}
                                    </div>
                                )}
                                <input className="w-full border p-2 rounded-lg text-sm mt-3" placeholder="Lösenord" type="password" value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} required />
                            </div>
                            <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">Skapa Konto</button>
                        </form>
                    </div>

                    {/* Användarlista */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Registrerade Användare ({users.length})</div>
                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase sticky top-0">
                                <tr>
                                    <th className="p-4">Namn</th>
                                    <th className="p-4">Roll</th>
                                    <th className="p-4">Användarnamn</th>
                                    <th className="p-4 text-right">Åtgärd</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-bold">{u.fullName}</td>
                                        <td className="p-4"><span className={`text-xs px-2 py-1 rounded font-bold ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'TEACHER' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                                        <td className="p-4 font-mono text-gray-500">{u.username}</td>
                                        <td className="p-4 text-right">
                                            {u.id !== currentUser.id && (
                                                <button onClick={() => handleAttemptDeleteUser(u)} className="text-gray-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FLIK: KURSER (Omarbetad) --- */}
            {adminTab === 'courses' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl">Kursöversikt</h3>
                        <button onClick={() => setShowCourseModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-indigo-700 flex items-center gap-2">
                            <Plus size={20} /> Skapa Ny Kurs
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className={`h-2 ${course.color || 'bg-indigo-600'}`}></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs font-bold font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded mb-2 inline-block">
                                                {course.courseCode}
                                            </span>
                                            <h3 className="font-bold text-lg leading-tight">{course.name}</h3>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => handleDeleteCourse(course.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                title="Radera Kurs"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-[40px]">
                                        {course.description || "Ingen beskrivning."}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setEditingCourse(course)}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                                        >
                                            <Settings size={16} /> Inställningar
                                        </button>
                                        <button
                                            onClick={() => navigateTo('course-detail', course.id)}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
                                        >
                                            Innehåll <ExternalLink size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-3 border-t text-xs text-gray-500 flex justify-between">
                                    <span>Lärare: {course.teacher?.fullName || 'Ej tilldelad'}</span>
                                    <span>Studenter: {course.students?.length || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- FLIK: DOKUMENT --- */}
            {adminTab === 'docs' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg">Globalt Dokumentarkiv</h3>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-200 flex items-center gap-1">
                            <Shield size={12}/> Visar endast publika filer (chattfiler dolda)
                        </span>
                    </div>
                    {safeDocuments.length > 0 ? (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase">
                            <tr>
                                <th className="p-4">Filnamn</th>
                                <th className="p-4">Ägare</th>
                                <th className="p-4">Datum</th>
                                <th className="p-4 text-right">Åtgärd</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {safeDocuments.map(d => (
                                <tr key={d.id} className="hover:bg-gray-50">
                                    <td className="p-4 flex items-center gap-2 font-medium">
                                        <FileText size={16} className="text-gray-400"/> {d.name}
                                    </td>
                                    <td className="p-4">{d.owner}</td>
                                    <td className="p-4 text-gray-500">{d.date}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDeleteDoc(d.id, true)} className="text-gray-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-gray-400">Systemet är tomt på arkiverade filer.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;