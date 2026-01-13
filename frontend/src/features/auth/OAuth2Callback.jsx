import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Loader2 } from 'lucide-react';

const OAuth2Callback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAppContext();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Decode token to get user info if needed, or just fetch /api/users/me
            // For now, we manually decode or assume generic user until next fetch.
            // Better: use the token to fetch current user profile.

            localStorage.setItem('token', token);

            // Vi hämtar användarprofilen för att fylla context
            fetchUserInfo(token);
        } else {
            navigate('/login?error=no_token');
        }
    }, [searchParams, navigate]);

    const fetchUserInfo = async (token) => {
        try {
            const response = await fetch('/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                login(userData, token);
                navigate('/');
            } else {
                const text = await response.text();
                console.error("Failed to fetch user info:", response.status, text);
                throw new Error(`Failed to fetch user info: ${response.status}`);
            }
        } catch (error) {
            console.error(error);
            navigate('/login?error=auth_failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#121212]">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Autentiserar...</p>
            </div>
        </div>
    );
};

export default OAuth2Callback;
