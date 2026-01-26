import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { Terminal, Pause, Play, Trash2, Maximize, Minimize } from 'lucide-react';
import { api } from '../../services/api';

const RealTimeLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Use refs for mutable values to avoid closure staleness in callbacks
    const logsRef = useRef([]);
    const isPausedRef = useRef(false);
    const stompClientRef = useRef(null);
    const terminalEndRef = useRef(null);

    useEffect(() => {
        // Init Stomp Client
        const client = new Client({
            brokerURL: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws-log`, // Direct WS connection
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setIsConnected(true);
                console.log('Connected to WebSocket');

                client.subscribe('/topic/logs', (message) => {
                    if (isPausedRef.current) return;

                    const newLog = message.body;

                    // Keep buffer size limited to 1000 lines to prevent memory issues
                    logsRef.current = [...logsRef.current, newLog].slice(-1000);
                    setLogs([...logsRef.current]);
                });
            },
            onDisconnect: () => {
                setIsConnected(false);
                console.log('Disconnected from WebSocket');
            },
            onWebSocketError: (error) => {
                console.error('Error with websocket', error);
                setIsConnected(false);
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, []);

    // Auto-scroll logic
    useEffect(() => {
        if (!isPaused && terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isPaused]);

    const togglePause = () => {
        const newState = !isPaused;
        setIsPaused(newState);
        isPausedRef.current = newState;
    };

    const clearLogs = () => {
        setLogs([]);
        logsRef.current = [];
    };

    const getLogColor = (line) => {
        if (line.includes('ERROR') || line.includes('Exception')) return 'text-red-500 font-bold';
        if (line.includes('WARN')) return 'text-yellow-400 font-bold';
        if (line.includes('INFO')) return 'text-green-400';
        if (line.includes('DEBUG')) return 'text-blue-400';
        return 'text-green-400'; // Matrix default
    };

    return (
        <div className={`flex flex-col bg-black rounded-lg overflow-hidden border border-gray-800 shadow-2xl transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[600px]'}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <Terminal className="text-green-500" size={18} />
                    <h2 className="text-green-500 font-mono text-sm font-bold tracking-wider">
                        SYSTEM_TERMINAL_V.1.0 {isConnected ? <span className="text-xs bg-green-900 text-green-300 px-1 rounded ml-2">ONLINE</span> : <span className="text-xs bg-red-900 text-red-300 px-1 rounded ml-2">OFFLINE</span>}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={togglePause} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors" title={isPaused ? "DÅ" : "Paus"}>
                        {isPaused ? <Play size={16} /> : <Pause size={16} />}
                    </button>
                    <button onClick={clearLogs} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors" title="Rensa">
                        <Trash2 size={16} />
                    </button>
                    <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors" title="Fullskärm">
                        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                    </button>
                </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs md:text-sm bg-black custom-scrollbar">
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-green-900/50 select-none">
                        <Terminal size={48} className="mb-4 opacity-20" />
                        <p>INITIERAR ANSLUTNING...</p>
                        <p className="text-[10px] mt-2">VÄNTAR PÅ DATASTRÖM...</p>
                    </div>
                ) : (
                    logs.map((line, index) => (
                        <div key={index} className={`whitespace-pre-wrap py-0.5 hover:bg-white/5 break-all ${getLogColor(line)}`}>
                            <span className="opacity-50 mr-2 select-none text-[10px]">{new Date().toLocaleTimeString()}</span>
                            {line}
                        </div>
                    ))
                )}
                <div ref={terminalEndRef} />
            </div>

            {/* Status Bar */}
            <div className="bg-gray-900 px-4 py-1 text-[10px] text-gray-500 flex justify-between font-mono">
                <span>BUFFER: {logs.length} RADER</span>
                <span>WS: {isConnected ? 'CONNECTED' : 'DISCONNECTED'} // PORT: 8080</span>
            </div>
        </div>
    );
};

export default RealTimeLogViewer;
