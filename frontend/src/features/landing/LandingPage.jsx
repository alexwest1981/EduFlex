import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    BookOpen, Trophy, Shield, Users,
    Globe, Database, Server, Zap, BarChart,
    Check, ArrowRight, Menu, X, Play, Sparkles,
    Award, TrendingUp, Layers, Gamepad2, Brain, Map, Flame, MessageSquare,
    FileText, ClipboardList, Thermometer
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
            description: t('landing.features.multi_tenancy.desc'),
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
    ];

    const highlights = [
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: 'AI Course Creator',
            description: 'Skapa kompletta kurser från PDF-dokument på under 60 sekunder. Autogenererade lektioner, datum och smarta koder med inbyggd databassynkronisering.',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10'
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: 'Prediktiv AI-Analys',
            description: 'Identifiera riskstudenter innan det är för sent. AI analyserar beteendemönster och ger lärare beslutsstöd samt elever personliga studietips.',
            color: 'text-rose-400',
            bgColor: 'bg-rose-500/10'
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: 'LTI 1.3 Advantage',
            description: 'Fullt verifierat stöd för AGS (Betyg) och NRPS (Roller/Namn). Sömlös integration med Canvas, Moodle och Blackboard för säker autentisering och datautbyte.',
            color: 'text-brand-blue',
            bgColor: 'bg-brand-blue/10'
        },
        {
            icon: <Database className="w-6 h-6" />,
            title: 'xAPI & CMI5 LRS',
            description: 'Nästa generations spårning. Kör simuleringar och offline-mobilkurser med full detaljrapportering via vårt inbyggda Learning Record Store.',
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10'
        },
        {
            icon: <Server className="w-6 h-6" />,
            title: 'MinIO & S3 Storage',
            description: 'Skalbar Enterprise-lagring. All media (ljudböcker, video) streamas blixtsnabbt med stöd för uppspelning där du slutade.',
            color: 'text-pink-400',
            bgColor: 'bg-pink-500/10'
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            title: 'EduGame Engine',
            description: 'XP-system, Shop, Profilteman, dagliga utmaningar och streaks. Gör lärandet till ett äventyr.',
            color: 'text-brand-gold',
            bgColor: 'bg-brand-gold/10'
        },
        {
            icon: <Database className="w-6 h-6" />,
            title: 'Schema-per-Tenant',
            description: 'Äkta multi-tenancy med komplett dataisolering. Varje organisation får sitt eget PostgreSQL-schema automatiskt.',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10'
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: 'Resursbank & Community',
            description: 'Ett unifierat bibliotek för alla dina quiz, uppgifter och lektioner. Dela och importera material från andra lärare med ett klick.',
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Cascading Deletes',
            description: 'Underhållsfri hantering. När du tar bort en kurs raderas allt tillhörande material och lektioner automatiskt utan databaskonflikter.',
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Enterprise SSO',
            description: 'Keycloak-integration med OAuth2/OIDC. Full kontroll över identiteter och åtkomstnivåer i organisationen.',
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Friendly URLs (Slugs)',
            description: 'Sökmotorvänliga och läsbara adresser för alla kurser. Navigera via läsbara namn istället för tekniska ID:n.',
            color: 'text-sky-400',
            bgColor: 'bg-sky-500/10'
        },
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: 'Quiz Generator',
            description: 'Slumpa quiz automatiskt från din frågebank (Math, Java, Svenska etc.) för snabb kunskapskontroll utan manuellt arbete.',
            color: 'text-fuchsia-400',
            bgColor: 'bg-fuchsia-500/10'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Enterprise Security',
            description: 'Fullständig AES-256 GCM kryptering av känslig data, domän-låst licensiering och rate-limiting skyddar din organisation dygnet runt.',
            color: 'text-indigo-400',
            bgColor: 'bg-indigo-500/10'
        },
        {
            icon: <BarChart className="w-6 h-6" />,
            title: 'Kursutvärdering & Insikter',
            description: 'Komplett system för kurskvalitet, automatiserade studentnotiser och AI-analys av fritextsvar för att mäta ROI.',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10'
        },
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: 'Contextual Social Learning',
            description: 'Diskutera lektioner och kurser i realtid direkt i spelaren. Lär av dina kurskamrater genom trådade konversationer och realtidsnotiser.',
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10'
        },
        {
            icon: <Flame className="w-6 h-6" />,
            title: 'Milestone Streaks',
            description: 'Fortsätt din "Learning Streak" och lås upp exklusiva XP-bonusar och märken. Centraliserad spårning som motiverar dig varje dag.',
            color: 'text-brand-orange',
            bgColor: 'bg-brand-orange/10'
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: 'Rektorspaket (Mission Control)',
            description: 'Fullständigt skolledningslager med realtids-KPIer. Hantera organisationshierarki (Avdelning, Program, Klass), se aggregerad statistik och hantera incidenter i en unifierad, live-vy.',
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10'
        },
        {
            icon: <Map className="w-6 h-6" />,
            title: 'Skolverket Sync 2.0',
            description: 'Synkronisera din kurskatalog i realtid. Importera automatiskt kursbeskrivningar, centralt innehåll och betygskriterier direkt från källan för alla kurser på en gång.',
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10'
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            title: 'Expansiv Gamification',
            description: 'XP för allt! Tjäna poäng genom AI-chatt, lektionsvisningar och utmaningar. Profilteman, shop, streaks och badges gör lärandet beroendeframkallande.',
            color: 'text-brand-gold',
            bgColor: 'bg-brand-gold/10'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Guardian & Health Control',
            description: 'Vårdnadshavarportal, digital sjukanmälan och enkäter för elevhälsa. Allt samlat med AES-256 kryptering och sekretessvakter för säker datahantering.',
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10'
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
                        <span className="text-xl font-bold tracking-tight">EduFlex <span className="text-brand-teal">2.0</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-slate-300">
                        <a className="text-sm font-medium hover:text-brand-teal transition-colors" href="#features">{t('landing.nav.features')}</a>
                        <a className="text-sm font-medium hover:text-brand-teal transition-colors" href="#showcase">Showcase</a>
                        <a className="text-sm font-medium hover:text-brand-teal transition-colors" href="#gamification">Gamification</a>
                        <a className="text-sm font-medium hover:text-brand-teal transition-colors" href="#highlights">Teknologi</a>
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
                    <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-4 text-slate-300 hover:bg-white/5 rounded-lg transition-colors">{t('landing.nav.features')}</a>
                    <a href="#showcase" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-4 text-slate-300 hover:bg-white/5 rounded-lg transition-colors">Showcase</a>
                    <a href="#gamification" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-4 text-slate-300 hover:bg-white/5 rounded-lg transition-colors">Gamification</a>
                    <a href="#highlights" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-4 text-slate-300 hover:bg-white/5 rounded-lg transition-colors">Teknologi</a>

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

            <main className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* --- HERO SECTION --- */}
                <section className="py-16 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-xs font-bold uppercase tracking-widest">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal"></span>
                            </span>
                            {t('landing.hero.badge')}
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight">
                            {t('landing.hero.title_start')} <span className="text-gradient">{t('landing.hero.title_highlight')}</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                            {t('landing.hero.subtitle')}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate('/register-org')}
                                className="brand-gradient text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform text-lg shadow-xl shadow-brand-teal/30 flex items-center gap-2"
                            >
                                Kom igång gratis <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsContactModalOpen(true)}
                                className="glass-card font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-lg flex items-center gap-2 text-slate-200"
                            >
                                <Play className="w-5 h-5 text-brand-teal" /> Se demo
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

                {/* --- FEATURES SECTION --- */}
                <section id="features" className="py-16 lg:py-24 space-y-12 fade-in-section">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <h2 className="text-3xl lg:text-5xl font-black">{t('landing.features.title')}</h2>
                        <p className="text-slate-400 text-lg">{t('landing.features.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-animation fade-in-section">
                        {features.map((feature, idx) => (
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
                </section>

                {/* --- SCREENSHOT SHOWCASE --- */}
                <section id="showcase" className="py-16 lg:py-24 fade-in-section">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-teal/10 border border-brand-teal/20 mb-4">
                            <Play className="w-4 h-4 text-brand-teal mr-2" />
                            <span className="text-sm font-semibold text-brand-teal">Showcase</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                            Upplev EduFlex i Aktion
                        </h2>
                    </div>

                    <ScreenshotSlider screenshots={screenshotData} />
                </section>

                {/* --- GAMIFICATION SHOWCASE --- */}
                <section id="gamification" className="py-16 lg:py-24 relative overflow-hidden rounded-3xl fade-in-section">
                    <div className="absolute inset-0 brand-gradient opacity-5 -z-10"></div>
                    <div className="grid lg:grid-cols-2 gap-16 items-center px-6 lg:px-10">
                        <div className="space-y-6">
                            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">Gör lärandet till ett äventyr</h2>
                            <p className="text-slate-400 text-lg">
                                Med EduFlex 2.0 försvinner tröskeln för att börja plugga. Genom att implementera spelmekanik på djupet skapar vi ett naturligt driv hos användaren.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-brand-teal" />
                                    <span>Dagliga uppdrag och streaks</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-brand-teal" />
                                    <span>Globala och interna topplistor</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-brand-teal" />
                                    <span>Unik avatar-anpassning</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-brand-teal" />
                                    <span>XP, nivåer och märken</span>
                                </li>
                            </ul>
                        </div>

                        {/* Gamification Card Preview */}
                        <div className="relative py-10">
                            <div className="glass-card rounded-2xl p-6 glow-teal max-w-sm ml-auto relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 rounded-full brand-gradient border-2 border-white/20"></div>
                                        <div>
                                            <p className="font-bold">Mikael K.</p>
                                            <p className="text-xs text-slate-400">Level 24 Explorer</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Flame className="w-6 h-6 text-brand-orange mx-auto" />
                                        <p className="text-xs font-bold text-brand-orange">12 DAGAR STREAK</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-300">
                                            <span>PROGRESS XP</span>
                                            <span>1,240 / 2,000</span>
                                        </div>
                                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full brand-gradient rounded-full shadow-[0_0_15px_rgba(0,212,170,0.4)]" style={{ width: '62%' }}></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex flex-col items-center gap-2">
                                            <Trophy className="w-5 h-5 text-brand-gold" />
                                            <span className="text-[10px] font-bold">BÄSTA ELEV</span>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex flex-col items-center gap-2">
                                            <Brain className="w-5 h-5 text-brand-blue" />
                                            <span className="text-[10px] font-bold">SNABBTÄNKT</span>
                                        </div>
                                        <div className="bg-white/10 p-3 rounded-lg border border-brand-teal/40 flex flex-col items-center gap-2">
                                            <Award className="w-5 h-5 text-brand-teal" />
                                            <span className="text-[10px] font-bold">TOPP 1%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-10 glass-card rounded-2xl p-6 w-full max-w-xs opacity-40 translate-x-12 translate-y-12 -z-10"></div>
                        </div>
                    </div>
                </section>

                {/* --- SWEDISH INTEGRATION --- */}
                <section className="py-16 lg:py-24 border-t border-white/10 fade-in-section">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="glass-card rounded-3xl p-4 aspect-[4/3] flex items-center justify-center relative overflow-hidden">
                                <img
                                    src={eduflexConnectImg}
                                    alt="EduFlex Connect"
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#06141b]/80 via-transparent to-transparent rounded-2xl" />
                                <div className="absolute bottom-6 right-6">
                                    <div className="glass-card p-4 rounded-xl border-brand-teal/30 border bg-[#06141b]/80">
                                        <div className="flex items-center gap-2 text-brand-teal font-bold mb-1">
                                            <Database className="w-4 h-4" /> Skolverket Sync
                                        </div>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Status: Realtid aktiv</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-6">
                            <div className="size-12 bg-brand-teal/20 rounded-xl flex items-center justify-center">
                                <Map className="w-6 h-6 text-brand-teal" />
                            </div>
                            <h2 className="text-3xl font-bold">Sömlös integration med Svenska skolsystemet</h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Vi har byggt EduFlex med fokus på den svenska läroplanen. Full integration med Skolverkets API:er och stöd för BankID gör oss till det självklara valet för svenska kommuner och friskolor.
                            </p>
                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div>
                                    <p className="text-3xl font-black text-white">100%</p>
                                    <p className="text-sm text-slate-400">GDPR Compliance</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-white">Byggd för</p>
                                    <p className="text-sm text-slate-400">Framtidens utbildare</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- HIGHLIGHTS / TECH SHOWCASE --- */}
                <section id="highlights" className="py-16 lg:py-24 fade-in-section">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                            <Zap className="w-4 h-4 text-purple-400 mr-2" />
                            <span className="text-sm font-semibold text-purple-400">Tekniska Höjdpunkter</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                            Byggd med Modern Teknologi
                        </h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            React 19, Spring Boot 3.4, PostgreSQL 15 och en komplett DevOps-stack för enterprise-klass prestanda
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-animation fade-in-section">
                        {highlights.map((item, idx) => (
                            <div
                                key={idx}
                                className="glass-card p-6 rounded-2xl group hover:border-white/20 transition-all duration-300 feature-card"
                            >
                                <div className={`size-12 ${item.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <span className={item.color}>{item.icon}</span>
                                </div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-brand-teal transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Tech Stack Banner */}
                    <div className="mt-16 glass-card rounded-2xl p-8 md:p-12 fade-in-section">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">Full Technology Stack</h3>
                            <p className="text-slate-400">Enterprise-grade open source teknologier</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 stagger-animation fade-in-section">
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
                </section>

                {/* --- CTA SECTION --- */}
                <section className="py-16 lg:py-24 fade-in-section">
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
                            <span className="text-xl font-bold">EduFlex <span className="text-brand-teal">2.0</span></span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('landing.footer.tagline')}
                        </p>
                        <div className="flex gap-4">
                            <a className="text-slate-500 hover:text-brand-teal transition-colors" href="#">
                                <svg className="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                            </a>
                            <a className="text-slate-500 hover:text-brand-teal transition-colors" href="#">
                                <svg className="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                            </a>
                        </div>
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
