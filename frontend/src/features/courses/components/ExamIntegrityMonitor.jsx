import React, { useEffect, useRef } from 'react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ExamIntegrityMonitor = ({ quizId, studentId, isExam }) => {
    const { t } = useTranslation();
    const lastEventTime = useRef(0);

    useEffect(() => {
        if (!isExam) return;

        // 1. Tab Switching / Window Minimized
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                logIntegrityEvent('FOCUS_LOST', t('integrity.focus_lost_log'));
                toast.error(t('integrity.focus_lost_warn'), {
                    duration: 5000,
                    id: 'integrity-warn'
                });
            }
        };

        // 2. Window Blur (Focusing away from window but tab still visible)
        const handleBlur = () => {
            logIntegrityEvent('TAB_SWITCH', t('integrity.tab_switch_log'));
        };

        // 3. Fullscreen Exit
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                logIntegrityEvent('FULLSCREEN_EXIT', t('integrity.fullscreen_exit_log'));
            }
        };

        const logIntegrityEvent = async (type, details) => {
            // Throttle logs to avoid flooding
            const now = Date.now();
            if (now - lastEventTime.current < 2000) return;
            lastEventTime.current = now;

            try {
                await api.integrity.log({
                    quizId,
                    studentId,
                    eventType: type,
                    details
                });
            } catch (error) {
                console.error('Failed to log integrity event:', error);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Initial Proctoring Start Log
        logIntegrityEvent('PROCTORING_STARTED', t('integrity.proctoring_started_log'));

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            logIntegrityEvent('PROCTORING_STOPPED', t('integrity.proctoring_stopped_log'));
        };
    }, [quizId, studentId, isExam]);

    return null; // This is a headless logic component
};

export default ExamIntegrityMonitor;
