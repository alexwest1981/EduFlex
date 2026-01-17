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
            // Use the centralized API service to ensure consistent base URL (port 8080)
            const userData = await import('../../services/api').then(module => module.api.get('/users/me'));
            if (userData) {
                login(userData, token);
                navigate('/');
            } else {
                throw new Error("Failed to fetch user data");
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
