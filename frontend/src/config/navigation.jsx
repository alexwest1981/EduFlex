import React from 'react';
import {
    LayoutDashboard, BookOpen, FolderOpen, Users, UserCircle, LogOut,
    ShieldCheck, Calendar, MessageSquare, Settings2, FileQuestion,
    Palette, Store, Sparkles, TrendingUp, Award, GraduationCap,
    Heart, Download, Brain, Briefcase, FileText, Settings,
    Layers, Library, ClipboardList, HelpCircle, Thermometer, BarChart2,
    Link2
} from 'lucide-react';

/**
 * Unified navigation configuration for EduFlex.
 * Centralizes all menu items, role-based logic, and translations.
 */
export const getNavigationConfig = (currentUser, t, isModuleActive, licenseTier, badges = {}) => {
    const role = currentUser?.role?.name || currentUser?.role || '';
    const roleName = typeof role === 'string' ? role.toUpperCase() : '';

    const isAdmin = roleName.includes('ADMIN') || roleName.includes('SUPERADMIN') || currentUser?.role?.isSuperAdmin || currentUser?.role?.superAdmin;
    const isTeacher = roleName.includes('TEACHER');
    const isStudent = roleName === 'STUDENT' || roleName === 'ROLE_STUDENT';
    const isPrincipal = ['ROLE_REKTOR', 'REKTOR', 'PRINCIPAL', 'ROLE_PRINCIPAL'].includes(roleName);
    const isGuardian = roleName === 'GUARDIAN' || roleName === 'ROLE_GUARDIAN';
    const isSyv = roleName === 'SYV' || roleName === 'ROLE_SYV';

    const dashboardPath = isPrincipal ? '/principal/dashboard' : '/';

    const sections = {
        main: [
            { path: dashboardPath, label: t('sidebar.dashboard'), icon: <LayoutDashboard size={20} /> },
            { path: '/catalog', label: t('sidebar.catalog'), icon: <Layers size={20} /> },
            { path: '/documents', label: t('sidebar.documents'), icon: <FileText size={20} /> },
        ],
        education: [],
        tools: [],
        admin: [],
        rektor: [],
        syv: [],
        guardian: []
    };

    // Education Section
    if (isTeacher || isAdmin) {
        sections.education.push({ path: '/resources', label: t('sidebar.resource_bank'), icon: <BookOpen size={20} /> });
        sections.education.push({ path: '/evaluations/manage', label: 'Utvärderingar', icon: <ClipboardList size={20} /> });
        if (isTeacher) {
            sections.education.push({ path: '/?tab=COURSES', label: t('sidebar.my_courses') || 'Mina kurser', icon: <BookOpen size={20} /> });
            if (isModuleActive?.('AI_QUIZ') && licenseTier !== 'BASIC') {
                sections.education.push({ path: '/ai-quiz', label: t('sidebar.ai_quiz') || 'AI Quiz', icon: <Sparkles size={20} /> });
            }
        }
    }

    if (isStudent) {
        sections.education.push({ path: '/my-courses', label: t('sidebar.my_courses'), icon: <BookOpen size={20} /> });
        sections.education.push({ path: '/my-study-plan', label: 'Min Studieplan (ISP)', icon: <GraduationCap size={20} /> });
        if (licenseTier !== 'BASIC') {
            sections.education.push({ path: '/ai-hub', label: 'EduAI Hub', icon: <Brain size={20} /> });
            sections.education.push({ path: '/career', label: 'EduCareer', icon: <Briefcase size={20} /> });
        }
    }

    if (isStudent || isTeacher || isAdmin) {
        sections.education.push({ path: '/ebooks', label: t('sidebar.ebooks') || 'E-books', icon: <Library size={18} /> });
    }

    // Tools Section
    sections.tools.push({ path: '/calendar', label: t('sidebar.calendar'), icon: <Calendar size={20} /> });

    sections.tools.push({
        path: '/communication',
        label: t('shortcuts.messages') || 'Meddelanden',
        icon: <MessageSquare size={20} />,
        badge: badges.unreadMessages > 0 ? badges.unreadMessages : null
    });

    sections.tools.push({ path: '/support', label: t('sidebar.support'), icon: <HelpCircle size={20} /> });

    if (isModuleActive?.('EDUGAME') && (isStudent || isAdmin)) {
        sections.tools.push({ path: '/shop', label: t('sidebar.shop') || 'Butik', icon: <Store size={20} /> });
    }

    if (isModuleActive?.('WELLBEING_CENTER') && !isSyv) {
        if (!['HALSOTEAM', 'ROLE_HALSOTEAM'].includes(roleName)) {
            sections.tools.push({ path: '/wellbeing-center', label: 'Sjukanmälan & E-hälsa', icon: <Heart size={20} /> });
        }
    }

    // Admin Section
    if (isAdmin) {
        sections.admin.push({ path: '/admin', label: t('sidebar.admin'), icon: <Settings size={20} /> });
    }
    if (roleName === 'HALSOTEAM' || roleName === 'ROLE_HALSOTEAM') {
        sections.admin.push({ path: '/health-dashboard', label: 'E-hälsa (Hälsoteam)', icon: <Heart size={20} className="text-rose-500" /> });
    }
    if (isModuleActive?.('ANALYTICS') && (isAdmin || isPrincipal)) {
        sections.admin.push({ path: '/analytics', label: t('sidebar.analytics') || 'Analyser & Insikter', icon: <BarChart2 size={20} /> });
    }
    if (isTeacher && !isPrincipal) {
        sections.admin.push({ path: '/principal/reports', label: 'CSN-Rapporter', icon: <FolderOpen size={20} /> });
    }

    // Rektor/Principal Section
    if (isPrincipal) {
        sections.rektor.push({ path: '/principal/dashboard', label: 'Rektorspaket', icon: <ShieldCheck size={20} /> });
        sections.rektor.push({ path: '/principal/quality', label: 'Kvalitetsarbete', icon: <Award size={20} /> });
        sections.rektor.push({ path: '/principal/management-reports', label: 'Ledningsrapport', icon: <TrendingUp size={20} /> });
        sections.rektor.push({ path: '/principal/reports', label: 'Rapportarkiv (CSN)', icon: <FolderOpen size={20} /> });
        sections.rektor.push({ path: '/principal/study-plans', label: 'Studieplaner (ISP)', icon: <GraduationCap size={20} /> });
        sections.rektor.push({ path: '/principal/tools', label: 'Verktyg & Admin', icon: <Settings size={20} /> });
    }

    // Guardian Section
    if (isGuardian) {
        sections.guardian.push({ path: '/', label: 'Vårdnadshavare', icon: <LayoutDashboard size={20} /> });
        sections.guardian.push({ path: '/communication', label: 'Meddelanden', icon: <MessageSquare size={20} /> });
        sections.guardian.push({ path: '/calendar', label: 'Schema', icon: <Calendar size={20} /> });
        sections.guardian.push({ path: '/support', label: 'Support', icon: <HelpCircle size={20} /> });
    }

    return sections;
};
