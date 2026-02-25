import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Shield, Zap, Globe, Users, Star } from 'lucide-react';

const PricingPage = () => {
    const navigate = useNavigate();

    const tiers = [
        {
            name: 'BASIC',
            price: '9',
            description: 'Perfekt för mindre skolor eller föreningar som vill digitalisera sin administration.',
            features: [
                'Fullständigt LMS',
                'Kurs- & Media-verktyg',
                'Elevregister (PII-maskat)',
                'Incident- & Hälsohantering',
                'E-postsupport'
            ],
            color: 'text-slate-400',
            borderColor: 'border-slate-700',
            buttonStyle: 'bg-white/5 hover:bg-white/10 text-white'
        },
        {
            name: 'PRO',
            price: '25',
            popular: true,
            description: 'Den intelligenta nivån för moderna utbildningsanordnare med AI-stöd.',
            features: [
                'Allt i BASIC',
                'AI Tutor (Google Gemini)',
                'AI Quiz Generator',
                'Gamification (XP, Shop, Badges)',
                'LTI 1.3 & Zoom/Teams Integrations',
                'Prioriterad support'
            ],
            color: 'text-brand-teal',
            borderColor: 'border-brand-teal/50',
            buttonStyle: 'bg-brand-teal text-slate-900 font-black'
        },
        {
            name: 'ENTERPRISE',
            price: '49',
            description: 'Fullskalig lösning för koncerner och myndigheter med höga krav på kontroll.',
            features: [
                'Allt i PRO',
                'Full Whitelabeling (Egen domän)',
                'Produktionsklar Kubernetes Ops',
                'Dedikerad Success Manager',
                'SLA: 99.9% Drifttid',
                'Anpassad API-utveckling'
            ],
            color: 'text-brand-gold',
            borderColor: 'border-brand-gold/50',
            buttonStyle: 'bg-brand-gold text-slate-900 font-black'
        }
    ];

    return (
        <div className="min-h-screen bg-[#06141b] text-slate-100 font-display selection:bg-brand-teal/30">
            {/* Nav Back */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Tillbaka till start
                </button>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
                <div className="text-center space-y-4 mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-xs font-bold uppercase tracking-wider">
                        <Zap className="w-3 h-3" /> Transparens
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tight">Enkel & Rättvis <span className="text-gradient">Prissättning</span></h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">Välj den nivå som passar er organisation bäst. Inga dolda avgifter, bara ren pedagogisk kraft.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {tiers.map((tier, idx) => (
                        <div
                            key={idx}
                            className={`glass-card p-8 rounded-3xl border ${tier.borderColor} flex flex-col relative group transition-all duration-500 hover:scale-[1.02]`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-teal text-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-brand-teal/20">
                                    Mest Populär
                                </div>
                            )}

                            <div className="space-y-2 mb-8">
                                <h3 className={`text-xl font-black tracking-widest ${tier.color}`}>{tier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white">{tier.price}</span>
                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">SEK / elev / mån</span>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed">{tier.description}</p>
                            </div>

                            <div className="space-y-4 flex-grow mb-10">
                                {tier.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-start gap-3">
                                        <div className={`mt-1 size-5 rounded-full flex items-center justify-center shrink-0 ${tier.popular ? 'bg-brand-teal/20 text-brand-teal' : 'bg-slate-800 text-slate-400'}`}>
                                            <Check className="w-3 h-3" strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate('/register-org')}
                                className={`w-full py-4 rounded-xl text-sm uppercase tracking-widest transition-all shadow-xl ${tier.buttonStyle}`}
                            >
                                Kom igång med {tier.name}
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQ/SLA Snippet */}
                <div className="mt-24 grid md:grid-cols-3 gap-12 border-t border-white/5 pt-16">
                    <div className="space-y-4">
                        <div className="size-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold">GDPR & Säkerhet</h4>
                        <p className="text-sm text-slate-500">All data lagras inom EU (Sverige/Tyskland). Vi följer de strängaste kraven för PII-maskning och integritet genom design.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="size-10 bg-brand-teal/10 rounded-xl flex items-center justify-center text-brand-teal">
                            <Globe className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold">Hög Tillgänglighet</h4>
                        <p className="text-sm text-slate-500">Vår Kubernetes-arkitektur garanterar 99.9% drifttid för Enterprise. Systemet skalar automatiskt efter antalet användare.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="size-10 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold">
                            <Users className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold">Personlig Onboarding</h4>
                        <p className="text-sm text-slate-500">Vi hjälper er med SIS-integration, LTI-uppsättning och lärarutbildning för att säkerställa en lyckad pilotiperiod.</p>
                    </div>
                </div>

                {/* Final Call to Action */}
                <div className="mt-24 bg-gradient-to-br from-brand-teal/20 to-brand-blue/20 rounded-3xl p-12 text-center border border-white/10">
                    <h2 className="text-3xl font-black mb-4">Behöver ni ett skräddarsytt upplägg?</h2>
                    <p className="text-slate-400 mb-8 max-w-xl mx-auto text-lg">För större koncerner eller specifika pedagogiska behov erbjuder vi skräddarsydda ENTERPRISE-paket.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="bg-white text-slate-900 font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform flex items-center gap-2">
                            Boka en priskalkyl <ArrowRight className="w-4 h-4" />
                        </button>
                        <a
                            href="/pilot-kit/whitepaper_eduflex_vs_canvas.md"
                            target="_blank"
                            className="bg-white/5 border border-white/10 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
                        >
                            Ladda ner Pilot Kit (PDF)
                        </a>
                    </div>
                </div>
            </main>

            <style>{`
                .text-gradient {
                    background: linear-gradient(to right, #00d4aa, #0ea5e9);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                .font-display {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }
            `}</style>
        </div>
    );
};

export default PricingPage;
