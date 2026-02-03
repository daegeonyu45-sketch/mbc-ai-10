
import React, { useState } from 'react';
import { Database, Search, RefreshCw, Server, Shield, Terminal, Globe, HardDrive } from 'lucide-react';

export const DataPipeline: React.FC = () => {
  const [isCrawling, setIsCrawling] = useState(false);
  const [logs, setLogs] = useState<{ time: string; msg: string; type: string }[]>([
    { time: '10:45:21', msg: 'System initialized. Waiting for task.', type: 'info' },
  ]);

  const addLog = (msg: string, type: string = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 50));
  };

  const simulateCrawling = async () => {
    setIsCrawling(true);
    addLog('Starting global data harvest...', 'info');
    await new Promise(r => setTimeout(r, 1000));
    addLog('Connecting to 24 worldwide news RSS feeds.', 'success');
    await new Promise(r => setTimeout(r, 1500));
    addLog('Preprocessing 1,242 raw HTML documents.', 'info');
    await new Promise(r => setTimeout(r, 1200));
    addLog('Vectorizing data for semantic search indexing.', 'info');
    await new Promise(r => setTimeout(r, 800));
    addLog('Database synchronization completed. 42 new insights found.', 'success');
    setIsCrawling(false);
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Database className="text-blue-500 w-8 h-8" />
            <h1 className="text-3xl font-black uppercase tracking-tighter">Data Pipeline</h1>
          </div>
          <p className="text-slate-500 text-sm font-bold">실시간 정보 수집 및 원천 데이터 정제 시스템</p>
        </div>
        <button 
          onClick={simulateCrawling}
          disabled={isCrawling}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20"
        >
          {isCrawling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          즉시 데이터 동기화
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Dashboard */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Uptime', val: '99.9%', icon: Server, color: 'text-emerald-500' },
              { label: 'Requests/m', val: '12.4k', icon: Globe, color: 'text-blue-500' },
              { label: 'Storage', val: '2.1TB', icon: HardDrive, color: 'text-amber-500' },
              { label: 'Security', val: 'Active', icon: Shield, color: 'text-emerald-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <stat.icon className={`w-5 h-5 mb-4 ${stat.color}`} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.val}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
              <Terminal className="text-slate-500 w-4 h-4" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live System Console</span>
            </div>
            <div className="p-6 h-[400px] overflow-y-auto font-mono text-[11px] space-y-2 bg-black/30">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-slate-600 shrink-0">[{log.time}]</span>
                  <span className={log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-rose-400' : 'text-slate-300'}>
                    {log.msg}
                  </span>
                </div>
              ))}
              {isCrawling && <div className="animate-pulse text-blue-400">Processing incoming data stream...</div>}
            </div>
          </div>
        </div>

        {/* Sources Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8">
          <h3 className="font-black text-lg uppercase tracking-tight">Data Sources</h3>
          <div className="space-y-4">
            {[
              { name: 'Global News RSS', status: 'Healthy', type: 'Feed' },
              { name: 'Twitter API v2', status: 'Healthy', type: 'Social' },
              { name: 'Financial Markets', status: 'Standby', type: 'Real-time' },
              { name: 'Tech Blog Scraper', status: 'Degraded', type: 'Crawler' },
              { name: 'Government Archives', status: 'Healthy', type: 'Document' },
            ].map((source, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800/50 rounded-2xl">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">{source.name}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase">{source.type}</p>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                  source.status === 'Healthy' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 
                  source.status === 'Degraded' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 
                  'bg-slate-500/10 border-slate-500/30 text-slate-500'
                }`}>
                  {source.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            새 소스 연결
          </button>
        </div>
      </div>
    </div>
  );
};
