import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, XCircle, Users, Clock, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TeacherAttendanceView = ({ course, currentUser, API_BASE, token }) => {
    const { t, i18n } = useTranslation();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: { present: bool, note: str } }
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form state for new event
    const [newEvent, setNewEvent] = useState({ title: '', description: '', startTime: '', endTime: '', type: 'LESSON' });

    useEffect(() => {
        loadEvents();
    }, [course.id]);

    const loadEvents = () => {
        fetch(`${API_BASE}/events/course/${course.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(err => console.error(err));
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newEvent,
                courseId: course.id,
                // Ensure dates are parsed correctly or sent as ISO strings
                startTime: new Date(newEvent.startTime).toISOString(),
                endTime: new Date(newEvent.endTime).toISOString()
            };

            await fetch(`${API_BASE}/events`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            setShowCreateModal(false);
            loadEvents();
        } catch (error) {
            console.error(error);
            alert(t('attendance.create_error'));
        }
    };

    const loadAttendanceForEvent = (event) => {
        setSelectedEvent(event);
        setAttendanceMap({});

        // 1. Fetch existing attendance records
        fetch(`${API_BASE}/attendance/event/${event.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                const map = {};
                // Initialize with ALL students in course as "not set" or default absent?
                // Better: Iterate students, check if in data
                course.students.forEach(student => {
                    const record = data.find(a => a.student.id === student.id);
                    if (record) {
                        map[student.id] = { present: record.present, note: record.note };
                    } else {
                        map[student.id] = { present: false, note: '' }; // Default to absent/undefined
                    }
                });
                setAttendanceMap(map);
            });
    };

    const toggleAttendance = (studentId) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], present: !prev[studentId].present }
        }));
    };

    const saveAttendance = async () => {
        try {
            // Save for each student (This could be optimized to a bulk update endpoint, but for now loop)
            const promises = course.students.map(student => {
                const status = attendanceMap[student.id];
                return fetch(`${API_BASE}/attendance/event/${selectedEvent.id}/mark`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId: student.id,
                        present: status.present,
                        note: status.note
                    })
                });
            });

            await Promise.all(promises);
            alert(t('attendance.saved_success'));
            setSelectedEvent(null);
        } catch (error) {
            console.error(error);
            alert(t('attendance.save_error'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2"><Calendar size={20} className="text-indigo-600" /> {t('attendance.manage_attendance')}</h3>
                <button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700"><Plus size={16} /> {t('attendance.new_event')}</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map(event => (
                    <div key={event.id} onClick={() => loadAttendanceForEvent(event)} className="bg-white p-4 rounded-xl border hover:border-indigo-500 cursor-pointer transition-all shadow-sm group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold uppercase">{t(`attendance.type_${event.type.toLowerCase()}`) || event.type}</span>
                            <span className="text-gray-400 text-xs">{new Date(event.startTime).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                            <Clock size={12} /> {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreateEvent} className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">{t('attendance.create_event_title')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('attendance.event_title')}</label>
                                <input type="text" required className="w-full border rounded-lg p-2" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('attendance.event_start')}</label>
                                    <input type="datetime-local" required className="w-full border rounded-lg p-2" value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('attendance.event_end')}</label>
                                    <input type="datetime-local" required className="w-full border rounded-lg p-2" value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('attendance.event_type')}</label>
                                <select className="w-full border rounded-lg p-2" value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}>
                                    <option value="LESSON">{t('attendance.type_lesson')}</option>
                                    <option value="WORKSHOP">{t('attendance.type_workshop')}</option>
                                    <option value="EXAM">{t('attendance.type_exam')}</option>
                                    <option value="OTHER">{t('attendance.type_other')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 font-bold">{t('common.cancel')}</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">{t('attendance.create_btn')}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ATTENDANCE MODAL */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <div>
                                <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                                <p className="text-sm text-gray-500">{new Date(selectedEvent.startTime).toLocaleDateString()} • {course.students.length} studenter</p>
                            </div>
                            <button onClick={() => setSelectedEvent(null)}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-2">
                                {course.students.map(student => (
                                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">
                                                {student.fullName ? student.fullName[0] : 'S'}
                                            </div>
                                            <span className="font-medium text-gray-700">{student.fullName}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => toggleAttendance(student.id)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-colors ${attendanceMap[student.id]?.present
                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                    : 'bg-red-100 text-red-700 border border-red-200 opacity-60 hover:opacity-100'}`}
                                            >
                                                {attendanceMap[student.id]?.present ? <><CheckCircle size={14} /> {t('attendance.present')}</> : <><XCircle size={14} /> {t('attendance.absent')}</>}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end">
                            <button onClick={saveAttendance} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg">
                                <Save size={18} /> {t('attendance.save_attendance')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendanceView;
