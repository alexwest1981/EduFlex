import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText, Upload, Palette, Type, Layout, Save,
    Image as ImageIcon, Eye, ToggleLeft, ToggleRight,
    ChevronDown, QrCode, Loader2, Check, RotateCcw
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const TEMPLATE_TYPES = [
    { value: 'CERTIFICATE', label: 'Certifikat / Kursintyg' },
    { value: 'GRADE_REPORT', label: 'Betygsrapport' },
];

const QR_POSITIONS = [
    { value: 'BOTTOM_RIGHT', label: 'Nedre höger' },
    { value: 'BOTTOM_LEFT', label: 'Nedre vänster' },
    { value: 'TOP_RIGHT', label: 'Övre höger' },
    { value: 'TOP_LEFT', label: 'Övre vänster' },
];

const Toggle = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        <button type="button" onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
        </button>
    </label>
);

const SectionHeader = ({ icon: Icon, title, open, onToggle }) => (
    <button onClick={onToggle}
        className="flex items-center justify-between w-full py-2 text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
        <span className="flex items-center gap-2">
            <Icon size={14} />
            {title}
        </span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
);

const ColorInput = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
            <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer" />
            <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
                className="w-20 px-2 py-1 text-xs font-mono bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg" />
        </div>
    </div>
);

const FileUpload = ({ label, currentUrl, onUpload, uploading }) => {
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) onUpload(file);
    }, [onUpload]);

    return (
        <div className="space-y-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer relative">
                {currentUrl ? (
                    <img src={api.getSafeUrl(currentUrl)}
                        alt={label} className="max-h-20 mx-auto object-contain rounded" />
                ) : (
                    <div className="text-gray-400 dark:text-gray-500">
                        <Upload size={20} className="mx-auto mb-1" />
                        <p className="text-xs">Dra & släpp eller klicka</p>
                    </div>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={e => { if (e.target.files[0]) onUpload(e.target.files[0]); }}
                    disabled={uploading} />
                {uploading && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-black/50 flex items-center justify-center rounded-xl">
                        <Loader2 className="animate-spin text-indigo-500" size={24} />
                    </div>
                )}
            </div>
        </div>
    );
};

