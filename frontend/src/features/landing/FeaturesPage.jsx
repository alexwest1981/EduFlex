import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    BookOpen, Trophy, Shield, Users,
    Globe, Database, Server, Zap, BarChart,
    Check, ArrowRight, Menu, X, Play, Sparkles,
    Award, TrendingUp, Layers, Gamepad2, Brain, Map, Flame, MessageSquare,
    FileText, ClipboardList, Thermometer, Target, ArrowLeft
} from 'lucide-react';

import adminDashboardImg from '../../assets/screenshots/admin_dashboard.png';
import teacherDashboardImg from '../../assets/screenshots/teacher_dashboard.png';
import aiQuizImg from '../../assets/screenshots/AIQuizGenerator.png';
import analyticsNewImg from '../../assets/screenshots/Analytics.png';
import catalogNewImg from '../../assets/screenshots/Kurskatalog.png';
import libraryImg from '../../assets/screenshots/Library.png';
import debugImg from '../../assets/screenshots/LiveDebugTerminal.png';
import resourceImg from '../../assets/screenshots/Resursbank.png';
import settingsNewImg from '../../assets/screenshots/SystemSettings.png';
import logoMain from '../../assets/images/Logo_top.png';

import ScreenshotSlider from '../../components/landing/ScreenshotSlider';

const FeaturesPage = () => {
    const navigate = useNavigate();
    const { hash } = useLocation();
    const { t } = useTranslation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [hash]);

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
            title: "Säker Elevhälsa",
            description: "Rollbaserad åtkomstkontroll och krypterade journaler för maximal sekretess och trygghet.",
            icon: <Shield className="text-emerald-500" />,
            tag: "v2.0.18"
        },
        {
            title: "Prediktiv AI-Analys 2.0",
            description: "Identifierar elever i riskzonen innan de själva vet det. Deep learning mönsteranalys av närvaro, aktivitet och resultat.",
            icon: <Brain className="text-pink-500" />,
            tag: "Live v2.0.18"
        },
        {
            title: "Skolverket Sync 2.0",
            description: "Sömlös integration med hela Skolverkets kurskatalog. Automatiserad uppdatering av kursmål och betygskriterier.",
            icon: <Target className="text-indigo-500" />,
            tag: "v2.0.18"
        },
        {
            title: "Native PWA Experience",
            description: "Installera EduFlex direkt på hemskärmen. Fullt stöd för offline-åtkomst och blixtsnabb respons på alla enheter.",
            icon: <Smartphone className="text-blue-500" />,
            tag: "NYHET v2.0.18"
        },
        {
            title: "Gamification Expansion",
            description: "Nya Quest-system, Social-hub och utökad Shop. Öka engagemanget genom meningsfullt spelifierat lärande.",
            icon: <Trophy className="text-orange-500" />,
            tag: "Stable"
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
            {/* Custom Styles Reuse */}
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
                .brand-gradient {
                    background: linear-gradient(135deg, var(--brand-teal), var(--brand-emerald), var(--brand-blue));
                }
            `}</style>

            {/* Header / Nav */}
            <header className="sticky top-0 z-50 px-4 sm:px-6 py-4 flex items-center justify-center">
                <nav className={`max-w-7xl w-full glass-card rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? 'shadow-lg shadow-black/20' : ''}`}>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="size-10 brand-gradient rounded-full flex items-center justify-center shadow-lg shadow-brand-teal/20 relative">
                            <img src={logoMain} alt="EduFlex" className="w-6 h-6 brightness-0 invert" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">EduFlex <span className="text-brand-teal">2.0</span></span>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} /> Tillbaka
                    </button>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-24">

                {/* Intro */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-sm font-bold mb-4">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Allt du behöver för modern utbildning
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black">Fullmatad med funktioner</h1>
                    <p className="text-slate-400 text-lg">
                        Från AI-driven analys till gamification och administration. Här hittar du allt som gör EduFlex unikt.
                    </p>
                </div>

                {/* Core Features */}
                <section id="gamification" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <div key={idx} className={`glass-card p-8 rounded-3xl group ${feature.hoverBorder} transition-all duration-300`}>
                            <div className={`size-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                                <span className={feature.color}>{feature.icon}</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </section>

                {/* Detailed Highlights Grid */}
                <section id="highlights">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <Zap className="text-brand-gold" /> Teknologiska Höjdpunkter
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {highlights.map((item, idx) => (
                            <div key={idx} className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors">
                                <div className={`w-10 h-10 ${item.bgColor || 'bg-white/10'} rounded-lg flex items-center justify-center mb-4`}>
                                    <span className={item.color || 'text-white'}>{item.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-400">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Screenshot Showcase */}
                <section id="showcase">
                    <h2 className="text-3xl font-bold mb-8 text-center">Systemöversikt</h2>
                    <ScreenshotSlider screenshots={screenshotData} />
                </section>

                {/* CTA */}
                <div className="text-center py-12">
                    <h2 className="text-3xl font-bold mb-6">Redo att komma igång?</h2>
                    <button
                        onClick={() => navigate('/register-org')}
                        className="brand-gradient text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform text-lg shadow-xl shadow-brand-teal/30"
                    >
                        Skapa ditt konto nu <ArrowRight className="inline w-5 h-5 ml-2" />
                    </button>
                </div>

            </main>
        </div>
    );
};

export default FeaturesPage;
