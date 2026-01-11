import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useAppData = (currentUser, licenseStatus, showMessage, setError) => {
    const [isLoading, setIsLoading] = useState(false);

    // Data States
    const [users, setUsers] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [documents, setDocuments] = useState([]);

    // LMS Data
    const [allAssignments, setAllAssignments] = useState([]);
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [ungradedSubmissions, setUngradedSubmissions] = useState([]);

    // --- HELPER: Filtrera kurser baserat på roll ---
    const updateMyCourses = useCallback((courses, user) => {
        if (!user) return;
        if (user.role === 'STUDENT') {
            setMyCourses(courses.filter(c => c.students?.some(s => s.id === user.id)));
        } else if (user.role === 'TEACHER') {
            setMyCourses(courses.filter(c => c.teacher?.id === user.id));
        } else {
            setMyCourses(courses); // Admin ser allt som "sitt"
        }
    }, []);

    // --- HELPER: Hämta LMS-data (Läxor/Inlämningar) ---
    const fetchAllLmsData = useCallback(async (courses, user) => {
        try {
            let allAss = [];
            let allSubs = [];

            // Loopa kurser för att hitta uppgifter
            for (const course of courses) {
                const assigns = await api.assignments.getByCourse(course.id);
                if (assigns) {
                    allAss = [...allAss, ...assigns.map(a => ({ ...a, courseId: course.id }))];

                    // Om lärare/admin -> Hämta inlämningar också
                    if (user.role !== 'STUDENT') {
                        for (const assign of assigns) {
                            const subs = await api.assignments.getSubmissions(assign.id);
                            if (subs) allSubs = [...allSubs, ...subs.map(s => ({ ...s, assignmentId: assign.id }))];
                        }
                    }
                }
            }
            setAllAssignments(allAss);
            setAllSubmissions(allSubs);

            // Filtrera ut "Att göra"
            // (Här kan vi lägga till logik för studentens kommande uppgifter senare)

        } catch (e) {
            console.error("LMS Data Error", e);
        }
    }, []);

    // --- MAIN INIT FUNCTION ---
    const initData = useCallback(async () => {
        if (!currentUser || licenseStatus !== 'valid') return;

        setIsLoading(true);
        try {
            const [usersData, coursesData] = await Promise.all([
                api.users.getAll(0, 1000),
                api.courses.getAll()
            ]);

            setUsers(usersData?.content || usersData || []);
            setAllCourses(coursesData || []);
            setAvailableCourses(coursesData || []); // Fixar katalogen
            updateMyCourses(coursesData || [], currentUser);

            // --- DOKUMENTLOGIK (Uppdaterad enligt krav) ---
            if (currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') {
                // Admin och Lärare hämtar ALLT (filtreras sen i vyn)
                const docs = await api.documents.getAll();
                setDocuments(docs || []);
                await fetchAllLmsData(coursesData || [], currentUser);
            } else {
                // Studenter hämtar bara SINA filer
                const myDocs = await api.documents.getUserDocs(currentUser.id);
                setDocuments(myDocs || []);
            }

        } catch (e) {
            console.error("Init data error", e);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, licenseStatus, updateMyCourses, fetchAllLmsData]);

    // Ladda data vid start
    useEffect(() => {
        initData();
    }, [initData]);

    // --- ACTIONS (Delete, Upload, etc) ---

    const handleDeleteUser = async (u) => {
        if (!window.confirm(`Radera ${u.fullName}?`)) return;
        try {
            await api.users.delete(u.id);
            showMessage("Användare raderad.");
            const newUsers = await api.users.getAll(0, 1000);
            setUsers(newUsers?.content || newUsers || []);
        } catch { setError("Kunde inte radera användare."); }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Radera kurs?")) return;
        try {
            await api.courses.delete(id);
            showMessage("Kurs raderad.");
            const c = await api.courses.getAll();
            setAllCourses(c);
            setAvailableCourses(c);
            updateMyCourses(c, currentUser);
        } catch { setError("Kunde inte radera kurs."); }
    };

    const handleAdminUpload = async (file, title, description) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", title);
        fd.append("type", "DOCUMENT");
        if (description) fd.append("description", description);

        try {
            await api.documents.upload(currentUser.id, fd);
            showMessage("Fil uppladdad!");
            // Ladda om dokumentlistan
            if (currentUser.role === 'STUDENT') {
                const d = await api.documents.getUserDocs(currentUser.id);
                setDocuments(d);
            } else {
                const d = await api.documents.getAll();
                setDocuments(d);
            }
        } catch { setError("Uppladdning misslyckades."); }
    };

    const handleDeleteDoc = async (id) => {
        if (!window.confirm("Radera fil?")) return;
        try {
            await api.documents.delete(id);
            showMessage("Fil raderad.");
            // Uppdatera listan smartare utan full reload
            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch { setError("Kunde inte radera fil."); }
    };

    return {
        isLoading,
        users, setUsers,
        allCourses, setAllCourses,
        myCourses,
        availableCourses,
        documents, setDocuments,
        allAssignments,
        allSubmissions,
        initData,
        actions: {
            handleDeleteUser,
            handleDeleteCourse,
            handleAdminUpload,
            handleDeleteDoc
        }
    };
};