import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, MapPin, Info, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // <---

const AttendanceView = ({ courseId, currentUser, API_BASE, token }) => {
    const { t, i18n } = useTranslation(); // <---
    const [attendanceData, setAttendanceData] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/attendance/course/${courseId}/student/${currentUser.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json()).then(data => setAttendanceData(data)).catch(err => console.error(err));
    }, [courseId, currentUser.id, token, API_BASE]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Calendar className="text-indigo-600" /> {t('attendance.title')}</h3>
                <div className="text-sm text-gray-500">{t('attendance.presence')} <span className="font-bold text-gray-800">{attendanceData.filter(x => x.isPresent).length}</span> / {attendanceData.length} {t('attendance.occasions')}</div>
            </div>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {attendanceData.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 italic flex flex-col items-center gap-2"><Info size={32} className="text-gray-300" />{t('attendance.no_records')}</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {attendanceData.map((item, index) => (
                            <div key={index} onClick={() => setSelectedEvent(item)} className="p-4 flex items-center justify-between hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-50 border p-2 rounded-lg text-gray-600 font-bold text-center min-w-[60px] group-hover:bg-white group-hover:border-indigo-200 transition-colors">
                                        <div className="text-[10px] uppercase tracking-wide">{new Date(item.event.startTime).toLocaleDateString(i18n.language, { month: 'short' })}</div>
                                        <div className="text-xl text-indigo-600">{new Date(item.event.startTime).getDate()}</div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{item.event.title}</h4>
                                        <div className="text-xs text-gray-500 flex gap-2 items-center mt-1"><span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{t(`attendance.type_${item.event.type.toLowerCase()}`) || item.event.type}</span><span>{new Date(item.event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {!item.hasRecord ? <span className="text-xs text-gray-400 italic bg-gray-50 px-2 py-1 rounded">{t('attendance.not_reported')}</span> : item.isPresent ? <div className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full border border-green-100"><CheckCircle size={16} /> {t('attendance.present')}</div> : <div className="flex items-center gap-1 text-red-600 font-bold text-sm bg-red-50 px-3 py-1 rounded-full border border-red-100"><XCircle size={16} /> {t('attendance.absent')}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-200 border border-gray-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4"><h2 className="text-2xl font-bold text-gray-900">{selectedEvent.event.title}</h2><button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button></div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-6 bg-gray-50 p-3 rounded-lg border"><Calendar size={16} className="text-indigo-500" /><span className="font-medium capitalize">{new Date(selectedEvent.event.startTime).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span></div>
                        <div className="mb-6"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('attendance.description')}</h4><p className="text-gray-700 text-sm leading-relaxed">{selectedEvent.event.description || t('attendance.no_description')}</p></div>
                        <div className="flex items-center gap-2 text-sm text-indigo-600 font-bold mb-6"><MapPin size={16} /> {selectedEvent.event.type}</div>
                        {selectedEvent.note && (<div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 flex items-start gap-2 mb-6"><AlertCircle size={16} className="mt-0.5 shrink-0" /><div><span className="font-bold">{t('attendance.note')}:</span> {selectedEvent.note}</div></div>)}
                        <button onClick={() => setSelectedEvent(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-bold transition-colors">{t('common.close')}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceView;
