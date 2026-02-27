import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    BookOpen, Trophy, Shield, Users,
    Globe, Database, Server, Zap, BarChart,
    Check, ArrowRight, Menu, X, Play, Sparkles,
    Award, TrendingUp, Layers, Gamepad2, Brain, Map, Flame, MessageSquare, Bell,
    FileText, ClipboardList, Thermometer, Target, Smartphone, Video as VideoIcon, Link2, Lock
} from 'lucide-react';

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
            description: "Full isolering och kontroll över varje organisation. Master-admin kan nu styra moduler och licensnivåer (BASIC/PRO/ENT) per tenant.",
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
            title: "Native PWA Experience",
            description: "Installera EduFlex direkt på hemskärmen. Fullt stöd för offline-åtkomst och blixtsnabb respons på alla enheter.",
            color: 'text-sky-400',
            bgColor: 'bg-sky-500/10',
            hoverBorder: 'hover:border-sky-500/50'
        },
        {
            icon: <VideoIcon className="w-7 h-7" />,
            title: "Premium Live Video",
            description: "Högpresterande videomöten via LiveKit. Inkluderar Zoom-liknande bakgrundsoskärpa och snyggt glassmorphiskt UI.",
            color: 'text-indigo-400',
            bgColor: 'bg-indigo-500/10',
            hoverBorder: 'hover:border-indigo-500/50'
        },
        {
            icon: <FileText className="w-7 h-7" />,
            title: "Collaborative Editing",
            description: "Redigera dokument tillsammans i realtid med OnlyOffice. Sömlös integration för Word, Excel och PowerPoint direkt i webbläsaren.",
            color: 'text-brand-orange',
            bgColor: 'bg-brand-orange/10',
            hoverBorder: 'hover:border-brand-orange/50'
        },
        {
            icon: <TrendingUp className="w-7 h-7" />,
            title: "ROI Reporting Engine",
            description: "Koppla utbildningsresultat till faktiska affärsmål. Maximera avkastningen på er kompetensutveckling med datadrivna insikter.",
            color: 'text-brand-gold',
            bgColor: 'bg-brand-gold/10',
            hoverBorder: 'hover:border-brand-gold/50'
        },
        {
            icon: <Bell className="w-7 h-7" />,
            title: "Multi-Channel Notifications",
            description: "Håll dig alltid uppdaterad. Få realtidsaviseringar via E-post, SMS och Push för chatt, kalender och feedback direkt i webbläsaren.",
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            hoverBorder: 'hover:border-purple-500/50'
        },
        {
            icon: <Shield className="w-7 h-7" />,
            title: "Exam Integrity Pro",
            description: "Säkerställ rättvisa tentamen med realtidsvideo-proctoring. AI-övervakning upptäcker misstänkt beteende och tvingar fram tydligt videomaterial.",
            color: 'text-rose-400',
            bgColor: 'bg-rose-500/10',
            hoverBorder: 'hover:border-rose-500/50'
        },
        {
            icon: <Link2 className="w-7 h-7" />,
            title: "Integration Hub Pro",
            description: "Koppla EduFlex till LTI 1.3, Zoom, Microsoft Teams, Skolverkets API, SIS-import och Bibliotekssökning – allt hanterat från ett enda admin-centrum.",
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
            hoverBorder: 'hover:border-cyan-500/50'
        },
        {
            icon: <Brain className="w-7 h-7" />,
            title: "AI Compliance Portal",
            description: "Full spårbarhet för varje AI-beslut. Granska prompt, svar, modell och användar-ID i realtid – GDPR-redo och klart för revision.",
            color: 'text-violet-400',
            bgColor: 'bg-violet-500/10',
            hoverBorder: 'hover:border-violet-500/50'
        },
        {
            icon: <Lock className="w-7 h-7" />,
            title: "Secure PII Masking",
            description: "Känslig persondata (SSN) är nu maskerad som standard och kräver säker lösenordsverifiering för att visas. Trygghet genom design.",
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
            hoverBorder: 'hover:border-amber-500/50'
        },
        {
            icon: <Map className="w-7 h-7" />,
            title: "EduCareer Portal (Live)",
            description: "Hitta din nästa LIA- eller praktikplats direkt i EduFlex via realtidsdata från JobTech. Inkluderar AI-driven matchningsanalys.",
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10',
            hoverBorder: 'hover:border-brand-teal/50'
        },
        {
            icon: <Map className="w-7 h-7" />,
            title: "Next-Gen ISP (AI & PDF)",
            description: "Revolutionera studieplaneringen med AI-kursförslag, automatisk poängberäkning och Komvux-kompatibla PDF-exporter med ett klick.",
            color: 'text-brand-gold',
            bgColor: 'bg-brand-gold/10',
            hoverBorder: 'hover:border-brand-gold/50'
        },
        {
            icon: <Lock className="w-7 h-7" />,
            title: "BankID Identity Broker",
            description: "Säker inloggning med svenskt BankID via OIDC. Fullt konfigurerbart för både Sandbox och Live direkt via vår Integration Hub.",
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10',
            hoverBorder: 'hover:border-brand-teal/50'
        },
        {
            icon: <Play className="w-7 h-7" />,
            title: "AI Video Tutor v3.6 (Live)",
            description: "Automatisk generering av interaktiva förklaringsvideor direkt från kursinnehåll via AI-script och Docker-optimerad rendering.",
            color: 'text-red-400',
            bgColor: 'bg-brand-red/10',
            hoverBorder: 'hover:border-brand-red/50'
        },
    ];


    const screenshotData = [
        { src: adminDashboardImg, title: 'Admin Dashboard 2.0', description: 'Total kontroll över organisationen med live-data och widgets.' },
        { src: teacherDashboardImg, title: 'Lärarpanelen', description: 'Effektiv översikt av elevers närvaro, framsteg och inlämningar.' },
        { src: aiQuizImg, title: 'AI Quiz Generator', description: 'Ladda upp dokument och låt AI skapa provfrågor på sekunder.' },
        { src: libraryImg, title: 'E-boksbibliotek', description: 'Ett centralt bibliotek för litteratur med inbyggd läsare.' },
        { src: catalogNewImg, title: 'Kurskatalog', description: 'Visuell och filtrerbar katalog för elever att hitta nya kurser.' },
        { src: resourceImg, title: 'Resursbank & Community', description: 'Dela och hämta material från ett gemensamt Community-bibliotek.' },
        { src: analyticsNewImg, title: 'Djupgående Statistik', description: 'Analysera intäkter, användarengagemang och kursresultat.' },
        { src: analyticsNewImg, title: 'ROI Reporting Engine', description: 'Visualisera korrelationen mellan Mastery Score och KPI:er.' },
        { src: settingsNewImg, title: 'Systeminställningar', description: 'Hantera LTI, moduler, tema och lagringsbackends.' },
        { src: debugImg, title: 'Live Debug Terminal', description: 'Matrix-inspirerad loggvisning för teknisk felsökning i realtid.' }
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
                        <span className="text-xl font-bold tracking-tight">EduFlex <span className="text-brand-teal">3.0</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-slate-300">
                        <a className="text-sm font-medium hover:text-brand-teal transition-colors" href="#features">{t('landing.nav.features')}</a>
                        <button onClick={() => navigate('/features#gamification')} className="text-sm font-medium hover:text-brand-teal transition-colors">Gamification</button>
                        <button onClick={() => navigate('/features#showcase')} className="text-sm font-medium hover:text-brand-teal transition-colors">Showcase</button>
                        <button onClick={() => navigate('/pricing')} className="text-sm font-medium hover:text-brand-teal transition-colors">Prissättning</button>
                        <button onClick={() => navigate('/features#highlights')} className="text-sm font-medium hover:text-brand-teal transition-colors">Teknologi</button>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Language Switcher */}
                        <div className="hidden sm:flex items-center gap-1 px-2 py-1.5 bg-white/5 rounded-full border border-white/10">
                            <button
                                onClick={() => i18n.changeLanguage('sv')}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${i18n.language === 'sv'
                                    ? 'bg-brand-teal text-slate-900'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                SV
                            </button>
                            <button
                                onClick={() => i18n.changeLanguage('en')}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${i18n.language === 'en'
                                    ? 'bg-brand-teal text-slate-900'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                EN
                            </button>
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
                            Boka Demo
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
                    <button onClick={() => { navigate('/features#showcase'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 px-4 text-slate-300 hover:bg-white/5 rounded-lg transition-colors">Showcase</button>
                    <button onClick={() => { navigate('/features#gamification'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 px-4 text-slate-300 hover:bg-white/5 rounded-lg transition-colors">Gamification</button>
                    <button onClick={() => { navigate('/features#highlights'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-3 px-4 text-slate-300 hover:bg-white/5 rounded-lg transition-colors">Teknologi</button>

                    <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10 mt-2">
                        <button
                            onClick={() => i18n.changeLanguage('sv')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${i18n.language === 'sv' ? 'bg-brand-teal text-slate-900' : 'bg-white/5 text-slate-400'}`}
                        >
                            Svenska
                        </button>
                        <button
                            onClick={() => i18n.changeLanguage('en')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${i18n.language === 'en' ? 'bg-brand-teal text-slate-900' : 'bg-white/5 text-slate-400'}`}
                        >
                            English
                        </button>
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
                            Kom igång
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
                            v3.6.1: Zero-Config Docker & Fixed Content Saving
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight">
                            Framtidens Lärande med <br /><span className="text-gradient drop-shadow-lg">EduAI Hub</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg text-slate-300 max-w-xl leading-relaxed font-light">
                            Upptäck vårt nya intelligenta kunskapscenter. Generera skräddarsydda studiepass med AI, spela engagerande minispel och följ din exakta kunskapsutveckling via vår dynamiska Live Radar. Allt drivet av Google Gemini.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4 pt-2">
                            <button
                                onClick={() => navigate('/login')}
                                className="brand-gradient text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform text-lg shadow-xl shadow-brand-teal/30 flex items-center gap-2"
                            >
                                <Brain className="w-5 h-5" /> Starta din första AI Session
                            </button>
                            <button
                                onClick={() => navigate('/features')}
                                className="glass-card font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-lg flex items-center gap-2 text-slate-200"
                            >
                                Läs mer om plattformen <ArrowRight className="w-5 h-5 text-brand-teal" />
                            </button>
                        </div>

                        {/* Tech Stack */}
                        <div className="flex flex-col gap-4 pt-4">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Drivs av modern AI & beprövad pedagogik</p>
                            <div className="flex flex-wrap items-center gap-6 opacity-60 hover:opacity-100 transition-all duration-500">
                                <div className="flex items-center gap-2 group">
                                    <Brain className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-semibold text-slate-400 group-hover:text-slate-200">Google Gemini</span>
                                </div>
                                <div className="flex items-center gap-2 group">
                                    <Database className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-semibold text-slate-400 group-hover:text-slate-200">PostgreSQL</span>
                                </div>
                                <div className="flex items-center gap-2 group">
                                    <Sparkles className="w-5 h-5 text-brand-teal group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-semibold text-slate-400 group-hover:text-slate-200">OpenAI API</span>
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
                                            <p className="text-xs text-slate-400">Engagemang</p>
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
                                            <p className="text-sm font-bold text-white">Ny nivå!</p>
                                            <p className="text-xs text-slate-400">Level 12</p>
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
                            Se alla funktioner <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                {/* --- SOLUTIONS BY ROLE SECTION (NEW) --- */}
                <section className="bg-slate-900/40 py-24 border-y border-white/5 relative overflow-hidden fade-in-section">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-teal/50 to-transparent"></div>

                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-wider">
                                <Users className="w-3 h-3" /> Personalisering
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-black">Anpassat för din roll</h2>
                            <p className="text-slate-400 text-lg">EduFlex levererar ett skräddarsytt gränssnitt och specifika verktyg beroende på din profil.</p>
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
                                <h3 className="text-xl font-bold mb-2">För Rektor</h3>
                                <p className="text-slate-400 text-sm mb-6 flex-grow">Få full kontroll över skolan med realtidsdata för SKA, bemanning och hälsa.</p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-teal" /> Dashboards för beslutsstöd
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-teal" /> Incident- & hälsohantering
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-teal" /> SKA-årshjul & KPIer
                                    </li>
                                </ul>
                                <div className="pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">Outcome:</span>
                                    <p className="text-xs font-bold text-white">Full insyn i verksamheten</p>
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
                                <h3 className="text-xl font-bold mb-2">För Lärare</h3>
                                <p className="text-slate-400 text-sm mb-6 flex-grow">Minska administrationen och fokusera på undervisningen med AI-stöd.</p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-blue" /> AI Course & Quiz Creator
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-blue" /> Automatiserad rättning
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-blue" /> LTI 1.3 Advantage-synk
                                    </li>
                                </ul>
                                <div className="pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Outcome:</span>
                                    <p className="text-xs font-bold text-white">Spara 10h administration/vecka</p>
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
                                <h3 className="text-xl font-bold mb-2">För Elev</h3>
                                <p className="text-slate-400 text-sm mb-6 flex-grow">Ett engagerande sätt att lära med adaptiva stigar och spelifiering.</p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-gold" /> Personlig AI-lärväg
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-gold" /> XP, Streaks & Achievements
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-brand-gold" /> Social Learning & Vänner
                                    </li>
                                </ul>
                                <div className="pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Outcome:</span>
                                    <p className="text-xs font-bold text-white">Ökad motivation & resultat</p>
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
                                <h3 className="text-xl font-bold mb-2">För Förälder</h3>
                                <p className="text-slate-400 text-sm mb-6 flex-grow">Håll dig uppdaterad om barnets framsteg direkt via mobilen.</p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-purple-400" /> AI-genererad barnstatus
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-purple-400" /> Digital sjukanmälan
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                                        <Check className="w-4 h-4 text-purple-400" /> Insyn i schema & betyg
                                    </li>
                                </ul>
                                <div className="pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Outcome:</span>
                                    <p className="text-xs font-bold text-white">Full trygghet & insyn</p>
                                </div>
                            </div>
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
                                Redo att transformera er utbildning?
                            </h2>
                            <p className="text-white/80 text-xl max-w-2xl mx-auto relative z-10">
                                Börja resan mot ett modernare sätt att lära och utvecklas.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 relative z-10">
                                <button
                                    onClick={() => setIsContactModalOpen(true)}
                                    className="bg-brand-gold text-slate-900 font-bold px-10 py-4 rounded-2xl hover:scale-105 transition-transform shadow-xl glow-gold text-lg"
                                >
                                    Boka en gratis demo
                                </button>
                                <button
                                    onClick={() => navigate('/register-org')}
                                    className="bg-[#06141b]/30 backdrop-blur-md text-white border border-white/30 font-bold px-10 py-4 rounded-2xl hover:bg-white/10 transition-all text-lg"
                                >
                                    Testa gratis
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
                            <span className="text-xl font-bold">EduFlex <span className="text-brand-teal">3.0</span></span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('landing.footer.tagline')}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">{t('landing.footer.product')}</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a className="hover:text-brand-teal transition-colors" href="#features">{t('landing.footer.features')}</a></li>
                            <li><a className="hover:text-brand-teal transition-colors" href="#">Säkerhet</a></li>
                            <li><a className="hover:text-brand-teal transition-colors" href="#">API</a></li>
                            <li><a className="hover:text-brand-teal transition-colors" href="#">{t('landing.footer.roadmap')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">Support</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a className="hover:text-brand-teal transition-colors" href="#">Hjälpcenter</a></li>
                            <li><a className="hover:text-brand-teal transition-colors" href="#">{t('landing.footer.documentation')}</a></li>
                            <li><a className="hover:text-brand-teal transition-colors" href="#">{t('landing.footer.system_status')}</a></li>
                            <li><a className="hover:text-brand-teal transition-colors" href="#">{t('landing.footer.contact_sales')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">Nyhetsbrev</h4>
                        <p className="text-sm text-slate-500 mb-4">Få de senaste insikterna om digitalt lärande.</p>
                        <div className="flex gap-2">
                            <input
                                className="bg-white/5 border border-white/10 rounded-xl text-sm flex-1 px-4 py-2.5 focus:ring-brand-teal focus:border-brand-teal placeholder:text-slate-600 text-white"
                                placeholder="Din e-post"
                                type="email"
                            />
                            <button className="brand-gradient p-2.5 rounded-xl shadow-lg shadow-brand-teal/20">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
                    <p>{t('landing.footer.copyright')}</p>
                    <div className="flex gap-6">
                        <a className="hover:text-white transition-colors" href="#">Integritetspolicy</a>
                        <a className="hover:text-white transition-colors" href="#">Användarvillkor</a>
                        <a className="hover:text-white transition-colors" href="#">Cookie-inställningar</a>
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
