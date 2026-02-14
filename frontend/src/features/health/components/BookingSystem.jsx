import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAppContext } from '../../../context/AppContext';
import {
    Clock,
    Calendar,
    Video,
    MessageSquare,
    MapPin,
    Plus,
    X,
    User,
    CheckCircle
} from 'lucide-react';

const BookingSystem = () => {
    const { currentUser } = useAppContext();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewBooking, setShowNewBooking] = useState(false);

    // New Booking State
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [type, setType] = useState('PHYSICAL');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, [currentUser]);

    const fetchBookings = async () => {
        if (!currentUser || !currentUser.roles) return;
        try {
            setLoading(true);
            const role = currentUser.roles.includes('STUDENT') ? 'STUDENT' : 'STAFF';
            const data = await api.get(`/elevhalsa/bookings/my?userId=${currentUser.id}&role=${role}`);
            setBookings(data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBooking = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const start = `${date}T${time}`;
            // Simple logic: assume 30 min duration
            const startDate = new Date(start);
            const endDate = new Date(startDate.getTime() + 30 * 60000);
            const end = endDate.toISOString().slice(0, 16); // format to string

            const payload = {
                studentId: currentUser.roles.includes('STUDENT') ? currentUser.id : null, // If staff books, handle differently? For now assume student books
                startTime: start,
                endTime: end,
                type,
                notes
            };

            // Should probably validate that studentId is set. 
            // If logged in as staff, maybe we need to select a student? 
            // For MVP, let's assume this component is used by Student or Staff to see their own.
            // But if Staff creates, they'd need to pick a student. 
            // Let's simplify: Only Students can "Request" a booking for now via this UI?
            // Or if Staff uses it, they just book a slot for "themselves" (e.g. block time)?
            // Let's enforce Student ID if user is student.

            if (currentUser.roles.includes('STUDENT')) {
                payload.studentId = currentUser.id;
            } else {
                // If staff, ideally we select a student or just block time.
                // For now, let's just alert that Staff booking UI is WIP
                alert("Personalbokning är under utveckling. Använd kalendern.");
                setSubmitting(false);
                return;
            }

            await api.post('/elevhalsa/bookings', payload);
            setShowNewBooking(false);
            setDate('');
            setTime('');
            setNotes('');
            fetchBookings();
        } catch (err) {
            console.error('Failed to create booking:', err);
            alert('Kunde inte boka tid. Försök igen.');
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeIcon = (t) => {
        switch (t) {
            case 'VIDEO': return <Video className="w-4 h-4 text-blue-500" />;
            case 'CHAT': return <MessageSquare className="w-4 h-4 text-emerald-500" />;
            default: return <MapPin className="w-4 h-4 text-rose-500" />;
        }
    };

    const getTypeLabel = (t) => {
        switch (t) {
            case 'VIDEO': return 'Videosamtal';
            case 'CHAT': return 'Chatt';
            default: return 'Fysiskt möte';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('sv-SE', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-teal" />
                    Mina bokningar
                </h3>
                <button
                    onClick={() => setShowNewBooking(!showNewBooking)}
                    className="bg-brand-teal hover:bg-teal-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    {showNewBooking ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showNewBooking ? 'Avbryt' : 'Ny bokning'}
                </button>
            </div>

            {showNewBooking && (
                <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/10 animate-in slide-in-from-top-2 duration-300">
                    <form onSubmit={handleCreateBooking} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Datum</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1F20] text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Tid</label>
                                <input
                                    type="time"
                                    required
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1F20] text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Typ av möte</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['PHYSICAL', 'VIDEO', 'CHAT'].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium border transition-all ${type === t
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                                            : 'bg-white dark:bg-[#1E1F20] border-slate-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        {getTypeIcon(t)}
                                        {getTypeLabel(t)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Vad vill du prata om?</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1F20] text-sm h-20 resize-none"
                                placeholder="Kort beskrivning..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-brand-teal hover:bg-teal-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Bokar...' : 'Bekräfta bokning'}
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Laddar bokningar...</div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-[#1E1F20] rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Inga kommande bokningar.</p>
                    </div>
                ) : (
                    bookings.map(booking => (
                        <div key={booking.id} className="bg-white dark:bg-[#1E1F20] p-4 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between group hover:border-brand-teal/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-black/20 flex flex-col items-center justify-center text-slate-800 dark:text-white border border-slate-200 dark:border-white/10">
                                    <span className="text-xs font-bold uppercase text-red-500">
                                        {new Date(booking.startTime).toLocaleString('default', { month: 'short' })}
                                    </span>
                                    <span className="text-lg font-bold leading-none">
                                        {new Date(booking.startTime).getDate()}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-medium text-slate-600 dark:text-gray-300">
                                            {getTypeIcon(booking.type)}
                                            {getTypeLabel(booking.type)}
                                        </div>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-white line-clamp-1">
                                        {booking.notes || "Inget ämne angivet"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {booking.status === 'CONFIRMED' ? (
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                                        <CheckCircle className="w-3 h-3" />
                                        Bekräftad
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                                        Väntar
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BookingSystem;
