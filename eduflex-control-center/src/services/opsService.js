import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:8085';
const OPS_SECRET = 'eduflex_ops_master_2026';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'x-ops-secret': OPS_SECRET
    }
});

export const opsService = {
    getHealth: () => api.get('/health'),
    getDockerStatus: () => api.get('/docker/status'),
    getSystemStats: () => api.get('/system/stats'),
    getAppHealth: () => api.get('/app/health'),
    restartBackend: () => api.post('/actions/restart-backend'),
    rebuildBackend: () => api.post('/actions/rebuild-backend'),

    connectLogs: (onLog) => {
        const socket = io(BASE_URL);
        socket.on('connect', () => {
            console.log('Connected to Ops Agent logs');
            socket.emit('start-logs');
        });
        socket.on('log', onLog);
        return () => socket.disconnect();
    }
};
