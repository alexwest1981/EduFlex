import React from 'react';
import MobileAvatar from './MobileAvatar';
import { Mail, Phone, MapPin, Edit2, LogOut, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '../../../context/BrandingContext';

const MobileProfileView = ({ currentUser, onLogout }) => {
    const navigate = useNavigate();
    const { getCustomTheme, updateBranding } = useBranding();

    // Toggle between default (no theme/null) and a 'dark' theme for demo
    // Or just re-enable the theme picker requested by the user.
    // Assuming simple toggle for now as per "theme-selector" request.
    const handleThemeToggle = () => {
        const current = getCustomTheme();
        // Simple toggle logic for demo purposes, or reset
        if (current) {
            updateBranding(null); // Reset to default
            alert("Tema återställt till standard.");
        } else {
            // Set a demo theme
            updateBranding({
                primaryColor: '#FF6D5A',
                secondaryColor: '#FFCE47',
                backgroundColor: '#000000',
                textColor: '#FFFFFF'
            });
            alert("Tema ändrat! (Demo)");
        }
    };

    return (
        <div className="px-6 space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 pb-32">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Min Profil</h2>
                <div className="flex gap-2">
                    <button onClick={handleThemeToggle} className="bg-white/10 p-2 rounded-full text-white hover:bg-white/20">
                        <Palette size={20} />
                    </button>
                    <button className="bg-white/10 p-2 rounded-full text-white hover:bg-white/20">
                        <Edit2 size={20} />
                    </button>
                </div>
            </div>

            {/* Hero Card */}
            <div className="bg-gradient-to-br from-[#1C1C1E] to-[#252528] p-6 rounded-[32px] flex flex-col items-center text-white border border-white/5">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#FF6D5A] to-[#FFCE47] mb-4">
                    <MobileAvatar user={currentUser} className="w-full h-full rounded-full border-4 border-[#1C1C1E] text-2xl" />
                </div>
                <h3 className="text-2xl font-bold">{currentUser?.fullName || currentUser?.name}</h3>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase mt-2">{currentUser?.role?.name || currentUser?.role}</span>
            </div>

            {/* Details */}
            <div className="bg-[#1C1C1E] rounded-[32px] p-6 space-y-6 text-white">
                <div className="flex items-center gap-4">
                    <div className="bg-white/5 p-3 rounded-full"><Mail size={20} className="text-gray-400" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Email</p>
                        <p className="font-medium">{currentUser?.email || 'Ingen email'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white/5 p-3 rounded-full"><Phone size={20} className="text-gray-400" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Telefon</p>
                        <p className="font-medium">{currentUser?.phone || '+46 70 123 45 67'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white/5 p-3 rounded-full"><MapPin size={20} className="text-gray-400" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Plats</p>
                        <p className="font-medium">{currentUser?.city || 'Stockholm, SE'}</p>
                    </div>
                </div>
            </div>

            <button onClick={onLogout} className="w-full p-4 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center gap-2 font-bold">
                <LogOut size={20} /> Logga ut
            </button>
        </div>
    );
};

export default MobileProfileView;
