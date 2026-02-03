
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { WorkflowDashboard } from './components/WorkflowDashboard';
import { ContentCanvas } from './components/ContentCanvas';
import { AutomationEngine } from './components/AutomationEngine';
import { SplitViewEditor } from './components/SplitViewEditor';
import { DataPipeline } from './components/DataPipeline';
import { Analytics } from './components/Analytics';
import { ContentItem } from './types';
import { ShieldAlert, Newspaper, Lock, ShieldCheck, ExternalLink, Zap } from 'lucide-react';

// Fixed: Use the existing global AIStudio type to prevent declaration conflicts.
declare global {
  interface Window {
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<'admin' | 'reader'>('admin');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'engine' | 'canvas' | 'editor' | 'pipeline' | 'analytics'>('dashboard');
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // The globally pre-configured aistudio object is used to check key selection state.
      const selected = await window.aistudio.hasSelectedApiKey();
      setIsKeySelected(selected);
    };
    checkKey();

    const saved = localStorage.getItem('auraflow_contents');
    if (saved) {
      setContents(JSON.parse(saved));
    }
  }, []);

  const handleOpenKeyDialog = async () => {
    // Open the platform dialog for API key selection.
    await window.aistudio.openSelectKey();
    setIsKeySelected(true); // Assume success after dialog trigger to avoid race conditions.
  };

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

  const handleCreateNew = () => {
    setActiveTab('engine');
    setViewMode('admin');
  };

  const renderContent = () => {
    if (viewMode === 'reader' && activeTab === 'dashboard') {
      return (
        <WorkflowDashboard 
          contents={contents} 
          onView={(item) => {
            setSelectedContent(item);
            setActiveTab('canvas');
          }}
          onCreateNew={handleCreateNew}
          onSwitchToAdmin={() => setViewMode('admin')}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <WorkflowDashboard 
            contents={contents} 
            onView={(item) => {
              setSelectedContent(item);
              setActiveTab('canvas');
            }}
            onCreateNew={handleCreateNew}
            onSwitchToAdmin={() => setViewMode('admin')}
          />
        );
      case 'engine':
        return <AutomationEngine onComplete={(item) => {
          saveContent(item);
          setActiveTab('dashboard');
        }} />;
      case 'editor':
        return <SplitViewEditor 
                 initialContent={selectedContent} 
                 onSave={(item) => {
                   saveContent(item);
                   setActiveTab('dashboard');
                 }}
               />;
      case 'canvas':
        return <ContentCanvas content={selectedContent} onBack={() => setActiveTab('dashboard')} onEdit={() => setActiveTab('editor')} />;
      case 'pipeline':
        return <DataPipeline />;
      case 'analytics':
        return <Analytics contents={contents} />;
      default:
        return <WorkflowDashboard contents={contents} onView={setSelectedContent} onCreateNew={handleCreateNew} onSwitchToAdmin={() => setViewMode('admin')} />;
    }
  };

  // API Key Guard Screen
  if (isKeySelected === false) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
        <style>{`
          .glass-card { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(51, 65, 85, 0.5); }
          .shimmer { background: linear-gradient(90deg, rgba(59, 130, 246, 0) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(59, 130, 246, 0) 100%); background-size: 200% 100%; animation: shimmer 2s infinite; }
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        `}</style>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/30 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/30 blur-[120px] rounded-full"></div>
        </div>

        <div className="w-full max-w-lg glass-card rounded-[40px] shadow-2xl p-12 text-center space-y-10 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/40 transform -rotate-6">
              <Newspaper className="text-white w-10 h-10" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter serif italic">AuraFlow AI Terminal</h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              본 플랫폼은 실시간 뉴스 분석 및 고품질 콘텐츠 생성을 위해 <span className="text-blue-400 font-bold">Google Gemini API</span>를 사용합니다. 보안 가이드에 따라 사용자의 API 키는 코드에 노출되지 않으며, 안전한 연결을 위해 키 설정이 필요합니다.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleOpenKeyDialog}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 active:scale-95 overflow-hidden relative group"
            >
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ShieldCheck size={20} /> API 키 설정하고 시작하기
            </button>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Selected keys are encrypted and managed by the platform</p>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col items-center gap-4">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-2 underline underline-offset-4"
            >
              <ExternalLink size={12} /> 결제 및 API 사용 관련 가이드 (Billing Docs)
            </a>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-full border border-slate-800">
              <Lock size={10} className="text-emerald-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Military-grade Sandbox Security</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while checking key
  if (isKeySelected === null) {
    return <div className="h-screen w-screen bg-slate-950 flex items-center justify-center"><Zap className="text-blue-600 animate-pulse w-12 h-12" /></div>;
  }

  return (
    <div className={`flex h-screen transition-colors duration-500 ${viewMode === 'admin' ? 'bg-slate-900 text-slate-100' : 'bg-[#fdfdfd] text-[#1a1a1a]'} overflow-hidden`}>
      {/* Admin Sidebar - Only visible in Admin Mode */}
      {viewMode === 'admin' && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onGoToReader={() => setViewMode('reader')}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-hidden relative transition-all duration-500 ${viewMode === 'admin' ? 'bg-slate-950/50 backdrop-blur-sm' : 'bg-transparent'}`}>
        <div className="animate-in fade-in duration-700 h-full overflow-y-auto scroll-smooth">
          {renderContent()}
        </div>

        {/* Floating Admin Return Button (Only in Reader Mode) */}
        {viewMode === 'reader' && (
          <button 
            onClick={() => setViewMode('admin')}
            className="fixed bottom-8 right-8 bg-[#1a1a1a] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 group flex items-center gap-2"
            title="편집국(Admin)으로 돌아가기"
          >
            <ShieldAlert className="w-6 h-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-xs whitespace-nowrap">편집국 입장</span>
          </button>
        )}
      </main>
    </div>
  );
};

export default App;
