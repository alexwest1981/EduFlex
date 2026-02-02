import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    School, BookOpen, Trophy, Shield, Users,
    Globe, Database, Server, Zap, BarChart,
    Check, ArrowRight, Menu, X, ChevronRight, Play, Sparkles,
    Award, TrendingUp
} from 'lucide-react';

// Assets
import heroImage from '../../assets/images/Hero.jpg';
import logoMain from '../../assets/images/Logo_top.png';

// Components
import ContactModal from '../../components/ContactModal';
import ScreenshotSlider from '../../components/landing/ScreenshotSlider';

// Feature Screenshots - New
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

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on resize
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
            icon: <Sparkles className="w-6 h-6" />,
            title: t('landing.features.ai_creator.title'),
            description: t('landing.features.ai_creator.desc'),
            gradient: 'from-purple-500 to-indigo-500'
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            title: t('landing.features.gamification.title'),
            description: t('landing.features.gamification.desc'),
            gradient: 'from-yellow-500 to-orange-500'
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: t('landing.features.lti_ready.title'),
            description: t('landing.features.lti_ready.desc'),
            gradient: 'from-blue-600 to-cyan-500'
        },
        {
            icon: <Database className="w-6 h-6" />,
            title: t('landing.features.multi_tenancy.title'),
            description: t('landing.features.multi_tenancy.desc'),
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: t('landing.features.security.title'),
            description: t('landing.features.security.desc'),
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            icon: <BarChart className="w-6 h-6" />,
            title: t('landing.features.analytics.title'),
            description: t('landing.features.analytics.desc'),
            gradient: 'from-indigo-500 to-purple-500'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: t('landing.features.evaluation_system.title'),
            description: t('landing.features.evaluation_system.desc'),
            gradient: 'from-blue-600 to-indigo-700'
        }
    ];

    const stats = [
        { value: '9', label: 'Språk', icon: <Globe className="w-5 h-5" /> },
        { value: '8', label: 'Designteman', icon: <Sparkles className="w-5 h-5" /> },
        { value: '40+', label: 'API-endpoints', icon: <Zap className="w-5 h-5" /> },
        { value: '100%', label: 'Open Source Stack', icon: <Shield className="w-5 h-5" /> }
    ];

    const highlights = [
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: 'AI Course Creator',
            description: 'Skapa kompletta kurser från PDF-dokument på under 60 sekunder. Autogenererade lektioner, datum och smarta koder med inbyggd databassynkronisering.',
            gradient: 'from-purple-600 to-blue-600'
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: 'Prediktiv AI-Analys',
            description: 'Identifiera riskstudenter innan det är för sent. AI analyserar beteendemönster och ger lärare beslutsstöd samt elever personliga studietips.',
            gradient: 'from-red-500 to-pink-600'
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: 'LTI 1.3 Core',
            description: 'Fullt verifierat stöd för OIDC-lansering. Sömlös integration med Canvas, Moodle och Blackboard för säker autentisering.',
            gradient: 'from-blue-600 to-indigo-600'
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            title: 'EduGame Engine',
            description: 'XP-system, Shop, Profilteman, dagliga utmaningar och streaks. Gör lärandet till ett äventyr.',
            gradient: 'from-yellow-500 to-orange-500'
        },
        {
            icon: <Database className="w-6 h-6" />,
            title: 'Schema-per-Tenant',
            description: 'Äkta multi-tenancy med komplett dataisolering. Varje organisation får sitt eget PostgreSQL-schema automatiskt.',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: 'Community Marketplace',
            description: 'Dela och importera kursmaterial från ett gemensamt ekosystem. Samverka med andra utbildningsanordnare.',
            gradient: 'from-teal-500 to-cyan-500'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Cascading Deletes',
            description: 'Underhållsfri hantering. När du tar bort en kurs raderas allt tillhörande material och lektioner automatiskt utan databaskonflikter.',
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Enterprise SSO',
            description: 'Keycloak-integration med OAuth2/OIDC. Full kontroll över identiteter och åtkomstnivåer i organisationen.',
            gradient: 'from-red-500 to-orange-500'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Friendly URLs (Slugs)',
            description: 'Sökmotorvänliga och läsbara adresser för alla kurser. Navigera via läsbara namn istället för tekniska ID:n.',
            gradient: 'from-cyan-400 to-blue-500'
        },
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: 'AI Quiz Generator',
            description: 'Generera quiz automatiskt från dokument (PDF/Word) med Gemini AI. Exportera direkt till din personliga frågebank.',
            gradient: 'from-purple-600 to-pink-600'
        },
        {
            icon: <BarChart className="w-6 h-6" />,
            title: 'Kursutvärdering & Insikter',
            description: 'Komplett system för kurskvalitet, automatiserade studentnotiser och AI-analys av fritextsvar för att mäta ROI.',
            gradient: 'from-indigo-600 to-blue-700'
        }
    ];

    const screenshotData = [
        { src: adminDashboardImg, title: 'Admin Dashboard 2.0', description: 'Total kontroll över organisationen med live-data och widgets.' },
        { src: teacherDashboardImg, title: 'Lärarpanelen', description: 'Effektiv översikt av elevers närvaro, framsteg och inlämningar.' },
        { src: aiQuizImg, title: 'AI Quiz Generator', description: 'Ladda upp dokument och låt AI skapa provfrågor på sekunder.' },
        { src: libraryImg, title: 'E-boksbibliotek', description: 'Ett centralt bibliotek för litteratur med inbyggd läsare.' },
        { src: catalogNewImg, title: 'Kurskatalog', description: 'Visuell och filtrerbar katalog för elever att hitta nya kurser.' },
        { src: resourceImg, title: 'Resursbank & Community', description: 'Dela och hämta material från ett gemensamt Community-bibliotek.' },
        { src: analyticsNewImg, title: 'Djupgående Statistik', description: 'Analysera intäkter, användarengagemang och kursresultat.' },
        { src: settingsNewImg, title: 'Systeminställningar', description: 'Hantera LTI, moduler, tema och lagringsbackends.' },
        { src: debugImg, title: 'Live Debug Terminal', description: 'Matrix-inspirerad loggvisning för teknisk felsökning i realtid.' }
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 overflow-x-hidden">
            {/* Custom Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes blob {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 8s ease infinite;
                }
                .feature-card {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .feature-card:hover {
                    transform: translateY(-8px);
                }
                .glass-effect {
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                .text-balance { text-wrap: balance; }
            `}</style>

            {/* --- NAVBAR --- */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/90 glass-effect shadow-sm border-b border-gray-100'
                : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 md:h-20 flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <img src={logoMain} alt="EduFlex Logo" className="h-9 md:h-10 w-auto" />
                            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                EduFlex
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
                            <a href="#features" className="hover:text-blue-600 transition-colors duration-200">{t('landing.nav.features')}</a>
                            <a href="#showcase" className="hover:text-blue-600 transition-colors duration-200">Showcase</a>
                            <a href="#architecture" className="hover:text-blue-600 transition-colors duration-200">{t('landing.nav.architecture')}</a>
                            <a href="#highlights" className="hover:text-blue-600 transition-colors duration-200">Teknologi</a>
                            <a href="#pricing" className="hover:text-blue-600 transition-colors duration-200">{t('landing.nav.pricing')}</a>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center space-x-3">
                            {/* Language Switcher */}
                            <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-100/80 rounded-full border border-gray-200/50">
                                <button
                                    onClick={() => i18n.changeLanguage('sv')}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${i18n.language === 'sv'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                                        }`}
                                >
                                    SV
                                </button>
                                <button
                                    onClick={() => i18n.changeLanguage('en')}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${i18n.language === 'en'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                                        }`}
                                >
                                    EN
                                </button>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                {t('landing.nav.login')}
                            </button>
                            <button
                                onClick={() => navigate('/register-org')}
                                className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                {t('landing.nav.get_started')}
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen
                    ? 'max-h-[400px] opacity-100'
                    : 'max-h-0 opacity-0 overflow-hidden'
                    }`}>
                    <div className="bg-white border-t border-gray-100 px-4 py-4 space-y-3">
                        <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">{t('landing.nav.features')}</a>
                        <a href="#showcase" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">Showcase</a>
                        <a href="#architecture" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">{t('landing.nav.architecture')}</a>
                        <a href="#highlights" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">Teknologi</a>
                        <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">{t('landing.nav.pricing')}</a>

                        {/* Mobile Language Switcher */}
                        <div className="flex items-center gap-2 px-4 py-2">
                            <button
                                onClick={() => i18n.changeLanguage('sv')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${i18n.language === 'sv'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                Svenska
                            </button>
                            <button
                                onClick={() => i18n.changeLanguage('en')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${i18n.language === 'en'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                English
                            </button>
                        </div>

                        <div className="pt-3 space-y-2 border-t border-gray-100">
                            <button
                                onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                                className="w-full py-3 text-center text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                {t('landing.nav.login')}
                            </button>
                            <button
                                onClick={() => { navigate('/register-org'); setIsMobileMenuOpen(false); }}
                                className="w-full py-3 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg"
                            >
                                {t('landing.nav.get_started')}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-28 pb-16 md:pt-36 lg:pt-44 lg:pb-24 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-60"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-50 to-blue-50 rounded-full blur-3xl opacity-40"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        {/* Left Content */}
                        <div className="lg:w-1/2 text-center lg:text-left">
                            {/* Badge */}
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 mb-6 md:mb-8">
                                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                                <span className="text-sm font-semibold text-blue-700">{t('landing.hero.badge')}</span>
                            </div>

                            {/* Heading */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 text-balance">
                                {t('landing.hero.title_start')}
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                                    {t('landing.hero.title_highlight')}
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                {t('landing.hero.subtitle')}
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button
                                    onClick={() => setIsContactModalOpen(true)}
                                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
                                >
                                    {t('landing.hero.cta_trial')}
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate('/register-org')}
                                    className="group px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-full font-bold text-lg hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
                                >
                                    <Sparkles className="mr-2 w-5 h-5 text-blue-600" />
                                    Testa 14 dagar
                                </button>
                            </div>

                            {/* Tech Badges */}
                            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                                <span className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-600 flex items-center">
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                                    React 19
                                </span>
                                <span className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-600 flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Spring Boot 3.4
                                </span>
                                <span className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-600 flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    Docker Ready
                                </span>
                            </div>
                        </div>

                        {/* Right Content - Hero Image */}
                        <div className="lg:w-1/2 relative">
                            <div className="relative w-full max-w-lg mx-auto">
                                {/* Floating Background Blobs */}
                                <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                                <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

                                {/* Main Image */}
                                <div className="relative animate-float">
                                    <img
                                        src={heroImage}
                                        alt="EduFlex Student"
                                        className="relative rounded-3xl shadow-2xl ring-1 ring-gray-900/10 w-full object-cover"
                                    />

                                    {/* Floating Stats Card */}
                                    <div className="absolute -bottom-6 -left-6 sm:-left-10 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                                                <TrendingUp className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900">+47%</p>
                                                <p className="text-sm text-gray-500">Engagemang</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Floating Achievement Card */}
                                    <div className="absolute -top-4 -right-4 sm:-right-8 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                                                <Award className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Ny nivå!</p>
                                                <p className="text-xs text-gray-500">Level 12</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="text-center p-6 bg-white/60 glass-effect rounded-2xl border border-gray-100">
                                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-xl mb-3">
                                    {stat.icon}
                                </div>
                                <p className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section id="features" className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-4">
                            <span className="text-sm font-semibold text-blue-700">{t('landing.features.badge')}</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 text-balance">
                            {t('landing.features.title')}
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {t('landing.features.subtitle')}
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="feature-card group bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl"
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                                <div className="mt-6 flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-sm">Läs mer</span>
                                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- SCREENSHOT SHOWCASE --- */}
            <section id="showcase" className="py-20 md:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-4">
                            <Play className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-sm font-semibold text-blue-700">Showcase</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                            Upplev EduFlex i Aktion
                        </h2>
                    </div>

                    <ScreenshotSlider screenshots={screenshotData} />
                </div>
            </section>

            {/* --- ARCHITECTURE --- */}
            <section id="architecture" className="py-20 md:py-28 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
                            <span className="text-sm font-semibold text-indigo-700">{t('landing.architecture.badge')}</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                            {t('landing.architecture.title')}
                        </h2>
                    </div>

                    {/* Architecture Card */}
                    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                        {/* Decorative gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>

                        <div className="relative grid grid-cols-1 lg:grid-cols-2">
                            {/* Left Side - Tech Stack */}
                            <div className="p-8 md:p-12 lg:p-16">
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
                                    {t('landing.architecture.powered_by')}
                                </h3>
                                <ul className="space-y-5">
                                    {(Array.isArray(t('landing.architecture.items', { returnObjects: true })) ? t('landing.architecture.items', { returnObjects: true }) : []).map((item, i) => (
                                        <li key={i} className="flex items-center text-gray-300 group">
                                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-500/30 transition-colors">
                                                <Check className="w-5 h-5 text-green-400" />
                                            </div>
                                            <span className="text-lg">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Right Side - Visual Diagram */}
                            <div className="bg-gray-800/50 p-8 md:p-12 lg:p-16 border-t lg:border-t-0 lg:border-l border-gray-700/50">
                                <div className="space-y-6">
                                    {/* Architecture Flow Visualization */}
                                    <div className="flex flex-col space-y-4">
                                        {[
                                            { icon: <Users className="w-5 h-5" />, label: 'Users', color: 'from-blue-400 to-cyan-400' },
                                            { icon: <Globe className="w-5 h-5" />, label: 'React Frontend', color: 'from-cyan-400 to-teal-400' },
                                            { icon: <Server className="w-5 h-5" />, label: 'API Gateway', color: 'from-green-400 to-emerald-400' },
                                            { icon: <Shield className="w-5 h-5" />, label: 'Keycloak Auth', color: 'from-yellow-400 to-orange-400' },
                                            { icon: <Zap className="w-5 h-5" />, label: 'Spring Boot API', color: 'from-orange-400 to-red-400' },
                                            { icon: <Database className="w-5 h-5" />, label: 'PostgreSQL + Redis', color: 'from-purple-400 to-pink-400' }
                                        ].map((step, idx) => (
                                            <div key={idx} className="flex items-center">
                                                <div className={`w-10 h-10 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                                                    {step.icon}
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <div className="h-0.5 bg-gradient-to-r from-gray-600 to-transparent"></div>
                                                </div>
                                                <span className="text-gray-300 text-sm font-medium ml-4">{step.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- HIGHLIGHTS / TECH SHOWCASE --- */}
            <section id="highlights" className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-4">
                            <Zap className="w-4 h-4 text-purple-500 mr-2" />
                            <span className="text-sm font-semibold text-purple-700">Tekniska Höjdpunkter</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                            Byggd med Modern Teknologi
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            React 19, Spring Boot 3.4, PostgreSQL 15 och en komplett DevOps-stack för enterprise-klass prestanda
                        </p>
                    </div>

                    {/* Highlights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {highlights.map((item, idx) => (
                            <div
                                key={idx}
                                className="feature-card group bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl"
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Tech Stack Banner */}
                    <div className="mt-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 md:p-12">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">Full Technology Stack</h3>
                            <p className="text-gray-400">Enterprise-grade open source teknologier</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                            {[
                                { name: 'React 19', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
                                { name: 'Spring Boot 3.4', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
                                { name: 'PostgreSQL 15', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                                { name: 'Redis 7', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
                                { name: 'MinIO S3', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
                                { name: 'Keycloak 24', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
                                { name: 'Docker', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
                                { name: 'Kubernetes', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
                                { name: 'Prometheus', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
                                { name: 'Grafana', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
                                { name: 'Tailwind CSS', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
                                { name: 'Vite 5', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
                            ].map((tech, idx) => (
                                <span key={idx} className={`px-4 py-2 rounded-full text-sm font-medium border ${tech.color}`}>
                                    {tech.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRICING --- */}
            <section id="pricing" className="py-20 md:py-28 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                            {t('landing.pricing.title')}
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {t('landing.pricing.subtitle')}
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        {['basic', 'pro', 'enterprise'].map((plan, idx) => {
                            const isHighlight = plan === 'pro';
                            return (
                                <div
                                    key={idx}
                                    className={`relative bg-white rounded-3xl p-8 flex flex-col transition-all duration-300 ${isHighlight
                                        ? 'border-2 border-blue-500 shadow-2xl shadow-blue-500/20 scale-100 md:scale-105 z-10'
                                        : 'border border-gray-200 hover:border-gray-300 hover:shadow-lg'
                                        }`}
                                >
                                    {isHighlight && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wide shadow-lg">
                                                {t('landing.pricing.pro.badge')}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {t(`landing.pricing.${plan}.name`)}
                                        </h3>
                                        <div className="flex items-baseline">
                                            <span className="text-4xl font-extrabold text-gray-900">
                                                {t(`landing.pricing.${plan}.price`).split('/')[0]}
                                            </span>
                                            {t(`landing.pricing.${plan}.price`).includes('/') && (
                                                <span className="text-gray-500 ml-1">
                                                    / {t(`landing.pricing.${plan}.price`).split('/')[1]}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <ul className="space-y-4 flex-1 mb-8">
                                        {(Array.isArray(t(`landing.pricing.${plan}.features`, { returnObjects: true })) ? t(`landing.pricing.${plan}.features`, { returnObjects: true }) : []).map((feat, i) => (
                                            <li key={i} className="flex items-start">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 mr-3 ${isHighlight ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    <Check className="w-3 h-3" />
                                                </div>
                                                <span className="text-gray-600">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => isHighlight && setIsContactModalOpen(true)}
                                        className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 ${isHighlight
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {t(`landing.pricing.${plan}.cta`)}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-20 md:py-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
                        Redo att transformera er utbildning?
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => setIsContactModalOpen(true)}
                            className="group px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
                        >
                            Boka en Demo
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        {/* Brand Column */}
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center space-x-3 mb-4">
                                <img src={logoMain} alt="EduFlex" className="h-8 brightness-0 invert" />
                                <span className="text-xl font-bold text-white">EduFlex</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                {t('landing.footer.tagline')}
                            </p>
                            {/* Social Icons */}
                            <div className="flex space-x-3">
                                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path></svg>
                                </a>
                            </div>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h4 className="font-bold text-white mb-4">{t('landing.footer.product')}</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.features')}</a></li>
                                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.pricing')}</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.roadmap')}</a></li>
                            </ul>
                        </div>

                        {/* Resources Links */}
                        <div>
                            <h4 className="font-bold text-white mb-4">{t('landing.footer.resources')}</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.documentation')}</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.api_reference')}</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.system_status')}</a></li>
                            </ul>
                        </div>

                        {/* Connect Links */}
                        <div>
                            <h4 className="font-bold text-white mb-4">{t('landing.footer.connect')}</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.contact_sales')}</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.twitter')}</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('landing.footer.github')}</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm">{t('landing.footer.copyright')}</p>
                        <div className="flex items-center space-x-2 mt-4 md:mt-0">
                            <span className="text-gray-500 text-sm">{t('landing.footer.developed_by')}</span>
                            <span className="text-white font-semibold text-sm">{t('landing.footer.fenrir')}</span>
                        </div>
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
