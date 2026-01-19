import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterOrganization = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        organizationKey: '',
        domain: '',
        dbSchema: '',
        // Admin Details
        adminEmail: '',
        adminPassword: '',
        adminFirstName: '',
        adminLastName: '',
        // Security
        registrationKey: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    // Helper to generate values from name
    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        setFormData({
            ...formData,
            name: name,
            organizationKey: slug,
            domain: `${slug}.local`,
            dbSchema: `tenant_${slug.replace(/-/g, '_')}`
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/tenants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Error: ${response.statusText}`);
            }

            const data = await response.json();
            setSuccess(`Organization "${data.name}" created successfully! Admin login: ${formData.adminEmail}`);
            // Redirect after success
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register Organization</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Organization Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleNameChange}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Organization Key (ID)</label>
                        <input
                            type="text"
                            name="organizationKey"
                            value={formData.organizationKey}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
                            readOnly
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Domain</label>
                        <input
                            type="text"
                            name="domain"
                            value={formData.domain}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
                            readOnly
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Database Schema</label>
                        <input
                            type="text"
                            name="dbSchema"
                            value={formData.dbSchema}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
                            readOnly
                        />
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg font-semibold mb-3">Admin Account</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">First Name</label>
                                <input type="text" name="adminFirstName" value={formData.adminFirstName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Last Name</label>
                                <input type="text" name="adminLastName" value={formData.adminLastName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="block text-gray-700 font-medium mb-1">Admin Email</label>
                            <input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
                        </div>
                        <div className="mt-3">
                            <label className="block text-gray-700 font-medium mb-1">Admin Password</label>
                            <input type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                        <label className="block text-yellow-800 font-medium mb-1">Registration Master Key</label>
                        <input
                            type="password"
                            name="registrationKey"
                            value={formData.registrationKey}
                            onChange={handleChange}
                            placeholder="Enter the secret key to authorize creation"
                            className="w-full border border-yellow-300 rounded px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                            required
                        />
                        <p className="text-xs text-yellow-600 mt-1">Required for security purposes.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition duration-150"
                    >
                        {loading ? 'Registering...' : 'Register Organization'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterOrganization;
