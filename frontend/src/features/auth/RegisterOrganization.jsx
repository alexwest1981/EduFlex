import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterOrganization = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        organizationKey: '',
        domain: '',
        dbSchema: ''
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
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            setSuccess(`Organization "${data.name}" created successfully!`);
            // Optional: Redirect after success
            // setTimeout(() => navigate('/login'), 2000);
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
