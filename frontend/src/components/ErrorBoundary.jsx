import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ error, errorInfo });

        // Send error report to backend
        this.reportError(error, errorInfo);
    }

    reportError = async (error, errorInfo) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

            await api.errors.report({
                message: error.toString(),
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                url: window.location.href,
                userAgent: navigator.userAgent,
                userId: currentUser.id,
                username: currentUser.username
            });
        } catch (e) {
            console.error('Failed to report error:', e);
        }
    };

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} />;
        }

        return this.props.children;
    }
}

const ErrorFallback = ({ error }) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        window.location.href = '/';
    };

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Ojdå, något gick fel
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-8">
                    Ett oväntat fel har inträffat. Felet har rapporterats automatiskt till administratörerna.
                </p>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleGoHome}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                    >
                        <Home size={20} />
                        Tillbaka till Dashboard
                    </button>

                    <button
                        onClick={handleReload}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw size={20} />
                        Ladda om sidan
                    </button>
                </div>

                {/* Debug info (only in development) */}
                {process.env.NODE_ENV === 'development' && error && (
                    <details className="mt-6 text-left">
                        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                            Teknisk information
                        </summary>
                        <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-xs text-red-600 overflow-auto max-h-40">
                            {error.toString()}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
};

export default ErrorBoundary;
