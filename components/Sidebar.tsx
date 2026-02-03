
import React, { useState } from 'react';
import { LayoutDashboard, Zap, FileText, Layers, BarChart3, Settings, Newspaper, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onGoToReader: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onGoToReader, onOpenSettings }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'editor', label: '라이브 에디터', icon: FileText },
    { id: 'engine', label: 'AI 엔진', icon: Zap },
    { id: 'pipeline', label: '데이터 파이프라인', icon: Layers },
    { id: 'analytics', label: '통계 분석', icon: BarChart3 },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 relative z-50`}>
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-blue-600 text-white p-1 rounded-full shadow-lg z-50 hover:bg-blue-500 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`p-8 flex flex-col gap-1 border-b border-slate-800/50 ${isCollapsed ? 'items-center px-4' : ''}`}>
        <div className="flex items-center gap-3">
          <Newspaper className="text-blue-500 w-6 h-6 shrink-0" />
          {!isCollapsed && <h1 className="serif text-2xl font-black italic tracking-tighter text-white">The Ullim Desk</h1>}
        </div>
        {!isCollapsed && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-9">AI Newsroom Terminal</p>}
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`} />
            {!isCollapsed && <span className="font-bold text-sm truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className={`p-4 space-y-3 ${isCollapsed ? 'items-center' : ''} border-t border-slate-800/50`}>
        <button 
          onClick={onGoToReader}
          className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all group ${isCollapsed ? 'px-0 justify-center border-0 bg-transparent hover:bg-slate-800' : ''}`}
          title={isCollapsed ? "신문 지면 바로가기" : ""}
        >
          <div className="flex items-center gap-3">
            <Newspaper className="w-5 h-5 text-blue-400 shrink-0" />
            {!isCollapsed && <span className="font-bold text-xs uppercase tracking-wider">지면 보기</span>}
          </div>
          {!isCollapsed && <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />}
        </button>
        
        <button 
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-bold text-xs uppercase tracking-wider">API Key</span>}
        </button>
      </div>
    </aside>
  );
};
