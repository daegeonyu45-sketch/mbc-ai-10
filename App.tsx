
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { WorkflowDashboard } from './components/WorkflowDashboard';
import { ContentCanvas } from './components/ContentCanvas';
import { AutomationEngine } from './components/AutomationEngine';
import { SplitViewEditor } from './components/SplitViewEditor';
import { DataPipeline } from './components/DataPipeline';
import { Analytics } from './components/Analytics';
import { ContentItem } from './types';
import { ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  // 1. 상태 정의
  const [viewMode, setViewMode] = useState<'admin' | 'reader'>('admin');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'engine' | 'canvas' | 'editor' | 'pipeline' | 'analytics'>('dashboard');
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  // 2. 로컬 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem('auraflow_contents');
    if (saved) {
      try {
        setContents(JSON.parse(saved));
      } catch (e) {
        console.error("데이터 로드 실패:", e);
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

  /**
   * Handle API Key selection using the Google aistudio utility as per guidelines.
   * This replaces the custom manual entry UI.
   */
  const handleOpenKeySelection = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
    }
  };

  // 3. 화면 전환 로직 (if문 없이 함수로 처리)
  const renderMainView = () => {
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
        return <WorkflowDashboard contents={contents} onView={(item) => { setSelectedContent(item); setActiveTab('canvas'); }} onCreateNew={() => setActiveTab('engine')} onSwitchToAdmin={() => setViewMode('admin')} />;
    }
  };

  // 4. 무조건 렌더링 (차단 로직 없음)
  return (
    <div className={`flex h-screen ${viewMode === 'admin' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'} overflow-hidden relative font-['Noto_Sans_KR']`}>
      
      {/* 관리자 사이드바 - admin 모드일 때만 표시 */}
      {viewMode === 'admin' && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onGoToReader={() => setViewMode('reader')} 
          onOpenSettings={handleOpenKeySelection}
        />
      )}
      
      {/* 메인 작업 영역 - 항상 표시 */}
      <main className="flex-1 overflow-y-auto">
        {renderMainView()}
        
        {/* 리더 모드 전용 플로팅 버튼 */}
        {viewMode === 'reader' && (
          <button 
            onClick={() => setViewMode('admin')} 
            className="fixed bottom-8 right-8 bg-slate-900 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all z-[9999] flex items-center gap-3 border border-slate-700"
          >
            <ShieldAlert size={24} />
            <span className="font-bold text-sm">편집국 복귀</span>
          </button>
        )}
      </main>
    </div>
  );
};

export default App;
