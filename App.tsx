
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

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
    process: { env: Record<string, string> };
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
      try {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
          const selected = await window.aistudio.hasSelectedApiKey();
          setIsKeySelected(selected);
        } else {
          const apiKey = process.env.API_KEY;
          setIsKeySelected(!!apiKey);
        }
      } catch (error) {
        setIsKeySelected(false);
      }
    };
    
    checkKey();

    const saved = localStorage.getItem('auraflow_contents');
    if (saved) {
      try {
        setContents(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleOpenKeyDialog = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        setIsKeySelected(true); // 가이드라인: 호출 즉시 성공으로 가정
      } else {
        alert("API 키가 환경 변수에 설정되어 있지 않습니다.");
      }
    } catch (err) {
      setIsKeySelected(true);
    }
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

  if (isKeySelected === false) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[40px] p-12 text-center space-y-10 shadow-2xl">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
              <Newspaper className="text-white w-10 h-10" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">AuraFlow Terminal</h1>
            <p className="text-slate-400 text-sm leading-relaxed">플랫폼 보안을 위해 API 키 설정이 필요합니다. 설정된 키는 환경 변수를 통해 안전하게 관리됩니다.</p>
          </div>
          <button onClick={handleOpenKeyDialog} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all">
            <ShieldCheck size={20} /> API 키 설정하고 시작하기
          </button>
          <div className="pt-6 border-t border-slate-800">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-2 underline">
              <ExternalLink size={12} /> 결제 및 가이드라인 확인
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isKeySelected === null) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <Zap className="text-blue-600 animate-pulse w-12 h-12" />
        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">Connecting to Engine...</p>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${viewMode === 'admin' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'} overflow-hidden`}>
      {viewMode === 'admin' && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onGoToReader={() => setViewMode('reader')} />}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
        {viewMode === 'reader' && (
          <button onClick={() => setViewMode('admin')} className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all z-50">
            <ShieldAlert size={24} />
          </button>
        )}
      </main>
    </div>
  );
};

export default App;