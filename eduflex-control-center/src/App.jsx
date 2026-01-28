import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Terminal,
  RefreshCw,
  Cpu,
  Database,
  Layout,
  AlertCircle,
  CheckCircle2,
  HardDrive,
  Clock,
  Zap,
  Box
} from 'lucide-react';
import { opsService } from './services/opsService';
import './App.css';

function App() {
  const [dockerStatus, setDockerStatus] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [appHealth, setAppHealth] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const logEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docker, stats, health] = await Promise.all([
          opsService.getDockerStatus(),
          opsService.getSystemStats(),
          opsService.getAppHealth().catch(() => ({ data: { status: 'DOWN' } }))
        ]);
        setDockerStatus(docker.data);
        setSystemStats(stats.data);
        setAppHealth(health.data);
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    const disconnectLogs = opsService.connectLogs((log) => {
      setLogs(prev => [...prev, log].slice(-500));
    });

    return () => {
      clearInterval(interval);
      disconnectLogs();
    };
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleAction = async (action, fn) => {
    setLoadingAction(action);
    try {
      await fn();
      alert(`Action ${action} initiated successfully`);
    } catch (err) {
      alert(`Failed: ${err.message}`);
    }
    setLoadingAction(null);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <nav className="sidebar glass-card">
        <div className="logo p-6">
          <Zap className="text-primary inline-block mr-2" />
          <span className="font-bold text-xl tracking-tight">EDUFLEX OPS</span>
        </div>

        <div className="menu flex flex-col gap-2 p-4">
          <button
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Activity size={20} /> Dashboard
          </button>
          <button
            className={`menu-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <Terminal size={20} /> Logs
          </button>
          <button
            className={`menu-item ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <Cpu size={20} /> System
          </button>
        </div>

        <div className="mt-auto p-6 text-xs text-text-dim">
          <Clock className="inline-block mr-1" size={12} />
          Uptime: {systemStats?.uptime || '...'}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <header className="header flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              {activeTab === 'dashboard' ? 'System Overview' :
                activeTab === 'logs' ? 'Real-time Logs' : 'System Health'}
            </h1>
            <p className="text-text-dim text-sm">Monitoring EduFlex Cluster</p>
          </div>

          <div className="flex gap-4">
            <div className={`status-badge ${appHealth?.status === 'UP' ? 'status-up' : 'status-down'}`}>
              Backend: {appHealth?.status || 'UNKNOWN'}
            </div>
            <button className="btn-outline">
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="dashboard-grid h-full overflow-y-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="glass-card p-6 flex items-center gap-4">
                <div className="icon-container bg-primary/20 text-primary">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-text-dim text-xs">CPU Usage</p>
                  <p className="text-xl font-bold">{systemStats?.cpu}%</p>
                </div>
              </div>
              <div className="glass-card p-6 flex items-center gap-4">
                <div className="icon-container bg-success/20 text-success">
                  <Database size={24} />
                </div>
                <div>
                  <p className="text-text-dim text-xs">Free Memory</p>
                  <p className="text-xl font-bold">{systemStats?.memFree}</p>
                </div>
              </div>
              <div className="glass-card p-6 flex items-center gap-4">
                <div className="icon-container bg-warning/20 text-warning">
                  <Box size={24} />
                </div>
                <div>
                  <p className="text-text-dim text-xs">Containers</p>
                  <p className="text-xl font-bold">{dockerStatus.length}</p>
                </div>
              </div>
              <div className="glass-card p-6 flex items-center gap-4">
                <div className="icon-container bg-danger/20 text-danger">
                  <HardDrive size={24} />
                </div>
                <div>
                  <p className="text-text-dim text-xs">Services</p>
                  <p className="text-xl font-bold">{dockerStatus.filter(c => !c.isRunning).length} Offline</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {/* Docker Status */}
              <div className="col-span-2 glass-card overflow-hidden">
                <div className="p-6 border-b border-border-color flex justify-between items-center">
                  <h3 className="font-bold">Docker Services</h3>
                  <button
                    disabled={loadingAction}
                    onClick={() => handleAction('restart', opsService.restartBackend)}
                    className="btn-primary text-xs"
                  >
                    {loadingAction === 'restart' ? 'Restarting...' : 'Restart Backend'}
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[400px]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-text-dim border-b border-border-color">
                        <th className="p-2">Name</th>
                        <th className="p-2">Image</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dockerStatus.map(container => (
                        <tr key={container.name} className="border-b border-border-color/50">
                          <td className="p-2 font-semibold">{container.name}</td>
                          <td className="p-2 text-xs text-text-dim">{container.image}</td>
                          <td className="p-2">
                            <span className={`status-badge truncate w-32 inline-block ${container.isRunning ? 'status-up' : 'status-down'}`}>
                              {container.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card p-6">
                <h3 className="font-bold mb-6">Operations</h3>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleAction('rebuild', opsService.rebuildBackend)}
                    disabled={loadingAction}
                    className="flex items-center justify-between p-4 bg-white/5 border border-border-color hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="text-warning" size={20} />
                      <div className="text-left">
                        <p className="text-sm font-bold">Rebuild Stack</p>
                        <p className="text-[10px] text-text-dim">Update & Rebuild services</p>
                      </div>
                    </div>
                  </button>
                  <button className="flex items-center justify-between p-4 bg-white/5 border border-border-color hover:bg-white/10 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <Layout className="text-primary" size={20} />
                      <div className="text-left">
                        <p className="text-sm font-bold">Flush Redis</p>
                        <p className="text-[10px] text-text-dim">Clear system cache</p>
                      </div>
                    </div>
                  </button>
                  <button className="flex items-center justify-between p-4 bg-white/5 border border-border-color hover:bg-white/10 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-success" size={20} />
                      <div className="text-left">
                        <p className="text-sm font-bold">Health Scan</p>
                        <p className="text-[10px] text-text-dim">Run deep diagnostics</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-container glass-card flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b border-border-color bg-black/40 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs font-mono text-text-dim uppercase tracking-widest">Live Stream: eduflex-backend</span>
              </div>
              <button onClick={() => setLogs([])} className="text-xs text-text-dim hover:text-white">Clear</button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto font-mono text-sm custom-scrollbar bg-black/20">
              {logs.length === 0 && <p className="text-text-dim opacity-20">Waiting for data stream...</p>}
              {logs.map((log, i) => (
                <div key={i} className="mb-1">
                  <span className="text-primary opacity-50 mr-2">[{i}]</span>
                  <span className={log.includes('ERROR') ? 'text-danger' : log.includes('WARN') ? 'text-warning' : 'text-text-main'}>
                    {log}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
