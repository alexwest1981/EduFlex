import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../../../../services/api';

// --- CREATE USER ---
export const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
    if (!isOpen) return null;
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', username: '', password: '', role: 'STUDENT' });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            await api.users.register(formData);
            onUserCreated();
            onClose();
        } catch (error) {
            setErrorMsg("Kunde inte skapa användare. Kontrollera uppgifterna.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Registrera ny användare</h3>
                    <button onClick={onClose}><X className="text-gray-500" size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorMsg && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">{errorMsg}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Förnamn" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Efternamn" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                    <input required className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Användarnamn" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                    <input required type="email" className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input required type="password" className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Lösenord" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <select className="w-full p-2 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="STUDENT">Student</option>
                        <option value="TEACHER">Lärare</option>
                        <option value="ADMIN">Administratör</option>
                    </select>
                    <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg mt-2">{loading ? 'Sparar...' : 'Skapa Användare'}</button>
                </form>
            </div>
        </div>
    );
};

// --- CREATE COURSE ---
export const CreateCourseModal = ({ isOpen, onClose, onCourseCreated, teachers }) => {
    if (!isOpen) return null;
    const [formData, setFormData] = useState({ name: '', courseCode: '', description: '', category: 'Programmering', teacherId: '', startDate: '', endDate: '', color: 'bg-indigo-600', maxStudents: 30 });
    const [loading, setLoading] = useState(false);
    const colors = [{ name: 'Indigo', value: 'bg-indigo-600' }, { name: 'Röd', value: 'bg-red-600' }, { name: 'Grön', value: 'bg-emerald-600' }, { name: 'Blå', value: 'bg-blue-600' }, { name: 'Orange', value: 'bg-orange-500' }, { name: 'Lila', value: 'bg-purple-600' }, { name: 'Rosa', value: 'bg-pink-600' }, { name: 'Svart', value: 'bg-gray-800' }];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.courses.create({ ...formData, maxStudents: parseInt(formData.maxStudents) }, formData.teacherId);
            onCourseCreated();
            onClose();
        } catch (error) { alert("Kunde inte skapa kursen."); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Skapa ny kurs</h3>
                    <button onClick={onClose}><X className="text-gray-500" size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input required className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Kursnamn" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <input required className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Kurskod" value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value})} />
                        <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Kategori" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                        <input type="date" className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                    </div>
                    <input type="number" className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" placeholder="Max platser" value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: e.target.value})} />
                    <div className="flex gap-2 flex-wrap">{colors.map((c) => (<button key={c.value} type="button" onClick={() => setFormData({...formData, color: c.value})} className={`w-6 h-6 rounded-full ${c.value} transition-transform hover:scale-110 ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} />))}</div>
                    <select className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})}><option value="">Välj lärare...</option>{teachers.map(t => (<option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>))}</select>
                    <textarea className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white h-20 resize-none" placeholder="Beskrivning" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg mt-2">{loading ? 'Skapar...' : 'Skapa Kurs'}</button>
                </form>
            </div>
        </div>
    );
};

// --- EDIT COURSE ---
export const EditCourseModal = ({ isOpen, onClose, onCourseUpdated, teachers, courseToEdit }) => {
    if (!isOpen || !courseToEdit) return null;
    const [formData, setFormData] = useState({ name: '', courseCode: '', category: '', description: '', teacherId: '', startDate: '', endDate: '', color: '', maxStudents: 30 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (courseToEdit) {
            setFormData({
                name: courseToEdit.name || '', courseCode: courseToEdit.courseCode || '', category: courseToEdit.category || '',
                description: courseToEdit.description || '', teacherId: courseToEdit.teacher?.id || '', startDate: courseToEdit.startDate || '',
                endDate: courseToEdit.endDate || '', color: courseToEdit.color || 'bg-indigo-600', maxStudents: courseToEdit.maxStudents || 30
            });
        }
    }, [courseToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await api.courses.update(courseToEdit.id, { ...formData, maxStudents: parseInt(formData.maxStudents) });
            onCourseUpdated(); onClose();
        } catch (error) { alert("Kunde inte uppdatera kursen."); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Redigera kurs</h3>
                    <button onClick={onClose}><X className="text-gray-500" size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value})} />
                        <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                    </div>
                    <input className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" type="number" value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: e.target.value})} />
                    <select className="w-full p-2 border rounded dark:bg-[#131314] dark:border-[#3c4043] dark:text-white" value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})}><option value="">Välj lärare...</option>{teachers.map(t => (<option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>))}</select>
                    <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg mt-2">Spara</button>
                </form>
            </div>
        </div>
    );
};