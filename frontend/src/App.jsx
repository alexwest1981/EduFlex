import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, BookOpen, FileText, Settings, LogOut, Plus, Search, Bell,
    User, Download, Trash2, Video, Link as LinkIcon, File, Briefcase,
    Users, UserPlus, ArrowLeft, CheckCircle, Eye, EyeOff, Youtube, Image as ImageIcon,
    WifiOff, Calendar, X, AlertTriangle
} from 'lucide-react';

function App() {
    const [view, setView] = useState('dashboard');
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [showCourseModal, setShowCourseModal] = useState(false);

    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [readMaterials, setReadMaterials] = useState({});
    const [currentUser, setCurrentUser] = useState(null);

    const [userForm, setUserForm] = useState({ username: '', password: '', fullName: '', role: 'STUDENT' });
    const [courseForm, setCourseForm] = useState({ name: '', courseCode: '', description: '', teacherId: '', startDate: '' });
    const [formErrors, setFormErrors] = useState({});
    const [enrollStudentId, setEnrollStudentId] = useState('');

    const [matTitle, setMatTitle] = useState('');
    const [matContent, setMatContent] = useState('');
    const [matLink, setMatLink] = useState('');
    const [matType, setMatType] = useState('TEXT');
    const [matFile, setMatFile] = useState(null);

    const [docTitle, setDocTitle] = useState('');
    const [docType, setDocType] = useState('CV');
    const [docDesc, setDocDesc] = useState('');
    const [docFile, setDocFile] = useState(null);

    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    const API_BASE = 'http://127.0.0.1:8080/api';

    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            await fetchUsers();
            await fetchCourses();
            setIsLoading(false);
        };
        initData();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE}/users`);
            if (res.ok) {
                const data = await res.json();
                if (data.length === 0) {
                    const tempAdmin = { id: 999, username: 'admin', fullName: 'System Admin (Temp)', role: 'ADMIN' };
                    setUsers([tempAdmin]);
                    setCurrentUser(tempAdmin);
                    setMessage("Databasen är tom. En temporär admin har skapats. Gå till Admin-panelen för att lägga till riktiga användare.");
                } else {
                    setUsers(data);
                    if (!currentUser) setCurrentUser(data.find(u => u.role === 'ADMIN') || data[0]);
                }
                setIsOffline(false);
            } else {
                throw new Error("Kunde inte hämta användare");
            }
        } catch (err) {
            console.error(err);
            handleOfflineMode();
        }
    };

    const fetchCourses = async () => {
        if (isOffline) return;
        try {
            const res = await fetch(`${API_BASE}/courses`);
            if(res.ok) setCourses(await res.json());
        } catch (err) {}
    };

    const handleOfflineMode = () => {
        setIsOffline(true);
        const mockUser = { id: 999, username: 'admin', fullName: 'Offline Admin', role: 'ADMIN' };
        setUsers([mockUser]);
        setCurrentUser(mockUser);
    };

    const fetchCourseDetails = async (id) => {
        if (isOffline) return;
        setCurrentCourse(null);
        setMaterials([]);
        setError(null);

        console.log("Frontend: Börjar hämta kurs...");

        try {
            const cRes = await fetch(`${API_BASE}/courses/${id}`);

            if (cRes.ok) {
                const data = await cRes.json();
                console.log("Frontend: Kursdata mottagen!", data);
                setCurrentCourse(data);
            } else {
                console.error("Frontend: Servern svarade med felkod", cRes.status);
                setError(`Kunde inte ladda kursen (Status: ${cRes.status}).`);
                return;
            }

            const mRes = await fetch(`${API_BASE}/courses/${id}/materials`);
            if (mRes.ok) setMaterials(await mRes.json());
        } catch (err) {
            console.error("Frontend: Nätverksfel", err);
            setError("Nätverksfel vid hämtning av kurs.");
        }
    };

    const fetchDocuments = async (userId) => {
        if (isOffline || userId === 999) return;
        try { const res = await fetch(`${API_BASE}/documents/user/${userId}`); if (res.ok) setDocuments(await res.json()); } catch (err) {}
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        if(isOffline) return setError("Servern är nere.");
        try {
            const res = await fetch(`${API_BASE}/users/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) });
            if (res.ok) { showMessage('Användare skapad!'); setUserForm({ username: '', password: '', fullName: '', role: 'STUDENT' }); fetchUsers(); }
        } catch (err) { setError('Ingen kontakt med servern.'); }
    };

    const handleDeleteUser = async (id) => {
        if(isOffline) return;
        if(id === currentUser.id) return setError("Du kan inte radera dig själv!");
        if(id === 999) return setError("Kan inte radera temp-admin.");
        if(!window.confirm("Ta bort användare?")) return;
        try {
            const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
            if (res.ok) { showMessage('Användare borttagen.'); fetchUsers(); }
            else { setError('Kunde inte ta bort användare.'); }
        } catch (err) { setError('Fel vid borttagning.'); }
    };

    const validateCourseForm = () => {
        const errors = {};
        if (!courseForm.name.trim()) errors.name = "Kursnamn krävs";
        if (!courseForm.courseCode.trim()) errors.courseCode = "Kurskod krävs";
        if (!courseForm.teacherId) errors.teacherId = "Välj en lärare";
        if (!courseForm.startDate) errors.startDate = "Startdatum krävs";
        if (courseForm.description && courseForm.description.length > 500) errors.description = "Beskrivningen är för lång";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        if (isOffline) return setError("Servern är nere.");
        if (!validateCourseForm()) return;

        const payload = {
            name: courseForm.name,
            courseCode: courseForm.courseCode,
            description: courseForm.description,
            startDate: courseForm.startDate || null
        };

        try {
            const res = await fetch(`${API_BASE}/courses?teacherId=${courseForm.teacherId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showMessage('Kurs skapad!');
                setCourseForm({ name: '', courseCode: '', description: '', teacherId: '', startDate: '' });
                setShowCourseModal(false);
                fetchCourses();
            } else {
                setError('Kunde inte skapa kurs. Koden kanske är upptagen?');
            }
        } catch (err) { setError('Kunde inte skapa kurs.'); }
    };

    const handleDeleteCourse = async (id, e) => {
        if (e) e.stopPropagation();
        if(isOffline) return;
        if(!window.confirm("Ta bort kurs?")) return;
        try {
            const res = await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE' });
            if (res.ok) { showMessage('Kurs borttagen!'); fetchCourses(); if (selectedCourseId === id) navigateTo('courses'); }
        } catch (err) { setError('Kunde inte nå servern.'); }
    };

    const handleMaterialSubmit = async (e) => {
        e.preventDefault();
        if(isOffline) return setError("Servern är nere.");
        const formData = new FormData();
        formData.append("title", matTitle);
        formData.append("content", matContent);
        formData.append("link", matLink);
        formData.append("type", matType);
        if (matFile) formData.append("file", matFile);

        try {
            const res = await fetch(`${API_BASE}/courses/${selectedCourseId}/materials`, { method: 'POST', body: formData });
            if (res.ok) {
                showMessage('Material tillagt!');
                setMatTitle(''); setMatContent(''); setMatLink(''); setMatType('TEXT'); setMatFile(null);
                document.getElementById('matFileInput').value = "";
                const mRes = await fetch(`${API_BASE}/courses/${selectedCourseId}/materials`);
                if (mRes.ok) setMaterials(await mRes.json());
            } else { setError('Kunde inte lägga till material.'); }
        } catch (err) { setError('Fel vid material.'); }
    };

    const handleDeleteMaterial = async (matId) => {
        if(!window.confirm("Ta bort material?")) return;
        try {
            const res = await fetch(`${API_BASE}/courses/materials/${matId}`, { method: 'DELETE' });
            if (res.ok) { showMessage('Material borttaget.'); fetchCourseDetails(selectedCourseId); }
        } catch (err) { setError('Fel vid borttagning.'); }
    };

    const handleEnrollStudent = async (e) => {
        e.preventDefault();
        if(!enrollStudentId) return;
        try {
            const res = await fetch(`${API_BASE}/courses/${selectedCourseId}/enroll/${enrollStudentId}`, { method: 'POST' });
            if (res.ok) { showMessage('Elev registrerad!'); setEnrollStudentId(''); fetchCourseDetails(selectedCourseId); }
        } catch (err) { setError('Fel vid registrering.'); }
    };

    const handleDocSubmit = async (e) => {
        e.preventDefault();
        if (!docFile) return setError("Välj en fil!");
        const formData = new FormData();
        formData.append("file", docFile);
        formData.append("title", docTitle);
        formData.append("type", docType);
        formData.append("description", docDesc);
        try {
            const res = await fetch(`${API_BASE}/documents/user/${currentUser.id}`, { method: 'POST', body: formData });
            if (res.ok) { showMessage('Dokument uppladdat!'); setDocTitle(''); setDocDesc(''); setDocFile(null); document.getElementById('fileInput').value = ""; fetchDocuments(currentUser.id); }
        } catch (err) { setError('Kunde inte ladda upp.'); }
    };

    const handleDeleteDoc = async (id) => {
        if(!window.confirm("Ta bort filen?")) return;
        try { const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' }); if (res.ok) fetchDocuments(currentUser.id); } catch (err) {}
    };

    const toggleReadStatus = (matId) => { setReadMaterials(prev => ({ ...prev, [matId]: !prev[matId] })); };
    const showMessage = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

    const navigateTo = (newView, courseId = null) => {
        setError(null); setSelectedCourseId(courseId); setView(newView);
        if (newView !== 'course-detail') { setCurrentCourse(null); setMaterials([]); }
    };

    const getYoutubeEmbed = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const teachers = users.filter(u => u.role === 'TEACHER' || u.role === 'ADMIN');
    const allStudents = users.filter(u => u.role === 'STUDENT');
    const myCourses = currentUser?.role === 'STUDENT' ? courses.filter(c => c.students?.some(s => s.id === currentUser.id)) : courses;
    const getIcon = (type) => { switch(type) { case 'VIDEO': return <Video size={20} className="icon-red"/>; case 'LINK': return <LinkIcon size={20} className="icon-blue"/>; default: return <FileText size={20} className="icon-gray"/>; } };

    if (isLoading) return <div className="loading-screen" style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column'}}><div style={{marginBottom:20, fontSize:24, fontWeight:'bold', color:'#4f46e5'}}>EduFlex</div><div>Laddar...</div></div>;
    if (!currentUser) return <div className="loading-screen" style={{padding: 40}}>Kunde inte ladda användare.</div>;

    return (
        <div className="app-container">
            <style>{`
        :root { --primary: #4f46e5; --bg: #f3f4f6; --text: #1f2937; --white: #ffffff; --border: #e5e7eb; }
        body { margin: 0; font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); }
        .app-container { display: flex; height: 100vh; }
        .sidebar { width: 260px; background: var(--white); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
        .nav-item { padding: 10px 20px; cursor: pointer; display: flex; align-items: center; gap: 10px; color: #6b7280; }
        .nav-item:hover, .nav-item.active { background: #eef2ff; color: var(--primary); }
        .main-content { flex: 1; padding: 2rem; overflow-y: auto; position: relative; }
        .card { background: var(--white); padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid var(--border); margin-bottom: 1rem; }
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; }
        .btn { padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; }
        .input-field, .textarea-field { width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; margin-bottom: 10px; font-family: inherit; }
        .textarea-field { resize: vertical; min-height: 100px; }
        .badge { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; }
        .mat-card { display: flex; flex-direction: column; height: 100%; transition: transform 0.2s; position: relative; }
        .mat-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem; }
        .mat-type-icon { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; }
        .mat-content { font-size: 0.9rem; color: #4b5563; margin-bottom: 1rem; white-space: pre-wrap; flex: 1; }
        .mat-footer { border-top: 1px solid #f3f4f6; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
        .alert { padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
        .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
        .alert-success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
        .offline-banner { background: #fee2e2; color: #b91c1c; padding: 10px 20px; font-size: 0.9rem; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #fca5a5; }
        .btn-danger { background: #fee2e2; color: #991b1b; padding: 5px; border-radius: 5px; border: none; cursor: pointer; }
        .table-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; align-items: center; }
        
        /* MODAL */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 100; }
        .modal-box { background: white; padding: 2rem; border-radius: 12px; width: 500px; max-width: 95%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-title { margin: 0; font-size: 1.5rem; }
        .close-btn { background: none; border: none; cursor: pointer; }
        .error-text { color: #dc2626; font-size: 0.8rem; margin-top: -5px; display: block; }
      `}</style>

            {/* --- MODAL (CREATE COURSE) --- */}
            {showCourseModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2 className="modal-title">Skapa Kurs</h2>
                            <button className="close-btn" onClick={() => setShowCourseModal(false)}><X size={24}/></button>
                        </div>
                        <form onSubmit={handleCourseSubmit}>
                            <div className="input-group">
                                <label className="input-label">Kursnamn</label>
                                <input className="input-field" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} placeholder="t.ex. Java Grund" />
                                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                            </div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                                <div className="input-group">
                                    <label className="input-label">Kurskod</label>
                                    <input className="input-field" value={courseForm.courseCode} onChange={e => setCourseForm({...courseForm, courseCode: e.target.value})} placeholder="JAV01" />
                                    {formErrors.courseCode && <span className="error-text">{formErrors.courseCode}</span>}
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Startdatum</label>
                                    <input type="date" className="input-field" value={courseForm.startDate} onChange={e => setCourseForm({...courseForm, startDate: e.target.value})} />
                                    {formErrors.startDate && <span className="error-text">{formErrors.startDate}</span>}
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Ansvarig Lärare</label>
                                <select className="input-field" value={courseForm.teacherId} onChange={e => setCourseForm({...courseForm, teacherId: e.target.value})}>
                                    <option value="">-- Välj lärare --</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                                </select>
                                {formErrors.teacherId && <span className="error-text">{formErrors.teacherId}</span>}
                            </div>
                            <div className="input-group">
                                <label className="input-label">Beskrivning</label>
                                <textarea className="textarea-field" rows="4" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} placeholder="Beskriv kursens innehåll..." />
                                <div style={{textAlign:'right', fontSize:'0.8rem', color: courseForm.description.length > 500 ? 'red' : 'gray'}}>{courseForm.description.length} / 500</div>
                                {formErrors.description && <span className="error-text">{formErrors.description}</span>}
                            </div>
                            <button className="btn" style={{width:'100%'}}>Spara Kurs</button>
                        </form>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="sidebar">
                <div style={{padding:'20px', fontSize:'1.2rem', fontWeight:'bold', color:'var(--primary)'}}>EduFlex</div>
                <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => navigateTo('dashboard')}><LayoutDashboard size={20}/> Översikt</div>
                <div className={`nav-item ${view === 'courses' ? 'active' : ''}`} onClick={() => navigateTo('courses')}><BookOpen size={20}/> Kurser</div>
                <div className={`nav-item ${view === 'documents' ? 'active' : ''}`} onClick={() => navigateTo('documents')}><Briefcase size={20}/> Dokument</div>
                {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && <div className={`nav-item ${view === 'admin' ? 'active' : ''}`} onClick={() => navigateTo('admin')}><Settings size={20}/> Admin</div>}

                <div style={{marginTop:'auto', padding:'20px', borderTop:'1px solid #eee'}}>
                    <div style={{fontWeight:'bold'}}>{currentUser.fullName}</div>
                    <div style={{fontSize:'0.8rem', color:'gray'}}>{currentUser.role}</div>
                    <div style={{marginTop:'10px', fontSize:'0.7rem'}}>
                        {!isOffline && users.slice(0,3).map(u => <button key={u.id} onClick={() => setCurrentUser(u)} style={{marginRight:5, cursor:'pointer'}}>{u.role[0]}</button>)}
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="main-content">
                <header className="top-bar" style={{display:'flex', justifyContent:'space-between', marginBottom:'2rem'}}>
                    <div className="search-bar" style={{display:'flex', alignItems:'center', background:'white', padding:'8px 12px', borderRadius:8, border:'1px solid #eee', width:300}}>
                        <Search size={18} color="#9ca3af"/>
                        <input type="text" placeholder="Sök..." style={{border:'none', marginLeft:10, outline:'none', width:'100%'}} />
                    </div>
                    <div><Bell size={20} color="#6b7280"/></div>
                </header>

                {isOffline && <div className="offline-banner"><WifiOff size={20}/><div><strong>Offline Mode!</strong> Starta backend på port 8080.</div></div>}
                {error && <div className="alert alert-error">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}

                {/* DASHBOARD */}
                {view === 'dashboard' && (
                    <div>
                        <h1>Översikt</h1>
                        <div className="grid-3">
                            <div className="card" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', border:'none'}}>
                                <h3>Välkommen {currentUser.fullName?.split(' ')[0]}!</h3>
                                <p>Du har 3 uppgifter denna vecka.</p>
                            </div>
                            <div className="card"><h3>Mina Kurser</h3><h1>{myCourses.length}</h1></div>
                            <div className="card"><h3>Dokument</h3><h1>{documents.length || 0}</h1></div>
                        </div>
                        <h2 style={{marginTop: '2rem'}}>Mina Senaste Kurser</h2>
                        <div className="grid-3" style={{marginTop: '1rem'}}>
                            {myCourses.slice(0,3).map(course => (
                                <div key={course.id} className="card" style={{cursor:'pointer', position: 'relative'}} onClick={() => navigateTo('course-detail', course.id)}>

                                    <div className="card-header">
                                        <span className="badge badge-blue">{course.courseCode}</span>
                                    </div>
                                    <h3 className="card-title">{course.name}</h3>
                                    <p className="card-subtitle">{course.teacher?.fullName}</p>
                                    <div style={{marginTop:'1rem', height:'4px', background:'#f3f4f6', borderRadius:2}}>
                                        <div style={{width:'60%', height:'100%', background:'#4f46e5', borderRadius:2}}></div>
                                    </div>
                                </div>
                            ))}
                            {myCourses.length === 0 && <p>Du är inte registrerad på några kurser än.</p>}
                        </div>
                    </div>
                )}

                {/* COURSES LIST */}
                {view === 'courses' && (
                    <div className="grid-3">
                        {courses.length === 0 && <p>Inga kurser hittades.</p>}
                        {courses.map(c => (
                            <div key={c.id} className="card" style={{cursor:'pointer', position: 'relative'}} onClick={() => navigateTo('course-detail', c.id)}>

                                <div style={{fontWeight:'bold', fontSize:'1.1rem'}}>{c.name}</div>
                                <div style={{color:'gray'}}>{c.courseCode}</div>
                                <p style={{fontSize:'0.8rem', color:'#6b7280', marginTop:'0.5rem'}}>Lärare: {c.teacher?.fullName}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* DOCUMENTS */}
                {view === 'documents' && (
                    <div className="grid-3">
                        <div className="card">
                            <h3>Ladda upp</h3>
                            <form onSubmit={handleDocSubmit}>
                                <input type="text" placeholder="Titel" className="input-field" value={docTitle} onChange={e => setDocTitle(e.target.value)} required />
                                <select className="input-field" value={docType} onChange={e => setDocType(e.target.value)}><option value="CV">CV</option><option value="BETYG">Betyg</option></select>
                                <input id="fileInput" type="file" className="input-field" onChange={e => setDocFile(e.target.files[0])} />
                                <button className="btn" style={{width:'100%'}}>Spara</button>
                            </form>
                        </div>
                        <div style={{gridColumn:'span 2'}}>
                            {documents.map(doc => (
                                <div key={doc.id} className="card" style={{display:'flex', justifyContent:'space-between', padding:'1rem', alignItems:'center'}}>
                                    <div style={{display:'flex', gap:10, alignItems:'center'}}>
                                        <div style={{background:'#dcfce7', padding:10, borderRadius:8}}><File size={20} color="#166534"/></div>
                                        <div><div style={{fontWeight:'bold'}}>{doc.title}</div><div style={{fontSize:'0.8rem', color:'gray'}}>{doc.type}</div></div>
                                    </div>
                                    <div>
                                        {doc.fileUrl && <a href={`http://127.0.0.1:8080${doc.fileUrl}`} target="_blank" style={{marginRight:10}}><Download size={18} color="#4f46e5"/></a>}
                                        <Trash2 size={18} color="#ef4444" style={{cursor:'pointer'}} onClick={() => handleDeleteDoc(doc.id)}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ADMIN */}
                {view === 'admin' && (
                    <div>
                        <h1>Admin Panel</h1>
                        <div className="grid-2" style={{marginBottom:'2rem'}}>
                            <div className="card">
                                <h3 className="card-title">Skapa Användare</h3>
                                <form onSubmit={handleUserSubmit}>
                                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                                        <input className="input-field" placeholder="Användarnamn" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} />
                                        <input className="input-field" placeholder="Lösenord" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
                                    </div>
                                    <input className="input-field" placeholder="Namn" value={userForm.fullName} onChange={e => setUserForm({...userForm, fullName: e.target.value})} />
                                    <select className="input-field" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}><option value="STUDENT">Elev</option><option value="TEACHER">Lärare</option><option value="ADMIN">Admin</option></select>
                                    <button className="btn" style={{width:'100%'}}>Skapa Användare</button>
                                </form>
                            </div>
                            <div className="card" style={{display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem'}}>
                                <h3 className="card-title">Kurshantering</h3>
                                <p style={{textAlign:'center', color:'#6b7280'}}>Klicka här för att skapa en ny kurs med detaljerad info.</p>
                                <button className="btn" onClick={() => setShowCourseModal(true)}>
                                    <Plus size={18} /> Skapa Ny Kurs
                                </button>
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="card">
                                <h3>Hantera Användare ({users.length})</h3>
                                <div style={{maxHeight:300, overflowY:'auto'}}>
                                    {users.map(u => (
                                        <div key={u.id} className="table-row">
                                            <div><div style={{fontWeight:'bold'}}>{u.fullName}</div><div style={{fontSize:'0.8rem', color:'gray'}}>{u.role}</div></div>
                                            <button className="btn-danger" onClick={() => handleDeleteUser(u.id)}><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="card">
                                <h3>Hantera Kurser ({courses.length})</h3>
                                <div style={{maxHeight:300, overflowY:'auto'}}>
                                    {courses.map(c => (
                                        <div key={c.id} className="table-row">
                                            <div><div style={{fontWeight:'bold'}}>{c.name}</div><div style={{fontSize:'0.8rem', color:'gray'}}>{c.courseCode}</div></div>
                                            <button className="btn-danger" onClick={(e) => handleDeleteCourse(c.id, e)}><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* COURSE DETAIL */}
                {view === 'course-detail' && (
                    <div>
                        <button onClick={() => navigateTo('courses')} style={{background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:5, marginBottom:20}}><ArrowLeft size={16}/> Tillbaka</button>

                        {/* HÄR ÄR ÄNDRINGEN: Visar felmeddelande om currentCourse är null, annars rendera */}
                        {(!currentCourse) ? (
                            <div className="card">
                                {error ? <span style={{color: '#dc2626'}}>{error}</span> : "Laddar kurs..."}
                            </div>
                        ) : (
                            <>
                                <div className="card" style={{borderLeft:'4px solid var(--primary)'}}>
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                        <div>
                                            <h1 style={{marginTop:0}}>{currentCourse.name}</h1>
                                            <div style={{display:'flex', gap:10, alignItems:'center', marginTop:10}}>
                                                <span className="badge badge-blue">{currentCourse.courseCode}</span>
                                                {/* NYTT: Visa startdatum */}
                                                {currentCourse.startDate && <div style={{display:'flex', alignItems:'center', gap:5, color:'gray', fontSize:'0.9rem'}}><Calendar size={16}/> Start: {currentCourse.startDate}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <p style={{marginTop:'1.5rem'}}>{currentCourse.description}</p>
                                    <div style={{marginTop:20, display:'flex', alignItems:'center', gap:10}}>
                                        {/* SÄKERHETSCHECK: ?. för att undvika krasch */}
                                        <div className="avatar" style={{width:30, height:30, fontSize:12}}>{currentCourse.teacher?.fullName?.charAt(0) || '?'}</div>
                                        <span style={{fontSize:14, color:'gray'}}>Lärare: {currentCourse.teacher?.fullName || "Ingen lärare"}</span>
                                    </div>
                                </div>

                                {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && (
                                    <div className="card" style={{background:'#f9fafb', border:'1px dashed #ccc'}}>
                                        <h3><Plus size={18} style={{display:'inline'}}/> Lägg till material</h3>
                                        <form onSubmit={handleMaterialSubmit}>
                                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                                                <input className="input-field" placeholder="Titel" value={matTitle} onChange={e => setMatTitle(e.target.value)} />
                                                <select className="input-field" value={matType} onChange={e => setMatType(e.target.value)}><option value="TEXT">Text</option><option value="VIDEO">Video</option><option value="FILE">Fil</option><option value="LINK">Länk</option></select>
                                            </div>
                                            <textarea className="textarea-field" placeholder="Innehåll..." value={matContent} onChange={e => setMatContent(e.target.value)} />
                                            {(matType === 'VIDEO' || matType === 'LINK') && <input className="input-field" placeholder="Länk..." value={matLink} onChange={e => setMatLink(e.target.value)} />}
                                            {matType === 'FILE' && <input id="matFileInput" type="file" className="input-field" onChange={e => setMatFile(e.target.files[0])} />}
                                            <button className="btn">Publicera</button>
                                        </form>
                                    </div>
                                )}

                                <h2>Material</h2>
                                <div className="grid-3">
                                    {materials.map(mat => {
                                        const youtubeId = getYoutubeEmbed(mat.link);
                                        const isRead = readMaterials[mat.id];
                                        return (
                                            <div key={mat.id} className="card mat-card" style={{borderColor: isRead ? '#10b981' : '#e5e7eb'}}>
                                                <div className="mat-header">
                                                    <div className="mat-type-icon">{getIcon(mat.type)}</div>
                                                    <div style={{display: 'flex', gap: '5px'}}>
                                                        {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && <button onClick={() => handleDeleteMaterial(mat.id)} style={{border:'none', background:'none', cursor:'pointer'}} title="Ta bort"><Trash2 size={18} color="#ef4444"/></button>}
                                                        <button onClick={() => toggleReadStatus(mat.id)} style={{border:'none', background:'none', cursor:'pointer'}}>{isRead ? <CheckCircle color="#10b981"/> : <Eye color="#9ca3af"/>}</button>
                                                    </div>
                                                </div>
                                                <h3>{mat.title}</h3>
                                                {youtubeId && <iframe style={{width:'100%', height:200, borderRadius:8, marginBottom:10}} src={`https://www.youtube.com/embed/${youtubeId}`} frameBorder="0" allowFullScreen></iframe>}
                                                {mat.fileUrl && (mat.fileName?.toLowerCase().endsWith('.jpg') || mat.fileName?.toLowerCase().endsWith('.png')) && <img src={`http://127.0.0.1:8080${mat.fileUrl}`} style={{width:'100%', borderRadius:8}}/>}
                                                <div className="mat-content">{mat.content}</div>
                                                <div className="mat-footer">
                                                    {mat.fileUrl && <a href={`http://127.0.0.1:8080${mat.fileUrl}`} target="_blank" className="btn" style={{fontSize:'0.8rem'}}>Ladda ner</a>}
                                                    {mat.link && !youtubeId && <a href={mat.link} target="_blank" className="btn" style={{fontSize:'0.8rem'}}>Öppna länk</a>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;