// --- LIVE PREVIEW ---
const CertificatePreview = ({ template }) => {
    const t = template;
    const isLandscape = t.orientation !== 'PORTRAIT';
    const previewW = isLandscape ? 420 : 297;
    const previewH = isLandscape ? 297 : 420;

    const logoUrl = api.getSafeUrl(t.logoUrl);
    const bgUrl = api.getSafeUrl(t.backgroundImageUrl);

    const titleScale = (t.titleFontSize || 42) / 42;
    const bodyScale = (t.bodyFontSize || 18) / 18;

    return (
        <div className="relative overflow-hidden bg-white shadow-2xl mx-auto"
            style={{ width: previewW, height: previewH, fontFamily: 'Times New Roman, serif' }}>

            {/* Background image */}
            {bgUrl && (
                <img src={bgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}

            {/* Outer border */}
            {t.showBorder !== false && (
                <>
                    <div className="absolute" style={{
                        inset: '6px', border: `3px solid ${t.primaryColor || '#C5A009'}`, pointerEvents: 'none'
                    }} />
                    <div className="absolute" style={{
                        inset: '12px', border: `1px solid ${t.secondaryColor || '#1E293B'}`, pointerEvents: 'none'
                    }} />
                </>
            )}

            {/* Corner decorations */}
            {t.showCornerDecorations !== false && (
                <>
                    {[[12, 12], [previewW - 16, 12], [12, previewH - 16], [previewW - 16, previewH - 16]].map(([cx, cy], i) => (
                        <div key={i} className="absolute w-2.5 h-2.5 rounded-full"
                            style={{ left: cx, top: cy, backgroundColor: t.primaryColor || '#C5A009' }} />
                    ))}
                </>
            )}

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center"
                style={{ paddingTop: isLandscape ? '20px' : '40px' }}>

                {/* Logo */}
                {logoUrl && (
                    <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain mb-2" />
                )}

                {/* Title */}
                <h1 className="font-bold tracking-[0.15em] mb-0.5" style={{
                    fontSize: `${Math.round(14 * titleScale)}px`,
                    color: t.secondaryColor || '#1E293B'
                }}>
                    {t.titleText || 'K U R S I N T Y G'}
                </h1>

                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    {t.subtitleText || 'BEVIS PÅ GENOMFÖRD UTBILDNING'}
                </p>

                <p className="italic text-gray-600 mb-1" style={{ fontSize: `${Math.round(7 * bodyScale)}px` }}>
                    {t.introText || 'Härmed intygas att'}
                </p>

                <p className="font-bold underline mb-1" style={{
                    fontSize: '13px', color: t.secondaryColor || '#1E293B'
                }}>
                    Anna Andersson
                </p>

                <p className="italic text-gray-600 mb-1" style={{ fontSize: `${Math.round(7 * bodyScale)}px` }}>
                    {t.bodyText || 'Har framgångsrikt genomfört kursen'}
                </p>

                <p className="font-bold text-[10px] mb-0.5">Matematik 1a</p>
                <p className="text-[6px] text-gray-400">
                    Kurskod: MAT01a | Betyg: {t.gradeLabel || 'GODKÄND'}
                </p>

                {/* Signature area */}
                <div className="flex justify-between w-full mt-auto mb-4 px-4" style={{ marginTop: '12px' }}>
                    <div className="text-left">
                        <p className="text-[7px]">Datum: 2026-02-11</p>
                        <div className="w-24 border-t border-gray-300 mt-1" />
                        <p className="text-[5px] text-gray-400">Utfärdat datum</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-bold italic" style={{ color: t.primaryColor || '#C5A009' }}>
                            {t.schoolNameOverride || 'EduFlex Academy'}
                        </p>
                        <div className="w-24 border-t border-gray-300 mt-1 ml-auto" />
                        <p className="text-[5px] text-gray-400">Signerat av {t.signatureTitle || 'Rektor'}</p>
                    </div>
                </div>
            </div>

            {/* QR Code placeholder */}
            {t.showQrCode !== false && (
                <div className="absolute w-12 h-12 border-2 border-gray-300 rounded flex items-center justify-center bg-white/80"
                    style={{
                        ...(t.qrPosition === 'TOP_LEFT' ? { top: 16, left: 16 } :
                            t.qrPosition === 'TOP_RIGHT' ? { top: 16, right: 16 } :
                                t.qrPosition === 'BOTTOM_LEFT' ? { bottom: 16, left: 16 } :
                                    { bottom: 16, right: 16 })
                    }}>
                    <QrCode size={28} className="text-gray-400" />
                </div>
            )}
        </div>
    );
};

const GradeReportPreview = ({ template }) => {
    const t = template;
    const headerColor = t.secondaryColor || '#1E293B';

    return (
        <div className="relative bg-white shadow-2xl mx-auto overflow-hidden" style={{ width: 297, height: 420, fontFamily: 'Helvetica, sans-serif' }}>
            <div className="p-6 flex flex-col h-full">
                <h1 className="text-center font-bold text-sm mb-1" style={{ color: headerColor }}>
                    {t.titleText || 'SAMLADE BETYG'}
                </h1>
                <p className="text-center text-[7px] text-gray-400 mb-3">
                    {t.schoolNameOverride || 'EduFlex Academy'}
                </p>

                <div className="text-[6px] space-y-0.5 mb-3 text-gray-600">
                    <p><b>Elev:</b> Anna Andersson</p>
                    <p><b>Personnummer:</b> 20080115-XXXX</p>
                    <p><b>Utfärdat:</b> 2026-02-11 14:30</p>
                </div>

                <table className="w-full text-[6px] border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: headerColor }}>
                            {['Kurs', 'Kurskod', 'Status', 'Datum'].map(h => (
                                <th key={h} className="text-white py-1 px-1.5 text-left font-bold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Matematik 1a', 'MAT01a', 'PASSED', '2026-01-15'],
                            ['Svenska 1', 'SVE01', 'PASSED', '2026-01-20'],
                            ['Engelska 5', 'ENG05', 'PASSED', '2026-02-01'],
                        ].map(([name, code, status, date], i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                                <td className="py-1 px-1.5">{name}</td>
                                <td className="py-1 px-1.5">{code}</td>
                                <td className="py-1 px-1.5 font-bold text-green-600">{status}</td>
                                <td className="py-1 px-1.5">{date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <p className="mt-auto text-center text-[5px] italic text-gray-400">
                    {t.footerText || 'Detta dokument är automatiskt genererat och saknar signatur.'}
                </p>
            </div>

            {t.showQrCode !== false && (
                <div className="absolute w-10 h-10 border border-gray-300 rounded flex items-center justify-center bg-white/80"
                    style={{
                        ...(t.qrPosition === 'TOP_LEFT' ? { top: 12, left: 12 } :
                            t.qrPosition === 'TOP_RIGHT' ? { top: 12, right: 12 } :
                                t.qrPosition === 'BOTTOM_LEFT' ? { bottom: 12, left: 12 } :
                                    { bottom: 12, right: 12 })
                    }}>
                    <QrCode size={22} className="text-gray-400" />
                </div>
            )}
        </div>
    );
};

// --- MAIN EDITOR ---
const PdfTemplateEditor = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedType, setSelectedType] = useState('CERTIFICATE');
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBg, setUploadingBg] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Section toggles
    const [openSections, setOpenSections] = useState({
        images: true, texts: true, colors: true, layout: true
    });
    const toggleSection = (s) => setOpenSections(prev => ({ ...prev, [s]: !prev[s] }));

    const loadTemplates = async () => {
        try {
            const data = await api.pdfTemplates.getAll();
            setTemplates(data);
            const match = data.find(t => t.templateType === selectedType);
            if (match) setTemplate({ ...match });
        } catch (err) {
            console.error('Failed to load PDF templates', err);
            toast.error('Kunde inte ladda mallar');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadTemplates(); }, []);

    useEffect(() => {
        const match = templates.find(t => t.templateType === selectedType);
        if (match) {
            setTemplate({ ...match });
            setHasChanges(false);
        }
    }, [selectedType, templates]);

    const updateField = (field, value) => {
        setTemplate(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!template) return;
        setSaving(true);
        try {
            const updated = await api.pdfTemplates.update(template.id, template);
            setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
            setTemplate({ ...updated });
            setHasChanges(false);
            toast.success('Mallen har sparats');
        } catch (err) {
            toast.error('Kunde inte spara mallen');
        } finally {
            setSaving(false);
        }
    };

    const handleUploadLogo = async (file) => {
        if (!template) return;
        setUploadingLogo(true);
        try {
            const updated = await api.pdfTemplates.uploadLogo(template.id, file);
            setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
            setTemplate({ ...updated });
            toast.success('Logotyp uppladdad');
        } catch (err) {
            toast.error('Kunde inte ladda upp logotyp');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleUploadBackground = async (file) => {
        if (!template) return;
        setUploadingBg(true);
        try {
            const updated = await api.pdfTemplates.uploadBackground(template.id, file);
            setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
            setTemplate({ ...updated });
            toast.success('Bakgrundsbild uppladdad');
        } catch (err) {
            toast.error('Kunde inte ladda upp bakgrundsbild');
        } finally {
            setUploadingBg(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    if (!template) {
        return (
            <div className="text-center p-12 text-gray-500 dark:text-gray-400">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>Inga PDF-mallar hittades. Starta servern för att skapa standardmallar.</p>
            </div>
        );
    }

    const isCert = selectedType === 'CERTIFICATE';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <FileText className="w-5 h-5 text-indigo-500" />
                        </div>
                        PDF-mallredigering
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Anpassa utseende på certifikat och betygsrapporter
                    </p>
                </div>
                <button onClick={handleSave} disabled={saving || !hasChanges}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${hasChanges
                        ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                        }`}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : hasChanges ? <Save size={16} /> : <Check size={16} />}
                    {saving ? 'Sparar...' : hasChanges ? 'Spara ändringar' : 'Sparat'}
                </button>
            </div>

            {/* Template type selector */}
            <div className="flex gap-2">
                {TEMPLATE_TYPES.map(tt => (
                    <button key={tt.value} onClick={() => setSelectedType(tt.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedType === tt.value
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'bg-white dark:bg-[#1E1F20] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#282a2c] border border-gray-200 dark:border-white/10'
                            }`}>
                        {tt.label}
                    </button>
                ))}
            </div>

            {/* Editor layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* LEFT: Settings panel */}
                <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100 dark:divide-white/5">

                        {/* IMAGES */}
                        <div className="p-4">
                            <SectionHeader icon={ImageIcon} title="Bilder" open={openSections.images} onToggle={() => toggleSection('images')} />
                            {openSections.images && (
                                <div className="mt-3 space-y-4">
                                    <FileUpload label="Logotyp" currentUrl={template.logoUrl} onUpload={handleUploadLogo} uploading={uploadingLogo} />
                                    <FileUpload label="Bakgrundsbild" currentUrl={template.backgroundImageUrl} onUpload={handleUploadBackground} uploading={uploadingBg} />
                                </div>
                            )}
                        </div>

                        {/* TEXTS */}
                        <div className="p-4">
                            <SectionHeader icon={Type} title="Texter" open={openSections.texts} onToggle={() => toggleSection('texts')} />
                            {openSections.texts && (
                                <div className="mt-3 space-y-3">
                                    {[
                                        { field: 'titleText', label: 'Titel', placeholder: isCert ? 'K U R S I N T Y G' : 'SAMLADE BETYG' },
                                        ...(isCert ? [
                                            { field: 'subtitleText', label: 'Undertitel', placeholder: 'BEVIS PÅ GENOMFÖRD UTBILDNING' },
                                            { field: 'introText', label: 'Inledningstext', placeholder: 'Härmed intygas att' },
                                            { field: 'bodyText', label: 'Brödtext', placeholder: 'Har framgångsrikt genomfört kursen' },
                                            { field: 'gradeLabel', label: 'Betygstext', placeholder: 'GODKÄND' },
                                            { field: 'signatureTitle', label: 'Signaturtitel', placeholder: 'Rektor' },
                                        ] : []),
                                        { field: 'schoolNameOverride', label: 'Skolnamn (override)', placeholder: 'Lämna tomt för systemets skolnamn' },
                                        { field: 'footerText', label: 'Fotnot', placeholder: 'Valfri fotnot...' },
                                    ].map(({ field, label, placeholder }) => (
                                        <div key={field}>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                                            <input type="text" value={template[field] || ''} onChange={e => updateField(field, e.target.value)}
                                                placeholder={placeholder}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* COLORS */}
                        <div className="p-4">
                            <SectionHeader icon={Palette} title="Färger" open={openSections.colors} onToggle={() => toggleSection('colors')} />
                            {openSections.colors && (
                                <div className="mt-3 space-y-3">
                                    <ColorInput label={isCert ? 'Primär (ram/guld)' : 'Primär'} value={template.primaryColor} onChange={v => updateField('primaryColor', v)} />
                                    <ColorInput label={isCert ? 'Sekundär (text/blå)' : 'Rubrikfärg'} value={template.secondaryColor} onChange={v => updateField('secondaryColor', v)} />
                                    <ColorInput label="Accent" value={template.accentColor} onChange={v => updateField('accentColor', v)} />
                                </div>
                            )}
                        </div>

                        {/* LAYOUT */}
                        <div className="p-4">
                            <SectionHeader icon={Layout} title="Layout" open={openSections.layout} onToggle={() => toggleSection('layout')} />
                            {openSections.layout && (
                                <div className="mt-3 space-y-3">
                                    {isCert && (
                                        <>
                                            <Toggle label="Visa ramar" checked={template.showBorder !== false} onChange={v => updateField('showBorder', v)} />
                                            <Toggle label="Visa hörndekorationer" checked={template.showCornerDecorations !== false} onChange={v => updateField('showCornerDecorations', v)} />
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Orientering</label>
                                                <select value={template.orientation || 'LANDSCAPE'} onChange={e => updateField('orientation', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white">
                                                    <option value="LANDSCAPE">Liggande (Landscape)</option>
                                                    <option value="PORTRAIT">Stående (Portrait)</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    <Toggle label="Visa QR-kod" checked={template.showQrCode !== false} onChange={v => updateField('showQrCode', v)} />

                                    {template.showQrCode !== false && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">QR-position</label>
                                            <select value={template.qrPosition || 'BOTTOM_RIGHT'} onChange={e => updateField('qrPosition', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-sm dark:text-white">
                                                {QR_POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                            Titelstorlek: {template.titleFontSize || 42}px
                                        </label>
                                        <input type="range" min="20" max="60" value={template.titleFontSize || 42}
                                            onChange={e => updateField('titleFontSize', parseInt(e.target.value))}
                                            className="w-full accent-indigo-500" />
                                    </div>

                                    {isCert && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                                Brödtextstorlek: {template.bodyFontSize || 18}px
                                            </label>
                                            <input type="range" min="10" max="30" value={template.bodyFontSize || 18}
                                                onChange={e => updateField('bodyFontSize', parseInt(e.target.value))}
                                                className="w-full accent-indigo-500" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Live preview */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                        <Eye size={16} />
                        Förhandsvisning
                    </div>
                    <div className="bg-gray-100 dark:bg-black/20 rounded-2xl p-8 flex items-center justify-center min-h-[480px] border border-gray-200 dark:border-white/5">
                        {isCert ? (
                            <CertificatePreview template={template} />
                        ) : (
                            <GradeReportPreview template={template} />
                        )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                        Förhandsvisning är en approximation. Den slutgiltiga PDF:en kan se annorlunda ut.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PdfTemplateEditor;
