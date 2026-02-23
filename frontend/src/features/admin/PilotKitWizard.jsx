import React, { useState, useEffect } from 'react';
import {
    ChevronRight, ChevronLeft, Rocket, Globe, Palette,
    Cpu, CheckCircle, Upload, Layout, Zap,
    Shield, ArrowRight, Star, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';
import { useDesignSystem, DESIGN_SYSTEMS } from '../../context/DesignSystemContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const PilotKitWizard = ({ onComplete }) => {
    const { branding, updateBranding } = useBranding();
    const { designSystem, setDesignSystem } = useDesignSystem();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Identity
    const [siteTitle, setSiteTitle] = useState(branding?.siteName || 'EduFlex LMS');
    const [logoPreview, setLogoPreview] = useState(branding?.logoUrl || null);

    // Step 3: AI
    const [aiSettings, setAiSettings] = useState({
        enableTutor: true,
        enableQuiz: true,
        enableIndexing: true,
        baseCredits: 1000
    });

    const steps = [
        { id: 1, title: 'Identitet', icon: <Globe className="w-5 h-5" />, desc: 'Sätt er prägel på er nya portal.' },
        { id: 2, title: 'Estetik', icon: <Palette className="w-5 h-5" />, desc: 'Välj ett visuellt tema som passar er.' },
        { id: 3, title: 'AI-kraft', icon: <Cpu className="w-5 h-5" />, desc: 'Konfigurera framtidens lärande.' },
        { id: 4, title: 'Slutför', icon: <Rocket className="w-5 h-5" />, desc: 'Redo att lyfta!' }
    ];

    const handleNext = () => setStep(s => Math.min(s + 1, 4));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            // Reusing branding API logic
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'logo');

            const response = await api.storage.uploadPublic(file, 'branding/logo');
            setLogoPreview(response.url);
            toast.success("Logotyp uppladdad!");
        } catch (error) {
            toast.error("Kunde inte ladda upp logotyp");
        } finally {
            setLoading(false);
        }
    };

    const finishOnboarding = async () => {
        setLoading(true);
        try {
            // 1. Update Branding
            await updateBranding({
                siteName: siteTitle,
                logoUrl: logoPreview,
                designSystem: designSystem
            });

            // 2. Update System Settings (AI toggles, etc.)
            // Assuming we have a global settings API
            await api.admin.updateSystemSettings({
                aiFeatures: aiSettings
            });

            toast.success("Pilot Kit slutfört! Välkommen till EduFlex 2.0");
            if (onComplete) onComplete();
        } catch (error) {
            toast.error("Något gick fel vid sparning");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
            {/* Header / Progress */}
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-teal to-brand-blue rounded-2xl flex items-center justify-center shadow-lg shadow-brand-teal/20">
                        <Rocket className="w-7 h-7 text-slate-900" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">Pilot Kit <span className="text-brand-teal">Onboarding</span></h2>
                        <p className="text-slate-400 font-bold text-sm">Konfigurera din portal på några minuter</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {steps.map(s => (
                        <div key={s.id} className={`w-3 h-3 rounded-full transition-all duration-500 ${step >= s.id ? 'bg-brand-teal scale-125 shadow-[0_0_10px_rgba(0,212,170,0.5)]' : 'bg-slate-700'}`}></div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-12 min-h-[500px]">
                {step === 1 && (
                    <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black text-white">Vad ska portalen heta?</h3>
                            <p className="text-slate-400 font-medium">Detta syns i webbläsarens flik och i sidhuvudet.</p>
                            <input
                                type="text"
                                value={siteTitle}
                                onChange={(e) => setSiteTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xl font-bold focus:ring-4 focus:ring-brand-teal/20 outline-none transition-all"
                                placeholder="t.ex. Gränsskolans Portal"
                            />
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-3xl font-black text-white">Logotyp</h3>
                            <div className="flex items-center gap-8 p-8 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                                <div className="w-32 h-32 bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border border-white/5">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <ImageIcon className="w-10 h-10 text-slate-600" />
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <p className="text-slate-400 font-bold text-sm">Ladda upp en SVG eller PNG (max 2MB).</p>
                                    <label className="inline-flex items-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-sm cursor-pointer hover:bg-brand-teal transition-colors">
                                        <Upload className="w-4 h-4" /> Välj fil
                                        <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <h3 className="text-3xl font-black text-white">Välj ett Tema</h3>
                        <div className="grid grid-cols-2 gap-5">
                            {Object.values(DESIGN_SYSTEMS).filter(t => ['midnight', 'glassmorphism', 'focus', 'nebula'].includes(t.id)).map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setDesignSystem(theme.id)}
                                    className={`p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${designSystem === theme.id ? 'border-brand-teal bg-brand-teal/10' : 'border-white/5 bg-white/5 hover:border-white/20'
                                        }`}
                                >
                                    {designSystem === theme.id && <div className="absolute top-4 right-4 text-brand-teal"><CheckCircle className="w-6 h-6" /></div>}
                                    <div className="space-y-3">
                                        <h4 className="text-xl font-black text-white">{theme.name}</h4>
                                        <p className="text-slate-400 font-bold text-xs">{theme.description}</p>
                                        <div className="flex gap-2 pt-2">
                                            <div className="w-6 h-6 rounded-full bg-brand-teal"></div>
                                            <div className="w-6 h-6 rounded-full bg-brand-blue"></div>
                                            <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                        <h3 className="text-3xl font-black text-white">Konfigurera AI-kraft</h3>

                        <div className="space-y-4">
                            {[
                                { id: 'enableTutor', label: 'AI Tutor (Stöd till elever)', icon: <Sparkles className="w-5 h-5 text-brand-blue" /> },
                                { id: 'enableQuiz', label: 'AI Quiz Generator (Stöd till lärare)', icon: <Layout className="w-5 h-5 text-brand-teal" /> },
                                { id: 'enableIndexing', label: 'AI Indexering (RAG-stöd)', icon: <Zap className="w-5 h-5 text-brand-gold" /> }
                            ].map(feat => (
                                <div key={feat.id} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-800 rounded-xl">{feat.icon}</div>
                                        <span className="text-white font-black">{feat.label}</span>
                                    </div>
                                    <button
                                        onClick={() => setAiSettings({ ...aiSettings, [feat.id]: !aiSettings[feat.id] })}
                                        className={`w-14 h-8 rounded-full p-1 transition-all ${aiSettings[feat.id] ? 'bg-brand-teal' : 'bg-slate-700'}`}
                                    >
                                        <div className={`w-6 h-6 bg-white rounded-full transition-all ${aiSettings[feat.id] ? 'translate-x-6' : ''}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-slate-800/40 rounded-[2rem] border border-white/10 flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-white font-black text-lg">Start-krediter</h4>
                                <p className="text-slate-400 font-bold text-xs">Antal AI-anrop per PRO-användare vid start.</p>
                            </div>
                            <div className="text-3xl font-black text-brand-teal">1 000</div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="text-center space-y-8 py-10 animate-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-brand-teal/20 mx-auto rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-brand-teal" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-5xl font-black text-white">Allt är klart!</h3>
                            <p className="text-xl text-slate-400 font-medium max-w-sm mx-auto">Vi har förberett din portal enligt dina önskemål. Nu är det dags att börja skapa!</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-10">
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                <span className="text-slate-400 font-bold">Webbplats</span>
                                <span className="text-white font-black">{siteTitle}</span>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                <span className="text-slate-400 font-bold">Valt Tema</span>
                                <span className="text-brand-teal font-black uppercase text-xs tracking-widest">{designSystem}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Navigation */}
            <div className="p-10 border-t border-white/5 flex items-center justify-between bg-slate-900/40">
                <button
                    onClick={handleBack}
                    disabled={step === 1 || loading}
                    className="flex items-center gap-2 px-6 py-3 text-slate-400 font-black hover:text-white transition-colors disabled:opacity-0"
                >
                    <ChevronLeft className="w-5 h-5" /> Föregående
                </button>

                {step < 4 ? (
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-3 px-10 py-4 bg-white text-slate-950 rounded-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Nästa steg <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={finishOnboarding}
                        disabled={loading}
                        className="flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-brand-teal to-brand-emerald text-slate-950 rounded-2xl font-black shadow-2xl shadow-brand-teal/30 hover:scale-105 active:scale-95 transition-all group"
                    >
                        {loading ? 'Sparar...' : 'Starta min portal'}
                        <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default PilotKitWizard;
