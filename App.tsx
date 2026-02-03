
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { WorkflowDashboard } from './components/WorkflowDashboard';
import { ContentCanvas } from './components/ContentCanvas';
import { AutomationEngine } from './components/AutomationEngine';
import { SplitViewEditor } from './components/SplitViewEditor';
import { DataPipeline } from './components/DataPipeline';
import { Analytics } from './components/Analytics';
import { ContentItem } from './types';
import { ShieldAlert, X, ShieldCheck, Key, Save } from 'lucide-react';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'admin' | 'reader'>('admin');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'engine' | 'canvas' | 'editor' | 'pipeline' | 'analytics'>('dashboard');
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  
  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempKey, setTempKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');

  useEffect(() => {
    const saved = localStorage.getItem('auraflow_contents');
    if (saved) {
      try {
        setContents(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved contents", e);
      }
    }
  }, []);

  const saveContent = (item: ContentItem) => {
    const existingIndex = contents.findIndex(c => c.id === item.id);
    let newContents;
    if (existingIndex >= 0) {
      newContents = [...contents];
      newContents[existingIndex] = item;
    } else {
      newContents = [item, ...contents];
    }
    setContents(newContents);
    localStorage.setItem('auraflow_contents', JSON.stringify(newContents));
  };

  const handleSaveKeys = () => {
    if (tempKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', tempKey.trim());
      alert("API 키가 안전하게 저장되었습니다.");
      setIsSettingsOpen(false);
    } else {
      alert("유효한 API 키를 입력해주세요.");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <WorkflowDashboard contents={contents} onView={(item) => { setSelectedContent(item); setActiveTab('canvas'); }} onCreateNew={() => setActiveTab('engine')} onSwitchToAdmin={() => setViewMode('admin')} />;
      case 'engine':
        return <AutomationEngine onComplete={(item) => { saveContent(item); setActiveTab('dashboard'); }} />;
      case 'editor':
        return <SplitViewEditor initialContent={selectedContent} onSave={(item) => { saveContent(item); setActiveTab('dashboard'); }} />;
      case 'canvas':
        return <ContentCanvas content={selectedContent} onBack={() => setActiveTab('dashboard')} onEdit={() => setActiveTab('editor')} />;
      case 'pipeline':
        return <DataPipeline />;
      case 'analytics':
        return <Analytics contents={contents} />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen ${viewMode === 'admin' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'} overflow-hidden relative font-['Noto_Sans_KR']`}>
      {/* Main Layout (Always Rendered) */}
      {viewMode === 'admin' && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onGoToReader={() => setViewMode('reader')} 
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}
      
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
        {viewMode === 'reader' && (
          <button onClick={() => setViewMode('admin')} className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all z-50">
            <ShieldAlert size={24} />
          </button>
        )}
      </main>

      {/* API Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl overflow-hidden scale-in animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <ShieldCheck size={24} className="text-blue-500" /> API ENGINE CONFIG
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Key size={12} /> Google Gemini API Key
                </label>
                <input 
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AI-xxxx..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-5 text-white font-mono text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  * 입력하신 키는 브라우저의 localStorage에만 저장되며, 어떠한 서버로도 전송되지 않습니다.
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-4 bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-700 transition-all border border-slate-700"
                >
                  취소
                </button>
                <button 
                  onClick={handleSaveKeys}
                  className="flex-1 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                  <Save size={16} /> 설정 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
