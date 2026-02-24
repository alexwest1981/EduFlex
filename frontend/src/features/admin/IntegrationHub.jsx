import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    Link2, Settings, Power, PowerOff, RefreshCw, Upload,
    CheckCircle, XCircle, AlertTriangle, Wifi, WifiOff,
    Video, Users, BookOpen, FileSpreadsheet, Library, GraduationCap
} from 'lucide-react';

/**
 * Integration Hub – Centralt admin-dashboard för alla externa integrationer.
 * Visar status, on/off toggle, konfiguration och test för varje integration.
 */

// Ikon-mappning per integrationstyp
const INTEGRATION_ICONS = {
    LTI: GraduationCap,
    ZOOM: Video,
    TEAMS: Users,
    SKOLVERKET: BookOpen,
    SIS: FileSpreadsheet,
    LIBRARY: Library
};

// Färg-mappning per status
const STATUS_COLORS = {
    CONNECTED: { bg: '#10b981', text: '#fff', label: 'Ansluten' },
    NOT_CONFIGURED: { bg: '#6b7280', text: '#fff', label: 'Ej konfigurerad' },
    DISABLED: { bg: '#9ca3af', text: '#fff', label: 'Avstängd' },
    ERROR: { bg: '#ef4444', text: '#fff', label: 'Fel' },
};

