import React, { useState, useEffect } from 'react';
import { X, Send, AlertTriangle, FileText, User } from 'lucide-react';
import { api } from '../../../services/api';

const StudentContactModal = ({ isOpen, onClose, student, currentUser }) => {
    const [subject, setSubject] = useState('');
    const [messageBody, setMessageBody] = useState('');
    const [teacherNotes, setTeacherNotes] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (isOpen && student) {
            generateTemplate();
        }
    }, [isOpen, student]);

    const generateTemplate = () => {
        let generatedSubject = "Uppföljning av dina studier";
        let generatedBody = `Hej ${student.firstName},\n\n`;

        // Logic to determine risk reason
        // Currently based on daysSinceLogin from TeacherDashboard logic (999 = never logged in)
        if (student.daysSinceLogin === 999) {
            generatedSubject = "Viktigt: Du har inte loggat in ännu";
            generatedBody += `Jag ser att du ännu inte har loggat in på EduFlex. För att kunna tillgodogöra dig kursen är det viktigt att du kommer igång snart.\n\n`;
            generatedBody += "Behöver du hjälp med inloggningen eller att hitta rätt material?\n";
        } else if (student.daysSinceLogin > 14) {
            generatedSubject = "Varning: Hög frånvaro och inaktivitet";
            generatedBody += `Jag ser att du inte har varit aktiv på EduFlex på ${student.daysSinceLogin} dagar. Detta är oroande och påverkar dina studier negativt.\n\n`;
            generatedBody += "Vi behöver se över din studieplan för att säkerställa att du hinner med alla moment.\n";
        } else if (student.daysSinceLogin > 7) {
            generatedSubject = "Uppföljning: Frånvaro";
            generatedBody += `Jag noterade att det var ${student.daysSinceLogin} dagar sedan du senast var aktiv.\n`;
            generatedBody += "Hör av dig om du behöver hjälp med något specifikt moment.\n";
        } else {
            // Default / Generic
            generatedBody += "Jag vill stämma av hur det går för dig i kursen.\n";
        }

        setSubject(generatedSubject);
        setMessageBody(generatedBody);
        setTeacherNotes('');
    };

    const handleSend = async () => {
        setIsSending(true);
        try {
            const finalMessage = `${messageBody}\n\n---\nLärarens kommentar:\n${teacherNotes}\n\nMed vänlig hälsning,\n${currentUser.fullName}`;

            await api.messages.send({
                receiverId: student.id,
                subject: subject,
                content: finalMessage
            });

            // Log activity or "report" the student if needed
            // Could call an endpoint to log this intervention

            alert("Meddelande skickat!");
            onClose();
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Kunde inte skicka meddelandet.");
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#252525]">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <User size={24} className="text-indigo-600" />
                            Kontakta Student
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Rapportera och följ upp med {student.fullName}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6 overflow-y-auto">

                    {/* Risk Indicator */}
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-4">
                        <AlertTriangle className="text-amber-600 dark:text-amber-500 shrink-0" size={24} />
                        <div>
                            <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm uppercase mb-1">Identifierad Riskfaktor</h4>
                            <p className="text-amber-700 dark:text-amber-300 text-sm">
                                {student.daysSinceLogin === 999
                                    ? "Studenten har aldrig loggat in på plattformen."
                                    : student.daysSinceLogin > 7
                                        ? `Studenten har varit inaktiv i ${student.daysSinceLogin} dagar.`
                                        : "Ingen kritisk risk identifierad för tillfället, men uppföljning rekommenderas."}
                            </p>
                        </div>
                    </div>

                    {/* Subject Line */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ämne (Baserat på risk)</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-lg p-3 font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    {/* Auto-generated Context */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-2">
                            <FileText size={14} />
                            Automatiskt Genererat Underlag
                        </label>
                        <textarea
                            value={messageBody}
                            readOnly
                            className="w-full bg-gray-100 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 focus:outline-none resize-none h-32 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Detta underlag baseras på systemets data och skickas med i mailet.</p>
                    </div>

                    {/* Teacher Notes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase mb-2">
                            Dina kommentarer / Åtgärdsplan
                        </label>
                        <textarea
                            value={teacherNotes}
                            onChange={(e) => setTeacherNotes(e.target.value)}
                            placeholder="Skriv ett personligt meddelande, instruktioner eller specifika åtgärder som studenten behöver göra..."
                            className="w-full bg-white dark:bg-[#2A2A2A] border-2 border-indigo-100 dark:border-indigo-900/30 rounded-xl p-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all h-32 shadow-sm"
                            autoFocus
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#252525] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Avbryt
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isSending || !teacherNotes.trim()}
                        className={`px-6 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all ${isSending || !teacherNotes.trim() ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'}`}
                    >
                        {isSending ? 'Skickar...' : <> <Send size={18} /> Rapportera & Skicka </>}
                    </button>
                </div>

            </div>
        </div >
    );
};

export default StudentContactModal;
