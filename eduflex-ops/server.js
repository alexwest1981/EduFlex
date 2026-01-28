const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');
const osUtils = require('os-utils');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const PORT = 8085;
const AUTH_SECRET = 'eduflex_ops_master_2026'; // Simple protection

app.use(cors());
app.use(express.json());

// Auth Middleware
const auth = (req, res, next) => {
    const secret = req.headers['x-ops-secret'];
    if (secret !== AUTH_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// 1. Basic Health
app.get('/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date() });
});

// 2. Docker Container Health
app.get('/docker/status', auth, (req, res) => {
    exec('docker ps --format "{{.Names}}\t{{.Status}}\t{{.Image}}"', (err, stdout, stderr) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const containers = stdout.trim().split('\n').map(line => {
            const [name, status, image] = line.split('\t');
            return { name, status, image, isRunning: status.includes('Up') };
        });
        res.json(containers);
    });
});

// 3. System Stats
app.get('/system/stats', auth, (req, res) => {
    osUtils.cpuUsage((v) => {
        res.json({
            cpu: (v * 100).toFixed(2),
            memTotal: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
            memFree: (os.freemem() / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
            uptime: (os.uptime() / 3600).toFixed(2) + ' hours',
            platform: os.platform(),
            arch: os.arch()
        });
    });
});

// 4. Actions
app.post('/actions/restart-backend', auth, (req, res) => {
    console.log('Restarting backend...');
    // We run it as high priority
    exec('docker-compose restart backend', { cwd: '..' }, (err, stdout, stderr) => {
        if (err) {
            return res.status(500).json({ error: err.message, details: stderr });
        }
        res.json({ message: 'Backend restart initiated', output: stdout });
    });
});

app.post('/actions/rebuild-backend', auth, (req, res) => {
    console.log('Rebuilding backend...');
    exec('docker-compose up -d --build backend', { cwd: '..' }, (err, stdout, stderr) => {
        if (err) {
            return res.status(500).json({ error: err.message, details: stderr });
        }
        res.json({ message: 'Backend rebuild initiated', output: stdout });
    });
});

// 5. App Health Check (checking the main backend)
app.get('/app/health', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8080/actuator/health', { timeout: 2000 });
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ status: 'DOWN', error: error.message });
    }
});

// 6. WebSocket Log Streaming (Tail backend logs)
io.on('connection', (socket) => {
    console.log('Log viewer connected');

    // Check for auth in handshake if needed, simplified here

    socket.on('start-logs', () => {
        console.log('Starting log stream...');
        const logStream = exec('docker logs -f --tail 100 eduflex-backend');

        logStream.stdout.on('data', (data) => {
            socket.emit('log', data);
        });

        logStream.stderr.on('data', (data) => {
            socket.emit('log', data);
        });

        socket.on('disconnect', () => {
            console.log('Log viewer disconnected, killing stream');
            logStream.kill();
        });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`EduFlex Ops Agent running on port ${PORT}`);
});