const IntegrationHub = () => {
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState(null);
    const [configValues, setConfigValues] = useState({});

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const data = await api.get('/integrations');
            setIntegrations(data);
        } catch (err) {
            toast.error('Kunde inte hämta integrationer');
        } finally {
            setLoading(false);
        }
    };

    const toggleIntegration = async (type) => {
        try {
            const updated = await api.put(`/integrations/${type}/toggle`);
            setIntegrations(prev => prev.map(i => i.platform === type ? updated : i));
            toast.success(`${type} ${updated.active ? 'aktiverad' : 'avaktiverad'}`);
        } catch (err) {
            toast.error('Kunde inte ändra status');
        }
    };

    const testConnection = async (type) => {
        try {
            const result = await api.get(`/integrations/${type}/test`);
            toast.success(result.message || 'Test genomfört');
        } catch (err) {
            toast.error('Anslutningstestet misslyckades');
        }
    };

    const saveConfig = async (type) => {
        try {
            await api.put(`/integrations/${type}/config`, configValues[type] || {});
            toast.success(`${type} konfigurerad!`);
            fetchIntegrations();
        } catch (err) {
            toast.error('Kunde inte spara konfiguration');
        }
    };

    const handleConfigChange = (type, key, value) => {
        setConfigValues(prev => ({
            ...prev,
            [type]: { ...(prev[type] || {}), [key]: value }
        }));
    };

    // Konfigurationsfält per integrationstyp
    const CONFIG_FIELDS = {
        LTI: [
            { key: 'platformUrl', label: 'Platform URL', placeholder: 'https://canvas.example.com' },
            { key: 'clientId', label: 'Client ID', placeholder: 'LTI client ID' },
            { key: 'deploymentId', label: 'Deployment ID', placeholder: 'Deployment ID' },
        ],
        ZOOM: [
            { key: 'apiKey', label: 'API Key', placeholder: 'Zoom API Key' },
            { key: 'apiSecret', label: 'API Secret', placeholder: 'Zoom API Secret', type: 'password' },
        ],
        TEAMS: [
            { key: 'tenantId', label: 'Tenant ID', placeholder: 'Azure AD Tenant ID' },
            { key: 'clientId', label: 'Client ID', placeholder: 'App Client ID' },
            { key: 'clientSecret', label: 'Client Secret', placeholder: 'App Secret', type: 'password' },
        ],
        SKOLVERKET: [],
        SIS: [],
        LIBRARY: [],
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link2 size={28} style={{ color: '#6366f1' }} />
                    Integration Hub
                </h1>
                <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                    Konfigurera och övervaka alla externa integrationer – LTI, Zoom, Teams, Skolverket, SIS och bibliotek.
                </p>
            </div>

            {/* Snabbstatus-rad */}
            <div style={{
                display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap'
            }}>
                <StatusPill label="Totalt" value={integrations.length} color="#6366f1" />
                <StatusPill label="Anslutna" value={integrations.filter(i => i.status === 'CONNECTED').length} color="#10b981" />
                <StatusPill label="Avstängda" value={integrations.filter(i => !i.active).length} color="#9ca3af" />
                <StatusPill label="Fel" value={integrations.filter(i => i.status === 'ERROR').length} color="#ef4444" />
            </div>

            {/* Integrationskort */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.25rem'
            }}>
                {integrations.map(integration => {
                    const Icon = INTEGRATION_ICONS[integration.platform] || Link2;
                    const statusInfo = STATUS_COLORS[integration.status] || STATUS_COLORS.NOT_CONFIGURED;
                    const isExpanded = expandedCard === integration.platform;
                    const fields = CONFIG_FIELDS[integration.platform] || [];

                    return (
                        <div key={integration.platform} style={{
                            background: 'var(--card-bg, #fff)',
                            borderRadius: '16px',
                            border: '1px solid var(--border-color, #e5e7eb)',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            boxShadow: isExpanded ? '0 8px 32px rgba(99, 102, 241, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                        }}>
                            {/* Kort-header */}
                            <div style={{
                                padding: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                            }}
                                onClick={() => setExpandedCard(isExpanded ? null : integration.platform)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Icon size={22} color="#fff" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>
                                            {integration.displayName}
                                        </h3>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            background: statusInfo.bg,
                                            color: statusInfo.text,
                                            padding: '2px 8px',
                                            borderRadius: '999px',
                                            fontWeight: 500,
                                        }}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Toggle-knapp */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleIntegration(integration.platform); }}
                                    style={{
                                        background: integration.active ? '#10b981' : '#d1d5db',
                                        border: 'none',
                                        borderRadius: '999px',
                                        width: 48, height: 26,
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'background 0.3s',
                                    }}
                                    title={integration.active ? 'Avaktivera' : 'Aktivera'}
                                >
                                    <div style={{
                                        width: 20, height: 20, borderRadius: '50%',
                                        background: '#fff',
                                        position: 'absolute',
                                        top: 3,
                                        left: integration.active ? 25 : 3,
                                        transition: 'left 0.3s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                    }} />
                                </button>
                            </div>

                            {/* Beskrivning */}
                            <div style={{ padding: '0 1.25rem 0.75rem', color: '#6b7280', fontSize: '0.85rem' }}>
                                {integration.description}
                            </div>

                            {/* Senaste synk */}
                            {integration.lastSync && (
                                <div style={{ padding: '0 1.25rem 0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                                    Senaste synk: {new Date(integration.lastSync).toLocaleString('sv-SE')}
                                </div>
                            )}

                            {/* Expanderad konfigurationspanel */}
                            {isExpanded && (
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    borderTop: '1px solid var(--border-color, #e5e7eb)',
                                    background: 'var(--card-bg-alt, #f9fafb)',
                                }}>
                                    {fields.length > 0 ? (
                                        <>
                                            {fields.map(field => (
                                                <div key={field.key} style={{ marginBottom: '0.75rem' }}>
                                                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                                                        {field.label}
                                                    </label>
                                                    <input
                                                        type={field.type || 'text'}
                                                        placeholder={field.placeholder}
                                                        value={(configValues[integration.platform] || {})[field.key] || ''}
                                                        onChange={(e) => handleConfigChange(integration.platform, field.key, e.target.value)}
                                                        style={{
                                                            width: '100%', padding: '0.5rem 0.75rem',
                                                            borderRadius: '8px', border: '1px solid #d1d5db',
                                                            fontSize: '0.85rem', background: 'var(--input-bg, #fff)',
                                                            color: 'var(--text-color, #111)',
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => saveConfig(integration.platform)}
                                                style={{
                                                    background: '#6366f1', color: '#fff',
                                                    border: 'none', borderRadius: '8px',
                                                    padding: '0.5rem 1rem', cursor: 'pointer',
                                                    fontWeight: 500, fontSize: '0.85rem',
                                                    marginRight: '0.5rem', marginTop: '0.25rem',
                                                }}
                                            >
                                                Spara konfiguration
                                            </button>
                                        </>
                                    ) : (
                                        <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
                                            {integration.platform === 'SKOLVERKET'
                                                ? 'Ingen konfiguration krävs – använder Skolverkets publika API.'
                                                : integration.platform === 'SIS'
                                                    ? 'Ladda upp CSV-filer via SIS Import-sidan.'
                                                    : integration.platform === 'LIBRARY'
                                                        ? 'Ingen konfiguration krävs – använder Open Library API.'
                                                        : 'Ingen extra konfiguration tillgänglig.'}
                                        </p>
                                    )}

                                    <button
                                        onClick={() => testConnection(integration.platform)}
                                        style={{
                                            background: 'transparent', color: '#6366f1',
                                            border: '1px solid #6366f1', borderRadius: '8px',
                                            padding: '0.5rem 1rem', cursor: 'pointer',
                                            fontWeight: 500, fontSize: '0.85rem',
                                            marginTop: '0.5rem',
                                        }}
                                    >
                                        <Wifi size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                                        Testa anslutning
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// Liten statusindikator-komponent
const StatusPill = ({ label, value, color }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'var(--card-bg, #fff)', borderRadius: '12px',
        padding: '0.5rem 1rem', border: '1px solid var(--border-color, #e5e7eb)',
        fontSize: '0.85rem',
    }}>
        <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: color, display: 'inline-block',
        }} />
        <span style={{ color: '#6b7280' }}>{label}:</span>
        <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
);

export default IntegrationHub;
