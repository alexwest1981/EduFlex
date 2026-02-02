import React, { useState, useEffect } from 'react';
import { Plus, Book, Brain, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import FlashcardGenerator from './FlashcardGenerator';
import FlashcardPlayer from './FlashcardPlayer';

const FlashcardDashboard = () => {
    const [view, setView] = useState('list'); // 'list', 'create', 'play'
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDecks();
    }, []);

    const loadDecks = async () => {
        setLoading(true);
        try {
            const data = await api.get('/flashcards/my') || [];
            setDecks(data);
        } catch (error) {
            console.error('Failed to load decks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeckCreated = (deck) => {
        setDecks([deck, ...decks]);
        setView('list');
    };

    const startStudy = async (deckId) => {
        // Fetch full deck details (including cards)
        try {
            setLoading(true);
            const deck = await api.get(`/flashcards/deck/${deckId}`);
            setSelectedDeck(deck);
            setView('play');
        } catch (error) {
            console.error('Failed to load deck:', error);
            alert('Kunde inte ladda kortleken.');
        } finally {
            setLoading(false);
        }
    };

    const handleSessionComplete = () => {
        // Maybe refresh decks to show updated "due" counts
        loadDecks();
        // Stay in 'play' view but show finished state, or go back to list
        // FlashcardPlayer handles finished state, so we just reload data here
    };

    if (view === 'create') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <button
                    onClick={() => setView('list')}
                    className="flex items-center text-gray-500 hover:text-indigo-600 font-medium transition-colors"
                >
                    <ArrowLeft size={18} className="mr-2" /> Tillbaka
                </button>
                <FlashcardGenerator onDeckCreated={handleDeckCreated} />
            </div>
        );
    }

    if (view === 'play' && selectedDeck) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setView('list')}
                        className="flex items-center text-gray-500 hover:text-indigo-600 font-medium transition-colors"
                    >
                        <ArrowLeft size={18} className="mr-2" /> Avsluta session
                    </button>
                    <h2 className="font-bold text-gray-700 dark:text-gray-300">{selectedDeck.title}</h2>
                </div>
                <FlashcardPlayer
                    deck={selectedDeck}
                    onSessionComplete={handleSessionComplete}
                    onBack={() => setView('list')}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Brain className="text-indigo-500" /> Mina Flashcards
                </h2>
                <button
                    onClick={() => setView('create')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
                >
                    <Plus size={18} /> Skapa Ny
                </button>
            </div>

            {loading && view === 'list' ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
            ) : decks.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-[#1E1F20] rounded-3xl border-2 border-dashed border-gray-200 dark:border-[#3c4043]">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Book size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Inga kortlekar än</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Skapa din första kortlek baserad på dina kurser för att börja lära dig snabbare med hjälp av AI.
                    </p>
                    <button
                        onClick={() => setView('create')}
                        className="px-6 py-3 bg-white dark:bg-[#282a2c] text-indigo-600 dark:text-indigo-400 font-bold rounded-xl border border-gray-200 dark:border-[#3c4043] hover:bg-gray-50 dark:hover:bg-[#303336] transition-colors"
                    >
                        Kom igång
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {decks.map(deck => (
                        <div key={deck.id} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-100 dark:border-[#3c4043] shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                    <Brain size={24} />
                                </div>
                                {deck.cardsDue > 0 && (
                                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full animate-pulse">
                                        {deck.cardsDue} att repetera
                                    </span>
                                )}
                            </div>

                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                                {deck.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                {deck.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-400 mb-6">
                                <span>{deck.totalCards} kort</span>
                                <span>{deck.course?.courseCode}</span>
                            </div>

                            <button
                                onClick={() => startStudy(deck.id)}
                                className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                            >
                                Plugga nu
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FlashcardDashboard;
