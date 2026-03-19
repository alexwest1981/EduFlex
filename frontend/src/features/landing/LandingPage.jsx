import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    BookOpen, Trophy, Shield, Users,
    Globe, Database, Server, Zap, BarChart,
    Check, ArrowRight, Menu, X, Play, Sparkles,
    Award, TrendingUp, Layers, Gamepad2, Brain, Map, Flame, MessageSquare, Bell,
    FileText, ClipboardList, Thermometer, Target, Smartphone, Video as VideoIcon, Link2, Lock, Building2, ShoppingCart, ChevronDown
} from 'lucide-react';

import { api } from '../../services/api';

// Assets
import heroImage from '../../assets/images/Hero.jpg';
import logoMain from '../../assets/images/Logo_top.png';
import eduflexConnectImg from '../../assets/eduflex_connect.png';

// Components
import ContactModal from '../../components/ContactModal';
import ScreenshotSlider from '../../components/landing/ScreenshotSlider';

// Feature Screenshots
import adminDashboardImg from '../../assets/screenshots/admin_dashboard.png';
import teacherDashboardImg from '../../assets/screenshots/teacher_dashboard.png';
import aiQuizImg from '../../assets/screenshots/AIQuizGenerator.png';
import analyticsNewImg from '../../assets/screenshots/Analytics.png';
import catalogNewImg from '../../assets/screenshots/Kurskatalog.png';
import libraryImg from '../../assets/screenshots/Library.png';
import debugImg from '../../assets/screenshots/LiveDebugTerminal.png';
import resourceImg from '../../assets/screenshots/Resursbank.png';
import settingsNewImg from '../../assets/screenshots/SystemSettings.png';

const LandingPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    // Parallax scroll tracking
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [enabledLanguages, setEnabledLanguages] = useState([]);
    const [isLangOpen, setIsLangOpen] = useState(false);

    useEffect(() => {
        // Deriving enabled languages directly from i18n resources (Static Mode)
        const codes = Object.keys(i18n.options.resources || {});
        
        // Sorting priority: Nordic first, then by commonality
        const nordicCodes = ['sv', 'no', 'da', 'fi', 'se'];
        const commonCodes = ['en', 'de', 'fr', 'es', 'ar'];
        
        const sortedCodes = codes.sort((a, b) => {
            const indexA = [...nordicCodes, ...commonCodes].indexOf(a);
            const indexB = [...nordicCodes, ...commonCodes].indexOf(b);
            
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        const langs = sortedCodes
            .filter(code => code !== 'sv2' && code !== 'v2')
            .map(code => ({
                code,
                name: code.toUpperCase()
            }));
        setEnabledLanguages(langs);
    }, [i18n.options.resources]);

    const languageNames = {
        'sv': 'Svenska',
        'no': 'Norsk',
        'da': 'Dansk',
        'fi': 'Suomi',
        'se': 'Davvisámegiella',
        'en': 'English',
        'de': 'Deutsch',
        'fr': 'Français',
        'es': 'Español',
        'ar': 'العربية'
    };

    const languageDescriptions = {
        'sv': 'Svenska - Officiellt språk i Sverige',
        'no': 'Norsk - Officiellt språk i Norge',
        'da': 'Dansk - Officiellt språk i Danmark',
        'fi': 'Suomi - Officiellt språk i Finland',
        'se': 'Davvisámegiella - Nordligt samiskt språk',
        'en': 'English - Global communication language',
        'de': 'Deutsch - Officiellt språk i Tyskland/Österrike',
        'fr': 'Français - Officiellt språk i Frankrike',
        'es': 'Español - Officiellt språk i Spanien/Latinamerika',
        'ar': 'العربية - Officiellt språk i Arabvärlden'
    };

    const flagEmoji = {
        'sv': '🇸🇪',
        'se': '🏳️',
        'en': '🇬🇧',
        'fr': '🇫🇷',
        'de': '🇩🇪',
        'es': '🇪🇸',
        'fi': '🇫🇮',
        'da': '🇩🇰',
        'no': '🇳🇴',
        'ar': '🇸🇦'
    };

    // Intersection Observer for fade-in animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.fade-in-section');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const features = [
        {
            icon: <Layers className="w-7 h-7" />,
            title: t('landing.features.multi_tenancy.title'),
            description: t('landing.features.multi_tenancy.desc'),
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10',
            hoverBorder: 'hover:border-brand-teal/50'
        },
        {
            icon: <Building2 className="w-7 h-7" />,
            title: t('landing.features.b2b.title'),
            description: t('landing.features.b2b.desc'),
            color: 'text-brand-gold',
            bgColor: 'bg-brand-gold/10',
            hoverBorder: 'hover:border-brand-gold/50'
        },
        {
            icon: <Zap className="w-7 h-7" />,
            title: t('landing.features.microservice.title'),
            description: t('landing.features.microservice.desc'),
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
            hoverBorder: 'hover:border-indigo-500/50'
        },
        {
            icon: <Zap className="w-7 h-7" />,
            title: t('landing.features.event_bus.title'),
            description: t('landing.features.event_bus.desc'),
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10',
            hoverBorder: 'hover:border-brand-teal/50'
        },
        {
            icon: <Gamepad2 className="w-7 h-7" />,
            title: t('landing.features.gamification.title'),
            description: t('landing.features.gamification.desc'),
            color: 'text-brand-blue',
            bgColor: 'bg-brand-blue/10',
            hoverBorder: 'hover:border-brand-blue/50'
        },
        {
            icon: <Brain className="w-7 h-7" />,
            title: t('landing.features.ai_creator.title'),
            description: t('landing.features.ai_creator.desc'),
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            hoverBorder: 'hover:border-emerald-500/50'
        },
        {
            icon: <Smartphone className="w-7 h-7" />,
            title: t('landing.features.pwa.title'),
            description: t('landing.features.pwa.desc'),
            color: 'text-sky-400',
            bgColor: 'bg-sky-500/10',
            hoverBorder: 'hover:border-sky-500/50'
        },
        {
            icon: <VideoIcon className="w-7 h-7" />,
            title: t('landing.features.live_video.title'),
            description: t('landing.features.live_video.desc'),
            color: 'text-indigo-400',
            bgColor: 'bg-indigo-500/10',
            hoverBorder: 'hover:border-indigo-500/50'
        },
        {
            icon: <FileText className="w-7 h-7" />,
            title: t('landing.features.collaborative.title'),
            description: t('landing.features.collaborative.desc'),
            color: 'text-brand-orange',
            bgColor: 'bg-brand-orange/10',
            hoverBorder: 'hover:border-brand-orange/50'
        },
        {
            icon: <TrendingUp className="w-7 h-7" />,
            title: t('landing.features.roi.title'),
            description: t('landing.features.roi.desc'),
            color: 'text-brand-gold',
            bgColor: 'bg-brand-gold/10',
            hoverBorder: 'hover:border-brand-gold/50'
        },
        {
            icon: <Bell className="w-7 h-7" />,
            title: t('landing.features.notifications.title'),
            description: t('landing.features.notifications.desc'),
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            hoverBorder: 'hover:border-purple-500/50'
        },
        {
            icon: <Shield className="w-7 h-7" />,
            title: t('landing.features.exams.title'),
            description: t('landing.features.exams.desc'),
            color: 'text-rose-400',
            bgColor: 'bg-rose-500/10',
            hoverBorder: 'hover:border-rose-500/50'
        },
        {
            icon: <Link2 className="w-7 h-7" />,
            title: t('landing.features.integrations.title'),
            description: t('landing.features.integrations.desc'),
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
            hoverBorder: 'hover:border-cyan-500/50'
        },
        {
            icon: <Brain className="w-7 h-7" />,
            title: t('landing.features.compliance.title'),
            description: t('landing.features.compliance.desc'),
            color: 'text-violet-400',
            bgColor: 'bg-violet-500/10',
            hoverBorder: 'hover:border-violet-500/50'
        },
        {
            icon: <Lock className="w-7 h-7" />,
            title: t('landing.features.pii.title'),
            description: t('landing.features.pii.desc'),
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
            hoverBorder: 'hover:border-amber-500/50'
        },
        {
            icon: <Map className="w-7 h-7" />,
            title: t('landing.features.educareer.title'),
            description: t('landing.features.educareer.desc'),
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10',
            hoverBorder: 'hover:border-brand-teal/50'
        },
        {
            icon: <Shield className="w-7 h-7" />,
            title: t('landing.features.erp.title'),
            description: t('landing.features.erp.desc'),
            color: 'text-rose-400',
            bgColor: 'bg-rose-500/10',
            hoverBorder: 'hover:border-rose-500/50'
        },
        {
            icon: <Map className="w-7 h-7" />,
            title: t('landing.features.isp.title'),
            description: t('landing.features.isp.desc'),
            color: 'text-brand-gold',
            bgColor: 'bg-brand-gold/10',
            hoverBorder: 'hover:border-brand-gold/50'
        },
        {
            icon: <Lock className="w-7 h-7" />,
            title: t('landing.features.bankid.title'),
            description: t('landing.features.bankid.desc'),
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10',
            hoverBorder: 'hover:border-brand-teal/50'
        },
        {
            icon: <Play className="w-7 h-7" />,
            title: t('landing.features.video_tutor.title'),
            description: t('landing.features.video_tutor.desc'),
            color: 'text-red-400',
            bgColor: 'bg-brand-red/10',
            hoverBorder: 'hover:border-brand-red/50'
        },
        {
            icon: <Globe className="w-7 h-7" />,
            title: t('landing.features.language_sync.title'),
            description: t('landing.features.language_sync.desc'),
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10',
            hoverBorder: 'hover:border-brand-teal/50'
        },
        {
            icon: <Globe className="w-7 h-7" />,
            title: t('landing.features.susa.title'),
            description: t('landing.features.susa.desc'),
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            hoverBorder: 'hover:border-emerald-500/50'
        },
        {
            icon: <Database className="w-7 h-7" />,
            title: t('landing.features.ladok.title'),
            description: t('landing.features.ladok.desc'),
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            hoverBorder: 'hover:border-blue-500/50'
        },
        {
            icon: <Shield className="w-7 h-7" />,
            title: t('landing.features.accessibility.title'),
            description: t('landing.features.accessibility.desc'),
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10',
            hoverBorder: 'hover:border-brand-teal/50'
        },
        {
            icon: <Lock className="w-7 h-7" />,
            title: t('landing.features.skolfederation.title'),
            description: t('landing.features.skolfederation.desc'),
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
            hoverBorder: 'hover:border-cyan-500/50'
        },
    ];


    const screenshotData = [
        { src: adminDashboardImg, title: t('landing.screenshots.admin.title'), description: t('landing.screenshots.admin.desc') },
        { src: teacherDashboardImg, title: t('landing.screenshots.teacher.title'), description: t('landing.screenshots.teacher.desc') },
        { src: aiQuizImg, title: t('landing.screenshots.quiz.title'), description: t('landing.screenshots.quiz.desc') },
        { src: libraryImg, title: t('landing.screenshots.library.title'), description: t('landing.screenshots.library.desc') },
        { src: catalogNewImg, title: t('landing.screenshots.catalog.title'), description: t('landing.screenshots.catalog.desc') },
        { src: resourceImg, title: t('landing.screenshots.resource.title'), description: t('landing.screenshots.resource.desc') },
        { src: analyticsNewImg, title: t('landing.screenshots.analytics.title'), description: t('landing.screenshots.analytics.desc') },
        { src: analyticsNewImg, title: t('landing.screenshots.roi.title'), description: t('landing.screenshots.roi.desc') },
        { src: settingsNewImg, title: t('landing.screenshots.settings.title'), description: t('landing.screenshots.settings.desc') },
        { src: debugImg, title: t('landing.screenshots.debug.title'), description: t('landing.screenshots.debug.desc') }
    ];

    return (
        <div className="min-h-screen bg-[#06141b] text-slate-100 font-display antialiased overflow-x-hidden">
            {/* Custom Styles */}
            <style>{`
                :root {
                    --brand-teal: #00d4aa;
                    --brand-emerald: #10b981;
                    --brand-blue: #0ea5e9;
                    --brand-orange: #ff9f1c;
                    --brand-gold: #ffb703;
                }
                .glass-card {
                    background: rgba(0, 212, 170, 0.03);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(0, 212, 170, 0.15);
                }
                .glass-card-dark {
                    background: rgba(6, 20, 27, 0.8);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .brand-gradient {
                    background: linear-gradient(135deg, var(--brand-teal), var(--brand-emerald), var(--brand-blue));
                }
                .text-gradient {
                    background: linear-gradient(to right, var(--brand-teal), var(--brand-blue));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .glow-teal {
                    box-shadow: 0 0 40px -10px rgba(0, 212, 170, 0.3);
                }
                .glow-gold {
                    box-shadow: 0 0 30px -5px rgba(255, 183, 3, 0.4);
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes blob {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes ping-slow {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-blob { animation: blob 7s infinite; }
                .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                .feature-card {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .feature-card:hover {
                    transform: translateY(-8px);
                }

                /* Parallax & Scroll Animations */
                .fade-in-section {
                    opacity: 0;
                    transform: translateY(40px);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                                transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .fade-in-section.animate-in {
                    opacity: 1;
                    transform: translateY(0);
                }
                .fade-in-section:nth-child(2) { transition-delay: 0.1s; }
                .fade-in-section:nth-child(3) { transition-delay: 0.2s; }
                .fade-in-section:nth-child(4) { transition-delay: 0.3s; }

                .parallax-slow {
                    will-change: transform;
                }
                .parallax-medium {
                    will-change: transform;
                }
                .parallax-fast {
                    will-change: transform;
                }

                /* Stagger animation for cards */
                .stagger-animation > * {
                    opacity: 0;
                    transform: translateY(30px);
                }
                .stagger-animation.animate-in > *:nth-child(1) { animation: staggerFadeIn 0.6s 0.1s forwards; }
                .stagger-animation.animate-in > *:nth-child(2) { animation: staggerFadeIn 0.6s 0.2s forwards; }
                .stagger-animation.animate-in > *:nth-child(3) { animation: staggerFadeIn 0.6s 0.3s forwards; }
                .stagger-animation.animate-in > *:nth-child(4) { animation: staggerFadeIn 0.6s 0.4s forwards; }
                .stagger-animation.animate-in > *:nth-child(5) { animation: staggerFadeIn 0.6s 0.5s forwards; }
                .stagger-animation.animate-in > *:nth-child(6) { animation: staggerFadeIn 0.6s 0.6s forwards; }
                .stagger-animation.animate-in > *:nth-child(7) { animation: staggerFadeIn 0.6s 0.7s forwards; }
                .stagger-animation.animate-in > *:nth-child(8) { animation: staggerFadeIn 0.6s 0.8s forwards; }
                .stagger-animation.animate-in > *:nth-child(9) { animation: staggerFadeIn 0.6s 0.9s forwards; }
                .stagger-animation.animate-in > *:nth-child(10) { animation: staggerFadeIn 0.6s 1s forwards; }
                .stagger-animation.animate-in > *:nth-child(n+11) { animation: staggerFadeIn 0.6s 1.1s forwards; }

                @keyframes staggerFadeIn {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Smooth scroll behavior */
                html {
                    scroll-behavior: smooth;
                }
            `}</style>

            {/* Background Gradient Mesh with Parallax */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/5 via-transparent to-brand-blue/5" />
                <div
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-teal/10 rounded-full blur-[120px] parallax-slow"
                    style={{ transform: `translateY(${scrollY * 0.15}px)` }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-blue/10 rounded-full blur-[100px] parallax-medium"
                    style={{ transform: `translateY(${scrollY * -0.1}px)` }}
                />
                <div
                    className="absolute top-1/4 right-10 opacity-[0.03] scale-150 rotate-12 text-brand-teal parallax-fast"
                    style={{ transform: `translateY(${scrollY * 0.25}px) rotate(${12 + scrollY * 0.02}deg)` }}
                >
                    <svg className="w-[600px] h-[600px]" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeDasharray="10 5" strokeWidth="2" />
                        <path d="M50 20C33.4 20 20 33.4 20 50C20 66.6 33.4 80 50 80C66.6 80 80 66.6 80 50" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
                    </svg>
                </div>
                {/* Extra parallax orbs */}
                <div
                    className="absolute top-[60%] left-[5%] w-[20%] h-[20%] bg-purple-500/5 rounded-full blur-[80px]"
                    style={{ transform: `translateY(${scrollY * -0.2}px)` }}
                />
                <div
                    className="absolute top-[30%] right-[20%] w-[15%] h-[15%] bg-brand-gold/5 rounded-full blur-[60px]"
                    style={{ transform: `translateY(${scrollY * 0.12}px)` }}
                />
            </div>

            {/* --- NAVBAR --- */}
            <header className="sticky top-0 z-50 px-4 sm:px-6 py-4 flex items-center justify-center">
                <nav className={`max-w-7xl w-full glass-card rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? 'shadow-lg shadow-black/20' : ''}`}>
                    <div className="flex items-center gap-3">
                        <div className="size-10 brand-gradient rounded-full flex items-center justify-center shadow-lg shadow-brand-teal/20 relative">
                            <img src={logoMain} alt="EduFlex" className="w-6 h-6 brightness-0 invert" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">EduFlex <span className="text-brand-teal">LLP</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-slate-300">
                        <a className="text-sm font-medium hover:text-brand-teal transition-colors" href="#features">{t('landing.nav.features')}</a>
                        <button onClick={() => navigate('/features#gamification')} className="text-sm font-medium hover:text-brand-teal transition-colors">{t('landing.nav.gamification')}</button>
                        <button onClick={() => navigate('/features#showcase')} className="text-sm font-medium hover:text-brand-teal transition-colors">{t('landing.nav.showcase')}</button>
                        <button onClick={() => navigate('/pricing')} className="text-sm font-medium hover:text-brand-teal transition-colors">{t('landing.nav.pricing')}</button>
                        <button onClick={() => navigate('/features#highlights')} className="text-sm font-medium hover:text-brand-teal transition-colors">{t('landing.nav.technology')}</button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:relative sm:flex items-center">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
                            >
                                <span>{flagEmoji[i18n.language.split('-')[0].toLowerCase()] || '🌐'}</span>
                                <span className="uppercase">{i18n.language.split('-')[0]}</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isLangOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                                    <div className="absolute top-full right-0 mt-2 p-2 w-48 glass-card-dark rounded-xl shadow-2xl z-50 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="grid grid-cols-1 gap-1">
                                            {enabledLanguages.map(lang => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => {
                                                        i18n.changeLanguage(lang.code.split('-')[0]);
                                                        setIsLangOpen(false);
                                                    }}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${i18n.language.split('-')[0] === lang.code.split('-')[0]
                                                        ? 'bg-brand-teal/20 text-brand-teal font-bold'
                                                        : 'hover:bg-white/5 text-slate-300'
                                                        }`}
                                                    title={languageDescriptions[lang.code] || ''}
                                                >
                                                    <div className="flex items-center gap-2 text-left">
                                                        <span className="text-xl leading-none">{flagEmoji[lang.code.split('-')[0].toLowerCase()] || '🌐'}</span>
                                                        <div className="flex flex-col">
                                                            <span>{languageNames[lang.code.split('-')[0].toLowerCase()] || lang.name}</span>
                                                            {languageDescriptions[lang.code] && (
                                                                <span className={`text-[9px] font-normal leading-tight ${i18n.language.split('-')[0] === lang.code.split('-')[0] ? 'text-brand-teal/80' : 'text-slate-500'}`}>
                                                                    {languageDescriptions[lang.code].split(' - ')[1]}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {i18n.language.split('-')[0] === lang.code.split('-')[0] && <Check className="w-3 h-3" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="hidden sm:block text-sm font-semibold px-4 py-2 hover:bg-white/5 rounded-lg transition-colors text-slate-300"
                        >
                            {t('landing.nav.login')}
                        </button>
                        <button
                            onClick={() => setIsContactModalOpen(true)}
                            className="bg-brand-gold text-slate-900 text-sm font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg glow-gold"
                        >
                            {t('landing.nav.book_demo')}
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-300"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu */}
            <div className={`md:hidden fixed inset-x-4 top-20 z-40 glass-card-dark rounded-2xl transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="p-4 space-y-2">
                    <button onClick={() => { navigate('/features'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 px-4 text-slate-300 hover:bg-white/5 rounded-lg transition-colors">{t('landing.nav.features')}</button>
                    <button onClick={() => { navigate('/features#showcase'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 px-4 text-slate-300 hover:bg-white/5 rounded-lg transition-colors">{t('landing.nav.showcase')}</button>
                    <button onClick={() => { navigate('/features#gamification'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 px-4 text-slate-300 hover:bg-white/5 rounded-lg transition-colors">{t('landing.nav.gamification')}</button>
                    <button onClick={() => { navigate('/features#highlights'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 px-4 text-slate-300 hover:bg-white/5 rounded-lg transition-colors">{t('landing.nav.technology')}</button>

                    <div className="px-4 py-3 border-t border-white/10 mt-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">{t('landing.nav.select_language')}</p>
                        <div className="grid grid-cols-2 gap-2">
                            {enabledLanguages.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        i18n.changeLanguage(lang.code.split('-')[0]);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${i18n.language.split('-')[0].toLowerCase() === lang.code.split('-')[0].toLowerCase()
                                        ? 'bg-brand-teal text-slate-900 shadow-lg shadow-brand-teal/20'
                                        : 'bg-white/5 text-slate-400 border border-white/5'
                                        }`}
                                >
                                    <span>{flagEmoji[lang.code.split('-')[0].toLowerCase()] || '🌐'}</span>
                                    <span>{languageNames[lang.code.split('-')[0].toLowerCase()] || lang.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 space-y-2 border-t border-white/10">
                        <button
                            onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                            className="w-full py-3 text-center text-slate-300 font-medium hover:bg-white/5 rounded-lg transition-colors"
                        >
                            {t('landing.nav.login')}
                        </button>
                        <button
                            onClick={() => { navigate('/register-org'); setIsMobileMenuOpen(false); }}
                            className="w-full py-3 text-center bg-brand-gold text-slate-900 font-bold rounded-xl"
                        >
                            {t('landing.nav.get_started')}
                        </button>
                    </div>
                </div>
            </div>

            <main>
                {/* --- HERO SECTION --- */}
                <section className="max-w-7xl mx-auto px-6 py-16 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,183,3,0.2)]">
                            <Sparkles className="w-3.5 h-3.5" />
                            {t('landing.hero.badge')}
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight">
                            {t('landing.hero.title_start')} <span className="text-brand-teal">{t('landing.hero.title_llp')}</span> {t('landing.hero.title_with')} <br /><span className="text-gradient drop-shadow-lg">{t('landing.hero.title_hub')}</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg text-slate-300 max-w-xl leading-relaxed font-light">
                            {t('landing.hero.subtitle')}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4 pt-2">
                            <button
                                onClick={() => navigate('/login')}
                                className="brand-gradient text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform text-lg shadow-xl shadow-brand-teal/30 flex items-center gap-2"
                            >
                                <Brain className="w-5 h-5" /> {t('landing.hero.cta_ai')}
                            </button>
                            <button
                                onClick={() => navigate('/features')}
                                className="glass-card font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-lg flex items-center gap-2 text-slate-200"
                            >
                                {t('landing.hero.cta_learn_more')} <ArrowRight className="w-5 h-5 text-brand-teal" />
                            </button>
                        </div>

                        {/* Tech Stack */}
                        <div className="flex flex-col gap-4 pt-4">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{t('landing.hero.tech_tagline')}</p>
                            <div className="flex flex-wrap items-center gap-6 opacity-60 hover:opacity-100 transition-all duration-500">
                                <div className="flex items-center gap-2 group">
                                    <Brain className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-semibold text-slate-400 group-hover:text-slate-200">{t('common.brands.gemini')}</span>
                                </div>
                                <div className="flex items-center gap-2 group">
                                    <Database className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-semibold text-slate-400 group-hover:text-slate-200">{t('common.brands.postgresql')}</span>
                                </div>
                                <div className="flex items-center gap-2 group">
                                    <Sparkles className="w-5 h-5 text-brand-teal group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-semibold text-slate-400 group-hover:text-slate-200">{t('common.brands.openai')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="relative">
                        <div className="absolute -inset-4 brand-gradient blur-3xl rounded-full opacity-20"></div>
                        <div className="relative glass-card rounded-3xl p-4 glow-teal overflow-hidden">
                            <div className="relative rounded-2xl overflow-hidden">
                                <img
                                    src={heroImage}
                                    alt="EduFlex Student"
                                    className="w-full aspect-square object-cover"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#06141b] via-transparent to-transparent" />

                                {/* Floating Stats Card */}
                                <div className="absolute bottom-4 left-4 glass-card rounded-xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-white">+47%</p>
                                            <p className="text-xs text-slate-400">{t('landing.hero.stats.engagement')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Achievement Card */}
                                        <div className="absolute top-4 right-4 glass-card rounded-xl p-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-brand-gold/20 rounded-lg flex items-center justify-center">
                                            <Award className="w-4 h-4 text-brand-gold" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{t('landing.hero.stats.new_level')}</p>
                                            <p className="text-xs text-slate-400">{t('landing.hero.stats.level_value', { level: 12 })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- SHORT FEATURES SECTION --- */}
                <section id="features" className="max-w-7xl mx-auto px-6 py-16 space-y-12 fade-in-section">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <h2 className="text-3xl lg:text-5xl font-black">{t('landing.features.title')}</h2>
                        <p className="text-slate-400 text-lg">{t('landing.features.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-animation fade-in-section">
                        {features.slice(0, 8).map((feature, idx) => (
                            <div
                                key={idx}
                                className={`glass-card p-8 rounded-3xl group ${feature.hoverBorder} transition-all duration-300 feature-card`}
                            >
                                <div className={`size-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <span className={feature.color}>{feature.icon}</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => navigate('/features')}
                            className="bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-3 rounded-xl transition-all border border-white/10 flex items-center gap-2"
                        >
                            {t('landing.hero.cta_see_all')} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                {/* --- SOLUTIONS BY ROLE SECTION (NEW) --- */}
                <section className="bg-slate-900/40 py-24 border-y border-white/5 relative overflow-hidden fade-in-section">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-teal/50 to-transparent"></div>

                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-wider">
                                <Users className="w-3 h-3" /> {t('landing.roles.badge')}
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-black">{t('landing.roles.title')}</h2>
                            <p className="text-slate-400 text-lg">{t('landing.roles.subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-animation fade-in-section">
                            {/* Rektor Card */}
                            <div className="glass-card p-8 rounded-3xl border-brand-teal/20 hover:border-brand-teal transition-all group relative overflow-hidden flex flex-col h-full">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Globe className="w-24 h-24" />
                                </div>
                                <div className="size-12 bg-brand-teal/10 rounded-xl flex items-center justify-center mb-6 text-brand-teal">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{t('landing.roles.rector.title')}</h3>
                                <p className="text-slate-400 text-sm mb-6 flex-grow">{t('landing.roles.rector.desc')}</p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-teal" /> {t('landing.roles.rector.feature1')}
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-teal" /> {t('landing.roles.rector.feature2')}
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-teal" /> {t('landing.roles.rector.feature3')}
                                    </li>
                                </ul>
                                <div className="pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">{t('landing.roles.outcome_label')}:</span>
                                    <p className="text-xs font-bold text-white">{t('landing.roles.rector.outcome')}</p>
                                </div>
                            </div>

                            {/* Lärare Card */}
                            <div className="glass-card p-8 rounded-3xl border-brand-blue/20 hover:border-brand-blue transition-all group relative overflow-hidden flex flex-col h-full">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Zap className="w-24 h-24" />
                                </div>
                                <div className="size-12 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-6 text-brand-blue">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{t('landing.roles.teacher.title')}</h3>
                                <p className="text-slate-400 text-sm mb-6 flex-grow">{t('landing.roles.teacher.desc')}</p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-blue" /> {t('landing.roles.teacher.feature1')}
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-blue" /> {t('landing.roles.teacher.feature2')}
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-blue" /> {t('landing.roles.teacher.feature3')}
                                    </li>
                                </ul>
                                <div className="pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">{t('landing.roles.outcome_label')}:</span>
                                    <p className="text-xs font-bold text-white">{t('landing.roles.teacher.outcome')}</p>
                                </div>
                            </div>

                            {/* Elev Card */}
                            <div className="glass-card p-8 rounded-3xl border-brand-gold/20 hover:border-brand-gold transition-all group relative overflow-hidden flex flex-col h-full">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Gamepad2 className="w-24 h-24" />
                                </div>
                                <div className="size-12 bg-brand-gold/10 rounded-xl flex items-center justify-center mb-6 text-brand-gold">
                                    <Gamepad2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{t('landing.roles.student.title')}</h3>
                                <p className="text-slate-400 text-sm mb-6 flex-grow">{t('landing.roles.student.desc')}</p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-gold" /> {t('landing.roles.student.feature1')}
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-gold" /> {t('landing.roles.student.feature2')}
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-gold" /> {t('landing.roles.student.feature3')}
                                    </li>
                                </ul>
                                <div className="pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">{t('landing.roles.outcome_label')}:</span>
                                    <p className="text-xs font-bold text-white">{t('landing.roles.student.outcome')}</p>
                                </div>
                            </div>

                            {/* Vårdnadshavare Card */}
                            <div className="glass-card p-8 rounded-3xl border-purple-500/20 hover:border-purple-500 transition-all group relative overflow-hidden flex flex-col h-full">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Shield className="w-24 h-24" />
                                </div>
                                <div className="size-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-400">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{t('landing.roles.parent.title')}</h3>
                                <p className="text-slate-400 text-sm mb-6 flex-grow">{t('landing.roles.parent.desc')}</p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-purple-400" /> {t('landing.roles.parent.feature1')}
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-purple-400" /> {t('landing.roles.parent.feature2')}
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-purple-400" /> {t('landing.roles.parent.feature3')}
                                    </li>
                                </ul>
                                <div className="pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">{t('landing.roles.outcome_label')}:</span>
                                    <p className="text-xs font-bold text-white">{t('landing.roles.parent.outcome')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* --- UPDATES & ROADMAP SECTION --- */}
                <section id="updates" className="max-w-7xl mx-auto px-6 py-16 space-y-12 fade-in-section">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <h2 className="text-3xl lg:text-5xl font-black">{t('landing.updates.title')}</h2>
                        <p className="text-slate-400 text-lg">{t('landing.updates.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-animation">
                        {/* Changelog Card */}
                        <div className="glass-card p-10 rounded-3xl group border-brand-teal/20 hover:border-brand-teal/50 transition-all duration-300 feature-card relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FileText className="w-24 h-24" />
                            </div>
                            <div className="size-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center mb-8 text-brand-teal">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">{t('landing.updates.changelog_title')}</h3>
                            
                            <div className="space-y-6 mb-8">
                                {Array.isArray(t('landing.updates.changelog_items', { returnObjects: true })) && 
                                 t('landing.updates.changelog_items', { returnObjects: true }).map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex-shrink-0 w-16 text-xs font-bold text-brand-teal bg-brand-teal/10 px-2 py-1 rounded text-center h-fit">
                                            {item.version}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <a
                                href="https://github.com/alexwest1981/EduFlex/blob/master/CHANGELOG.md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-brand-teal font-bold hover:gap-3 transition-all text-sm"
                            >
                                {t('landing.updates.view_full_changelog')} <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>

                        {/* Roadmap Card */}
                        <div className="glass-card p-10 rounded-3xl group border-brand-gold/20 hover:border-brand-gold/50 transition-all duration-300 feature-card relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Map className="w-24 h-24" />
                            </div>
                            <div className="size-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center mb-8 text-brand-gold">
                                <Target className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">{t('landing.updates.roadmap_title')}</h3>
                            
                            <div className="space-y-6 mb-8">
                                {Array.isArray(t('landing.updates.roadmap_items', { returnObjects: true })) && 
                                 t('landing.updates.roadmap_items', { returnObjects: true }).map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex-shrink-0 w-16 text-xs font-bold text-brand-gold bg-brand-gold/10 px-2 py-1 rounded text-center h-fit">
                                            {item.quarter}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <a
                                href="https://github.com/alexwest1981/EduFlex/blob/master/ROADMAP.md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-brand-gold font-bold hover:gap-3 transition-all text-sm"
                            >
                                {t('landing.updates.view_full_roadmap')} <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </section>


                {/* --- CTA SECTION --- */}
                <section className="py-16 lg:py-24 fade-in-section">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="brand-gradient rounded-3xl p-12 lg:p-20 text-center space-y-8 shadow-2xl shadow-brand-teal/30 relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-blue/20 rounded-full blur-3xl"></div>
                            <h2 className="text-3xl lg:text-5xl font-black text-white max-w-4xl mx-auto leading-tight relative z-10">
                                {t('landing.cta.title')}
                            </h2>
                            <p className="text-white/80 text-xl max-w-2xl mx-auto relative z-10">
                                {t('landing.cta.subtitle')}
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 relative z-10">
                                <button
                                    onClick={() => setIsContactModalOpen(true)}
                                    className="bg-brand-gold text-slate-900 font-bold px-10 py-4 rounded-2xl hover:scale-105 transition-transform shadow-xl glow-gold text-lg"
                                >
                                    {t('landing.cta.button_demo')}
                                </button>
                                <button
                                    onClick={() => navigate('/register-org')}
                                    className="bg-[#06141b]/30 backdrop-blur-md text-white border border-white/30 font-bold px-10 py-4 rounded-2xl hover:bg-white/10 transition-all text-lg"
                                >
                                    {t('landing.cta.button_test')}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* --- FOOTER --- */}
            <footer className="bg-[#040c11] pt-20 pb-10 mt-20 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="brand-gradient p-2 rounded-lg">
                                <img src={logoMain} alt="EduFlex" className="w-5 h-5 brightness-0 invert" />
                            </div>
                            <span className="text-xl font-bold">EduFlex <span className="text-brand-teal">LLP</span></span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('landing.footer.tagline')}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">{t('landing.footer.product')}</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a className="hover:text-brand-teal transition-colors" href="#features">{t('landing.footer.features')}</a></li>
                            <li><a className="hover:text-brand-teal transition-colors" href="#">{t('landing.footer.security')}</a></li>
                            <li><a className="hover:text-brand-teal transition-colors" href="#">{t('landing.footer.api')}</a></li>
                            <li><a className="hover:text-brand-teal transition-colors" href="#">{t('landing.footer.roadmap')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">{t('landing.footer.support')}</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a className="hover:text-brand-teal transition-colors" href="#">{t('landing.footer.help_center')}</a></li>
                            <li><a className="hover:text-brand-teal transition-colors" href="#">{t('landing.footer.documentation')}</a></li>
                            <li><a className="hover:text-brand-teal transition-colors" href="#">{t('landing.footer.system_status')}</a></li>
                            <li><a className="hover:text-brand-teal transition-colors" href="#">{t('landing.footer.contact_sales')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">{t('landing.footer.newsletter')}</h4>
                        <p className="text-sm text-slate-500 mb-4">{t('landing.footer.newsletter_desc')}</p>
                        <div className="flex gap-2">
                            <input
                                className="bg-white/5 border border-white/10 rounded-xl text-sm flex-1 px-4 py-2.5 focus:ring-brand-teal focus:border-brand-teal placeholder:text-slate-600 text-white"
                                placeholder={t('landing.footer.email_placeholder')}
                                type="email"
                            />
                            <button className="brand-gradient p-2.5 rounded-xl shadow-lg shadow-brand-teal/20" aria-label="Subscribe">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
                    <p>{t('landing.footer.copyright')}</p>
                    <div className="flex gap-6">
                        <a className="hover:text-white transition-colors" href="#">{t('landing.footer.privacy_policy')}</a>
                        <a className="hover:text-white transition-colors" href="#">{t('landing.footer.terms_of_service')}</a>
                        <a className="hover:text-white transition-colors" href="#">{t('landing.footer.cookie_settings')}</a>
                    </div>
                </div>
            </footer>

            {/* Contact Modal */}
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </div>
    );
};

export default LandingPage;
