import React from 'react';
import { api } from '../../services/api';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorId: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to backend
        try {
            const errorData = {
                message: error.toString(),
                stack: errorInfo.componentStack,
                url: window.location.href,
                userAgent: navigator.userAgent
            };

            api.logs.reportError(errorData).then(() => {
                console.log("Error reported to server");
            }).catch(e => console.error("Failed to report error", e));

        } catch (e) {
            console.error("Error reporting failed", e);
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#151718] p-4">
                    <div className="max-w-md w-full bg-white dark:bg-[#1e2022] rounded-xl shadow-lg border border-gray-200 dark:border-[#3c4043] p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            Ojdå, något gick fel
                        </h1>

                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Vi har stött på ett oväntat fel. Vårt team har automatiskt notifierats om detta.
                            Försök att ladda om sidan.
                        </p>

                        <button
                            onClick={this.handleReload}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={20} />
                            Ladda om sidan
                        </button>

                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                Gå till startsidan
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
