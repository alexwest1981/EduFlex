import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Users, Clock, Shield, Download, PieChart, ArrowRight } from 'lucide-react';

const TcoCalculator = () => {
    // Basic Inputs
    const [employees, setEmployees] = useState(500);
    const [avgSalary, setAvgSalary] = useState(45000); // Per month
    const [onboardingDays, setOnboardingDays] = useState(10);
    const [attritionRate, setAttritionRate] = useState(15); // Percentage
    const [complianceTrainingHours, setComplianceTrainingHours] = useState(8); // Per employee/year

    // Cost calculations
    const hourlyRate = (avgSalary * 1.4) / 160; // Including overhead (social fees etc)

    const currentOnboardingCost = useMemo(() => {
        return employees * (attritionRate / 100) * onboardingDays * 8 * hourlyRate;
    }, [employees, attritionRate, onboardingDays, hourlyRate]);

    const complianceCost = useMemo(() => {
        return employees * complianceTrainingHours * hourlyRate;
    }, [employees, complianceTrainingHours, hourlyRate]);

    const totalCurrentCost = currentOnboardingCost + complianceCost;

    // EduFlex Potential Savings (Conservative estimates)
    const eduflexSavings = useMemo(() => {
        const onboardingEfficiency = 0.40; // 40% faster with mobile pre-boarding
        const complianceEfficiency = 0.25; // 25% faster with AI-adaptive learning

        const savingOnboarding = currentOnboardingCost * onboardingEfficiency;
        const savingCompliance = complianceCost * complianceEfficiency;

        return {
            onboarding: savingOnboarding,
            compliance: savingCompliance,
            total: savingOnboarding + savingCompliance
        };
    }, [currentOnboardingCost, complianceCost]);

    const ROI = ((eduflexSavings.total / (employees * 15 * 12)) * 100).toFixed(0); // Rough estimate of EduFlex license cost vs savings

    return (
        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] overflow-hidden animate-fade-in shadow-2xl">
            <div className="p-8 border-b border-[var(--border-main)] bg-[var(--bg-card)]">
                <h3 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3">
                    <Calculator className="text-brand-blue" /> TCO & ROI-Kalkylator
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mt-1 font-bold">Interaktivt verktyg för att beräkna affärsvärdet av EduFlex LLP.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Inputs */}
                <div className="p-8 space-y-6 border-r border-[var(--border-main)]">
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-xs font-black uppercase text-[var(--text-secondary)] flex items-center gap-2 mb-2 tracking-widest">
                                <Users size={14} /> Antal anställda
                            </span>
                            <input
                                type="range" min="10" max="5000" step="10"
                                value={employees} onChange={(e) => setEmployees(parseInt(e.target.value))}
                                className="w-full accent-brand-blue h-2 bg-[var(--bg-input)] rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between mt-2 font-black text-lg text-[var(--text-primary)]">
                                <span>{employees} st</span>
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-xs font-black uppercase text-[var(--text-secondary)] flex items-center gap-2 mb-2 tracking-widest">
                                <Clock size={14} /> Onboarding-tid (dagar)
                            </span>
                            <input
                                type="number"
                                value={onboardingDays} onChange={(e) => setOnboardingDays(parseInt(e.target.value))}
                                className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] rounded-xl px-4 py-3 font-black text-[var(--text-primary)] outline-none focus:border-brand-blue transition-colors"
                            />
                        </label>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-xs font-black uppercase text-[var(--text-secondary)] mb-2 block tracking-widest">Personalomsättning (%)</span>
                                <input
                                    type="number"
                                    value={attritionRate} onChange={(e) => setAttritionRate(parseInt(e.target.value))}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] rounded-xl px-4 py-3 font-black text-[var(--text-primary)] outline-none focus:border-brand-blue"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase text-[var(--text-secondary)] mb-2 block tracking-widest">Lön (SEK/mån)</span>
                                <input
                                    type="number"
                                    value={avgSalary} onChange={(e) => setAvgSalary(parseInt(e.target.value))}
                                    className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] rounded-xl px-4 py-3 font-black text-[var(--text-primary)] outline-none focus:border-brand-blue"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="p-4 bg-brand-blue/5 rounded-2xl border border-brand-blue/20">
                        <div className="flex items-start gap-3">
                            <Shield className="text-brand-blue mt-1" size={18} />
                            <div>
                                <h4 className="font-black text-brand-blue text-sm uppercase tracking-wider">EduFlex Effekt</h4>
                                <p className="text-xs text-brand-blue font-bold mt-1">
                                    Vi räknar konservativt med 40% snabbare onboarding via mobilen och 25% effektivare compliance-träning.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="p-8 bg-white/5 flex flex-col justify-between">
                    <div className="space-y-8">
                        <div>
                            <span className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-widest">Uppskattad Årlig Besparing</span>
                            <div className="text-5xl font-black text-emerald-500 mt-1">
                                {new Intl.NumberFormat('sv-SE').format(Math.round(eduflexSavings.total))} kr
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-[var(--border-main)] shadow-sm">
                                <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Onboarding ROI</div>
                                <div className="text-xl font-black text-[var(--text-primary)]">+{new Intl.NumberFormat('sv-SE').format(Math.round(eduflexSavings.onboarding))} kr</div>
                                <div className="text-[10px] text-emerald-500 font-black uppercase mt-1">40% tidsvinst</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-[var(--border-main)] shadow-sm">
                                <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Compliance ROI</div>
                                <div className="text-xl font-black text-[var(--text-primary)]">+{new Intl.NumberFormat('sv-SE').format(Math.round(eduflexSavings.compliance))} kr</div>
                                <div className="text-[10px] text-emerald-500 font-black uppercase mt-1">25% effektivare</div>
                            </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-brand-blue to-blue-700 rounded-3xl text-white shadow-xl shadow-brand-blue/20">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-[10px] font-black uppercase opacity-70 tracking-widest">Beräknad ROI</div>
                                    <div className="text-3xl font-black">{ROI}%</div>
                                </div>
                                <TrendingUp size={32} className="opacity-20" />
                            </div>
                            <div className="text-[10px] mt-4 opacity-70 italic font-bold">
                                * Beräknat på förhållandet mellan licenskostnad och realiserade tidsvinster.
                            </div>
                        </div>
                    </div>

                    <button className="w-full mt-8 bg-white/5 text-[var(--text-primary)] border border-[var(--border-main)] py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                        <Download size={18} />
                        Ladda ner Underlag (PDF)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TcoCalculator;
