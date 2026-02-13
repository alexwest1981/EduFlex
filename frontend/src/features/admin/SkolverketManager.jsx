import { Download, Edit3, Globe, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
// import SkolverketImport from './SkolverketImport'; // Legacy CSV Import
import SkolverketModule from '../../modules/skolverket/SkolverketModule';
import SkolverketDataEntry from './SkolverketDataEntry';

const SkolverketManager = () => {
    const [subTab, setSubTab] = useState('import');
    const [syncing, setSyncing] = useState(false);

    const handleSyncAll = async () => {
        if (!confirm('Detta kommer att synka ALLA kurser i katalogen med Skolverkets API. Detta kan ta några minuter. Vill du fortsätta?')) return;

        setSyncing(true);
        try {
            const res = await api.post('/skolverket/api/sync-all');
            toast.success(`Synk slutförd! ${res.synced} kurser uppdaterades.`);
        } catch (error) {
            toast.error('Synk misslyckades: ' + error.message);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 bg-gray-100 dark:bg-[#131314] p-1 rounded-lg w-fit">
                <button
                    onClick={() => setSubTab('import')}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${subTab === 'import'
                        ? 'bg-white dark:bg-[#282a2c] text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    <Globe size={16} />
                    API Utforskare & Import
                </button>
                <button
                    onClick={() => setSubTab('data')}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${subTab === 'data'
                        ? 'bg-white dark:bg-[#282a2c] text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    <Edit3 size={16} />
                    Hantera Data Manuellt
                </button>
            </div>

            <button
                onClick={handleSyncAll}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 shadow-sm transition-all"
            >
                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Synkar katalog...' : 'Synka All Kurskatalog'}
            </button>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[600px]">
                {/* We wrap SkolverketModule to constrain its height if needed, but it handles its own scaffolding. 
                    SkolverketModule expects full height, so we give it a container. */}
                {subTab === 'import' && (
                    <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#282a2c] shadow-sm h-[800px] overflow-hidden">
                        <SkolverketModule />
                    </div>
                )}
                {subTab === 'data' && <SkolverketDataEntry />}
            </div>
        </div>
    );
};

export default SkolverketManager;
