import React, { useState, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Save, Lock, User, Upload, CheckCircle, AlertTriangle } from 'lucide-react';

const UserProfile = ({ currentUser, API_BASE, getAuthHeaders, showMessage, refreshUser }) => {
    const [activeTab, setActiveTab] = useState('details'); // 'details' eller 'security'
    const [isLoading, setIsLoading] = useState(false);

    // Formulär-data
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        street: '', zip: '', city: '', country: ''
    });

    // Lösenords-data
    const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

    // Bild-data
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (currentUser) {
            parseAndSetUserData(currentUser);
        }
    }, [currentUser]);

    // Hjälpfunktion för att dela upp adress-strängen från backend
    const parseAndSetUserData = (user) => {
        let street = '', zip = '', city = '', country = '';

        if (user.address) {
            // Förväntat format: "Gatan 1, 12345 Ort, Land"
            const parts = user.address.split(', ');
            if (parts.length >= 3) {
                street = parts[0];
                const zipCity = parts[1].split(' '); // "12345 Ort"
                zip = zipCity[0];
                city = zipCity.slice(1).join(' ');
                country = parts[2];
            } else {
                street = user.address; // Fallback om formatet är fel
            }
        }

        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            street, zip, city, country
        });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Visa preview direkt
        setPreviewImage(URL.createObjectURL(file));

        // Ladda upp direkt
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE}/users/${currentUser.id}/avatar`, {
                method: 'POST',
                headers: { 'Authorization': getAuthHeaders().Authorization }, // Ingen Content-Type för multipart!
                body: formData
            });

            if (res.ok) {
                showMessage("Profilbild uppdaterad!");
                refreshUser(); // Uppdatera App.jsx så bilden syns i menyn
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Slå ihop adressen igen
        const fullAddress = `${formData.street}, ${formData.zip} ${formData.city}, ${formData.country}`;

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: fullAddress
        };

        try {
            const res = await fetch(`${API_BASE}/users/${currentUser.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showMessage("Profil sparad!");
                refreshUser(); // Uppdatera global state
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passData.new !== passData.confirm) {
            alert("Lösenorden matchar inte!");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/users/${currentUser.id}/password`, {
                method: 'PUT', // Antag att vi har denna endpoint
                headers: getAuthHeaders(),
                body: JSON.stringify({ currentPassword: passData.current, newPassword: passData.new })
            });

            if (res.ok) {
                showMessage("Lösenord bytt!");
                setPassData({ current: '', new: '', confirm: '' });
            } else {
                alert("Kunde inte byta lösenord. Kontrollera nuvarande lösenord.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="animate-in fade-in max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Min Profil</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* VÄNSTER: Profilkort */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col items-center text-center h-fit">
                    <div className="relative group mb-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                            {previewImage || currentUser.profilePictureUrl ? (
                                <img
                                    src={previewImage || `http://127.0.0.1:8080${currentUser.profilePictureUrl}`}
                                    alt="Profil"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl font-bold text-gray-400">{currentUser.firstName?.[0]}</span>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-md">
                            <Camera size={16}/>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>

                    <h2 className="text-xl font-bold">{formData.firstName} {formData.lastName}</h2>
                    <p className="text-sm text-gray-500 mb-4">@{currentUser.username} • {currentUser.role}</p>

                    <div className="w-full border-t pt-4 text-left space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Mail size={16} className="text-indigo-500"/> {formData.email || 'Ingen e-post'}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone size={16} className="text-indigo-500"/> {formData.phone || 'Inget nummer'}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <MapPin size={16} className="text-indigo-500"/> {formData.city || 'Ingen ort'}
                        </div>
                    </div>
                </div>

                {/* HÖGER: Redigering */}
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'details' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center justify-center gap-2"><User size={18}/> Personuppgifter</div>
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center justify-center gap-2"><Lock size={18}/> Säkerhet</div>
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'details' && (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Förnamn</label>
                                        <input className="w-full px-4 py-2 border rounded-lg" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Efternamn</label>
                                        <input className="w-full px-4 py-2 border rounded-lg" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">E-post</label>
                                        <input className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Telefon</label>
                                        <input className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase">Adressuppgifter</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-3">
                                            <input placeholder="Gatuadress" className="w-full px-4 py-2 border rounded-lg" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
                                        </div>
                                        <input placeholder="Postnr" className="w-full px-4 py-2 border rounded-lg" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                                        <input placeholder="Ort" className="w-full px-4 py-2 border rounded-lg" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                                        <input placeholder="Land" className="w-full px-4 py-2 border rounded-lg" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-sm flex items-center gap-2">
                                        <Save size={18}/> Spara Ändringar
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md mx-auto py-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3 text-sm text-yellow-800">
                                    <AlertTriangle size={20} className="shrink-0"/>
                                    <p>Välj ett starkt lösenord för att skydda ditt konto och dina personuppgifter.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Nuvarande Lösenord</label>
                                    <input type="password" className="w-full px-4 py-2 border rounded-lg" value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Nytt Lösenord</label>
                                    <input type="password" className="w-full px-4 py-2 border rounded-lg" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Bekräfta Nytt Lösenord</label>
                                    <input type="password" className="w-full px-4 py-2 border rounded-lg" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} required />
                                </div>

                                <button className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 shadow-sm flex items-center justify-center gap-2 mt-4">
                                    <Lock size={18}/> Uppdatera Lösenord
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;