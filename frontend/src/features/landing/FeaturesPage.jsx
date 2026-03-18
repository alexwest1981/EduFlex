import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    BookOpen, Trophy, Shield, Users,
    Globe, Database, Server, Zap, BarChart,
    Check, ArrowRight, Menu, X, Play, Sparkles,
    Award, TrendingUp, Layers, Gamepad2, Brain, Map, Flame, MessageSquare,
    FileText, ClipboardList, Thermometer, Target, ArrowLeft, Smartphone
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
            title: t('landing.features_page.highlights.ai_creator.title'),
            description: t('landing.features_page.highlights.ai_creator.desc'),
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10'
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: t('landing.features_page.highlights.predictive.title'),
            description: t('landing.features_page.highlights.predictive.desc'),
            color: 'text-rose-400',
            bgColor: 'bg-rose-500/10'
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: t('landing.features_page.highlights.lti.title'),
            description: t('landing.features_page.highlights.lti.desc'),
            color: 'text-brand-blue',
            bgColor: 'bg-brand-blue/10'
        },
        {
            icon: <Database className="w-6 h-6" />,
            title: t('landing.features_page.highlights.xapi.title'),
            description: t('landing.features_page.highlights.xapi.desc'),
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10'
        },
        {
            icon: <Server className="w-6 h-6" />,
            title: t('landing.features_page.highlights.minio.title'),
            description: t('landing.features_page.highlights.minio.desc'),
            color: 'text-pink-400',
            bgColor: 'bg-pink-500/10'
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            title: t('landing.features_page.highlights.edugame.title'),
            description: t('landing.features_page.highlights.edugame.desc'),
            color: 'text-brand-gold',
            bgColor: 'bg-brand-gold/10'
        },
        {
            icon: <Database className="w-6 h-6" />,
            title: t('landing.features_page.highlights.schema.title'),
            description: t('landing.features_page.highlights.schema.desc'),
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10'
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: t('landing.features_page.highlights.resource.title'),
            description: t('landing.features_page.highlights.resource.desc'),
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: t('landing.features_page.highlights.cascading.title'),
            description: t('landing.features_page.highlights.cascading.desc'),
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: t('landing.features_page.highlights.sso.title'),
            description: t('landing.features_page.highlights.sso.desc'),
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: t('landing.features_page.highlights.slugs.title'),
            description: t('landing.features_page.highlights.slugs.desc'),
            color: 'text-sky-400',
            bgColor: 'bg-sky-500/10'
        },
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: t('landing.features_page.highlights.quiz_gen.title'),
            description: t('landing.features_page.highlights.quiz_gen.desc'),
            color: 'text-fuchsia-400',
            bgColor: 'bg-fuchsia-500/10'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: t('landing.features_page.highlights.security.title'),
            description: t('landing.features_page.highlights.security.desc'),
            color: 'text-indigo-400',
            bgColor: 'bg-indigo-500/10'
        },
        {
            icon: <BarChart className="w-6 h-6" />,
            title: t('landing.features_page.highlights.insights.title'),
            description: t('landing.features_page.highlights.insights.desc'),
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10'
        },
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: t('landing.features_page.highlights.social.title'),
            description: t('landing.features_page.highlights.social.desc'),
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10'
        },
        {
            icon: <Flame className="w-6 h-6" />,
            title: t('landing.features_page.highlights.streaks.title'),
            description: t('landing.features_page.highlights.streaks.desc'),
            color: 'text-brand-orange',
            bgColor: 'bg-brand-orange/10'
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: t('landing.features_page.highlights.mission_control.title'),
            description: t('landing.features_page.highlights.mission_control.desc'),
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10'
        },
        {
            title: t('landing.features_page.highlights.health.title'),
            description: t('landing.features_page.highlights.health.desc'),
            icon: <Shield className="text-emerald-500" />,
            tag: "v2.0.18"
        },
        {
            title: t('landing.features_page.highlights.ai_analysis.title'),
            description: t('landing.features_page.highlights.ai_analysis.desc'),
            icon: <Brain className="text-pink-500" />,
            tag: "Live v2.0.18"
        },
        {
            title: t('landing.features_page.highlights.skolverket.title'),
            description: t('landing.features_page.highlights.skolverket.desc'),
            icon: <Target className="text-indigo-500" />,
            tag: "v2.0.18"
        },
        {
            title: t('landing.features_page.highlights.pwa.title'),
            description: t('landing.features_page.highlights.pwa.desc'),
            icon: <Smartphone className="text-blue-500" />,
            tag: "NYHET v2.0.18"
        },
        {
            title: t('landing.features_page.highlights.gamification_expansion.title'),
            description: t('landing.features_page.highlights.gamification_expansion.desc'),
            icon: <Trophy className="text-orange-500" />,
            tag: "Stable"
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            title: t('landing.features_page.highlights.gamification_expansion.title'),
            description: t('landing.features_page.highlights.gamification_expansion.desc'),
            color: 'text-brand-gold',
            bgColor: 'bg-brand-gold/10'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: t('landing.features_page.highlights.guardian.title'),
            description: t('landing.features_page.highlights.guardian.desc'),
            color: 'text-brand-teal',
            bgColor: 'bg-brand-teal/10'
        },
        {
            icon: <Brain className="w-6 h-6" />,
            title: t('landing.features_page.highlights.ai_center.title'),
            description: t('landing.features_page.highlights.ai_center.desc'),
            color: 'text-brand-orange',
            bgColor: 'bg-brand-orange/10'
        }
    ];

    const screenshotData = [
        { src: adminDashboardImg, title: t('landing.screenshots.admin.title'), description: t('landing.screenshots.admin.desc') },
        { src: teacherDashboardImg, title: t('landing.screenshots.teacher.title'), description: t('landing.screenshots.teacher.desc') },
        { src: aiQuizImg, title: t('landing.screenshots.quiz.title'), description: t('landing.screenshots.quiz.desc') },
        { src: libraryImg, title: t('landing.screenshots.library.title'), description: t('landing.screenshots.library.desc') },
        { src: catalogNewImg, title: t('landing.screenshots.catalog.title'), description: t('landing.screenshots.catalog.desc') },
        { src: resourceImg, title: t('landing.screenshots.resource.title'), description: t('landing.screenshots.resource.desc') },
        { src: analyticsNewImg, title: t('landing.screenshots.analytics.title'), description: t('landing.screenshots.analytics.desc') },
        { src: settingsNewImg, title: t('landing.screenshots.settings.title'), description: t('landing.screenshots.settings.desc') },
        { src: debugImg, title: t('landing.screenshots.terminal.title'), description: t('landing.screenshots.terminal.desc') }
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
                        <ArrowLeft size={18} /> {t('landing.features_page.back')}
                    </button>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-24">

                {/* Intro */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-sm font-bold mb-4">
                        <Sparkles className="w-4 h-4 mr-2" />
                        {t('landing.features_page.intro_badge')}
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black">{t('landing.features_page.title')}</h1>
                    <p className="text-slate-400 text-lg">
                        {t('landing.features_page.subtitle')}
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
                        <Zap className="text-brand-gold" /> {t('landing.features_page.highlights_title')}
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
                    <h2 className="text-3xl font-bold mb-8 text-center">{t('landing.features_page.showcase_title')}</h2>
                    <ScreenshotSlider screenshots={screenshotData} />
                </section>

                {/* CTA */}
                <div className="text-center py-12">
                    <h2 className="text-3xl font-bold mb-6">{t('landing.features_page.cta_title')}</h2>
                    <button
                        onClick={() => navigate('/register-org')}
                        className="brand-gradient text-white font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform text-lg shadow-xl shadow-brand-teal/30"
                    >
                        {t('landing.features_page.cta_button')} <ArrowRight className="inline w-5 h-5 ml-2" />
                    </button>
                </div>

            </main>
        </div>
    );
};

export default FeaturesPage;
