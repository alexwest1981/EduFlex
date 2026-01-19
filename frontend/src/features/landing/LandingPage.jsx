import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    School, BookOpen, Trophy, Shield, Users,
    Globe, Database, Server, Zap, BarChart,
    MessageCircle, Calendar, Check, ArrowRight, Languages
} from 'lucide-react';

// Assets
import heroImage from '../../assets/images/hero_boy_1.jpg';
import logoMain from '../../assets/images/Logo_top.png';

// Components
import ContactModal from '../../components/ContactModal';

const LandingPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const features = [
        {
            icon: <BookOpen className="w-6 h-6 text-blue-600" />,
            title: t('landing.features.core_education.title'),
            description: t('landing.features.core_education.desc')
        },
        {
            icon: <Trophy className="w-6 h-6 text-yellow-500" />,
            title: t('landing.features.gamification.title'),
            description: t('landing.features.gamification.desc')
        },
        {
            icon: <Database className="w-6 h-6 text-purple-600" />,
            title: t('landing.features.multi_tenancy.title'),
            description: t('landing.features.multi_tenancy.desc')
        },
        {
            icon: <Shield className="w-6 h-6 text-green-600" />,
            title: t('landing.features.security.title'),
            description: t('landing.features.security.desc')
        },
        {
            icon: <BarChart className="w-6 h-6 text-indigo-600" />,
            title: t('landing.features.analytics.title'),
            description: t('landing.features.analytics.desc')
        },
        {
            icon: <Globe className="w-6 h-6 text-cyan-600" />,
            title: t('landing.features.skolverket.title'),
            description: t('landing.features.skolverket.desc')
        }
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img src={logoMain} alt="EduFlex Logo" className="h-10 w-auto" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            EduFlex LMS
                        </span>
                    </div>
                    <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
                        <a href="#features" className="hover:text-blue-600 transition">{t('landing.nav.features')}</a>
                        <a href="#architecture" className="hover:text-blue-600 transition">{t('landing.nav.architecture')}</a>
                        <a href="#pricing" className="hover:text-blue-600 transition">{t('landing.nav.pricing')}</a>
                    </div>
                    <div className="flex space-x-4 items-center">
                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg border border-gray-200">
                            <button
                                onClick={() => i18n.changeLanguage('sv')}
                                className={`px-3 py-1.5 text-xs font-bold rounded transition-all duration-300 hover:scale-105 ${i18n.language === 'sv'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                title="Svenska"
                            >
                                SV
                            </button>
                            <button
                                onClick={() => i18n.changeLanguage('en')}
                                className={`px-3 py-1.5 text-xs font-bold rounded transition-all duration-300 hover:scale-105 ${i18n.language === 'en'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                title="English"
                            >
                                EN
                            </button>
                        </div>
                        <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                            {t('landing.nav.login')}
                        </button>
                        <button onClick={() => navigate('/register-org')} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                            {t('landing.nav.get_started')}
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-92 h-92 bg-blue-50 rounded-full blur-3xl opacity-50 z-0"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-92 h-92 bg-indigo-50 rounded-full blur-3xl opacity-50 z-0"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center">
                    <div className="lg:w-1/2 lg:pr-12 text-center lg:text-left">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide uppercase mb-6">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                            {t('landing.hero.badge')}
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                            {t('landing.hero.title_start')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{t('landing.hero.title_highlight')}</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            {t('landing.hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
                            <button onClick={() => setIsContactModalOpen(true)} className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 flex items-center justify-center">
                                {t('landing.hero.cta_trial')} <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                            <button onClick={() => window.open('http://localhost:8080/swagger-ui.html', '_blank')} className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-bold text-lg hover:border-gray-400 transition flex items-center justify-center">
                                {t('landing.hero.cta_docs')}
                            </button>
                        </div>
                        <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6">
                            <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" className="h-6" />
                            <img src="https://img.shields.io/badge/Spring%20Boot-3.4-brightgreen?style=flat-square&logo=springboot" alt="Spring" className="h-6" />
                            <img src="https://img.shields.io/badge/Docker-SaaS-blue?style=flat-square&logo=docker&logoColor=white" alt="Docker" className="h-6" />
                        </div>
                    </div>
                    <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
                        <div className="relative w-full max-w-2xl mx-auto animate-float">
                            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                            <img src={heroImage} alt="EduFlex Student" className="relative rounded-[2.5rem] shadow-2xl ring-1 ring-gray-900/10 w-full object-cover transform hover:scale-[1.02] transition duration-500 ease-in-out" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section id="features" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-sm font-semibold text-blue-600 tracking-wide uppercase">{t('landing.features.badge')}</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            {t('landing.features.title')}
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            {t('landing.features.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition duration-300 border border-gray-100">
                                <div className="p-3 bg-gray-50 rounded-lg inline-block mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- ARCHITECTURE --- */}
            <section id="architecture" className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center mb-16">
                        <h2 className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">{t('landing.architecture.badge')}</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            {t('landing.architecture.title')}
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                    </div>

                    <div className="mt-16 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="p-12 flex flex-col justify-center">
                                <h3 className="text-2xl font-bold text-white mb-6">{t('landing.architecture.powered_by')}</h3>
                                <ul className="space-y-4">
                                    {t('landing.architecture.items', { returnObjects: true }).map((item, i) => (
                                        <li key={i} className="flex items-center text-gray-300">
                                            <Check className="w-5 h-5 text-green-400 mr-3" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-gray-800 p-8 flex items-center justify-center border-l border-gray-700">
                                <div className="text-gray-400 text-sm font-mono">
                                    <div className="mb-4">
                                        <span className="text-blue-400">graph</span> TD
                                    </div>
                                    <div className="pl-4">
                                        User --{'>'} Frontend<br />
                                        Frontend --{'>'} <span className="text-green-400">API Gateway</span><br />
                                        <span className="text-green-400">API Gateway</span> --{'>'} Auth[Keycloak]<br />
                                        <span className="text-green-400">API Gateway</span> --{'>'} Service[Backend]<br />
                                        Service --{'>'} DB[(PostgreSQL)]<br />
                                        Service --{'>'} Cache[(Redis)]
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRICING --- */}
            <section id="pricing" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{t('landing.pricing.title')}</h2>
                        <p className="mt-4 text-xl text-gray-500">{t('landing.pricing.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {['basic', 'pro', 'enterprise'].map((plan, idx) => {
                            const isHighlight = plan === 'pro';
                            return (
                                <div key={idx} className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col ${isHighlight ? 'border-blue-600 shadow-xl scale-105 z-10' : 'border-gray-200'}`}>
                                    {isHighlight && (
                                        <div className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                                            {t('landing.pricing.pro.badge')}
                                        </div>
                                    )}
                                    <h3 className="text-lg font-semibold text-gray-900">{t(`landing.pricing.${plan}.name`)}</h3>
                                    <p className="mt-4 text-4xl font-extrabold text-gray-900">{t(`landing.pricing.${plan}.price`)}</p>
                                    <ul className="mt-6 space-y-4 flex-1">
                                        {t(`landing.pricing.${plan}.features`, { returnObjects: true }).map((feat, i) => (
                                            <li key={i} className="flex">
                                                <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                                                <span className="ml-3 text-gray-500">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button className={`mt-8 w-full py-3 px-4 rounded-lg font-bold transition ${isHighlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                                        {t(`landing.pricing.${plan}.cta`)}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-white border-t border-gray-200 pt-16 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <img src={logoMain} alt="EduFlex" className="h-8 mb-4" />
                            <p className="text-gray-500 text-sm">
                                {t('landing.footer.tagline')}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">{t('landing.footer.product')}</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-blue-600">{t('landing.footer.features')}</a></li>
                                <li><a href="#" className="hover:text-blue-600">{t('landing.footer.pricing')}</a></li>
                                <li><a href="#" className="hover:text-blue-600">{t('landing.footer.roadmap')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">{t('landing.footer.resources')}</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-blue-600">{t('landing.footer.documentation')}</a></li>
                                <li><a href="#" className="hover:text-blue-600">{t('landing.footer.api_reference')}</a></li>
                                <li><a href="#" className="hover:text-blue-600">{t('landing.footer.system_status')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">{t('landing.footer.connect')}</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-blue-600">{t('landing.footer.contact_sales')}</a></li>
                                <li><a href="#" className="hover:text-blue-600">{t('landing.footer.twitter')}</a></li>
                                <li><a href="#" className="hover:text-blue-600">{t('landing.footer.github')}</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">{t('landing.footer.copyright')}</p>
                        <div className="flex items-center space-x-2 mt-4 md:mt-0">
                            <span className="text-gray-400 text-sm">{t('landing.footer.developed_by')}</span>
                            <span className="text-gray-800 font-bold text-sm">{t('landing.footer.fenrir')}</span>
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
