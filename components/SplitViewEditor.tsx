
import React, { useState, useEffect, useRef } from 'react';
import { ContentItem, CategoryType } from '../types';
import { ContentCanvas } from './ContentCanvas';
import { 
  Save, Wand2, Sparkles, Layout, Settings as SettingsIcon,
  Type as TypeIcon, Image as ImageIcon, Check, Loader2, AlertCircle, X
} from 'lucide-react';
import { summarizeContent, generateArticleDraft } from '../services/gemini';

interface Props {
  initialContent: ContentItem | null;
  onSave: (item: ContentItem) => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export const SplitViewEditor: React.FC<Props> = ({ initialContent, onSave }) => {
  const [draft, setDraft] = useState<ContentItem>(initialContent || {
    id: Math.random().toString(36).substr(2, 9),
    title: '',
    category: 'General',
    summary: '',
    fullText: '',
    createdAt: new Date().toISOString(),
    status: 'draft',
    sources: []
  });

  const [status, setStatus] = useState<'idle' | 'typing' | 'saving' | 'saved' | 'generating'>('idle');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [useMockMode, setUseMockMode] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Use any or ReturnType<typeof setTimeout> instead of NodeJS.Timeout to avoid namespace errors in browser environments
  const typingTimer = useRef<any>(null);

  const addToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleChange = (field: keyof ContentItem, value: any) => {
    setDraft(prev => ({ ...prev, [field]: value }));
    setStatus('typing');
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setStatus('idle');
    }, 2000);
  };

  const handleSave = async () => {
    setStatus('saving');
    try {
      await onSave(draft);
      setStatus('saved');
      addToast('변경사항이 안전하게 저장되었습니다.', 'success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      addToast('저장 중 오류가 발생했습니다.', 'error');
      setErrorDetails(err.message || '저장 시스템에 일시적인 장애가 발생했습니다.');
      setStatus('idle');
    }
  };

  const handleAISummarize = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setStatus('generating');
    setErrorDetails(null);
    addToast('AI가 요약을 작성 중입니다...', 'info');
    
    try {
      const summary = await summarizeContent(draft.fullText || draft.title, useMockMode);
      handleChange('summary', summary);
      addToast('요약 생성이 완료되었습니다.', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('요약 생성 중 오류가 발생했습니다.', 'error');
      setErrorDetails(err.message || 'AI 엔진이 응답하지 않습니다. 네트워크를 확인하세요.');
    } finally {
      setIsGenerating(false);
      setStatus('idle');
    }
  };

  const handleAIEnhance = async () => {
    if (isGenerating || !draft.title) {
      if (!draft.title) addToast('먼저 제목(헤드라인)을 입력해주세요.', 'error');
      return;
    }
    setIsGenerating(true);
    setStatus('generating');
    setErrorDetails(null);
    addToast('AI 기사 작성을 시작합니다.', 'info');

    try {
      const enhancedText = await generateArticleDraft(draft.title, '전문적인', 'medium', useMockMode);
      handleChange('fullText', enhancedText);
      addToast('기사 작성이 완료되었습니다!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('기사 작성 중 문제가 발생했습니다.', 'error');
      setErrorDetails(err.message || '생성 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsGenerating(false);
      setStatus('idle');
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-950 relative">
      <style>{`
        .editor-container::-webkit-scrollbar { width: 6px; }
        .editor-container::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-toast { animation: slide-up 0.3s ease-out forwards; }
        .error-box { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* Left Panel: Editor Zone */}
      <div className="w-1/2 flex flex-col border-r border-slate-800 bg-slate-900 editor-container overflow-y-auto">
        <header className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <Layout className="text-blue-500 w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">라이브 에디터</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
              {status === 'typing' && <span className="flex items-center gap-2 text-[10px] text-blue-400 font-bold"><Loader2 size={10} className="animate-spin" /> 작성 중</span>}
              {status === 'saving' && <span className="flex items-center gap-2 text-[10px] text-amber-400 font-bold"><Loader2 size={10} className="animate-spin" /> 저장 중</span>}
              {status === 'saved' && <span className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold"><Check size={10} /> 저장됨</span>}
              {status === 'generating' && <span className="flex items-center gap-2 text-[10px] text-purple-400 font-bold"><Sparkles size={10} className="animate-pulse" /> AI 작업 중</span>}
              {status === 'idle' && <span className="text-[10px] text-slate-500 font-bold">Ready</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <SettingsIcon size={20} />
            </button>
            <button 
              onClick={handleSave}
              disabled={status === 'saving' || isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              {status === 'saving' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              저장하기
            </button>
          </div>
        </header>

        <div className="p-8 space-y-10">
          {/* Error Message Box */}
          {errorDetails && (
            <div className="error-box p-5 bg-rose-950/30 border border-rose-900/50 rounded-2xl flex items-start gap-4">
              <AlertCircle className="text-rose-500 shrink-0 mt-1" size={20} />
              <div className="flex-1 space-y-1">
                <p className="text-xs font-black text-rose-400 uppercase tracking-widest">오류 발생</p>
                <p className="text-sm text-rose-200/80 font-medium leading-relaxed">{errorDetails}</p>
                <button 
                  onClick={() => setErrorDetails(null)}
                  className="text-[10px] font-bold text-rose-400/60 hover:text-rose-400 underline underline-offset-4 pt-2"
                >
                  메시지 닫기
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={handleAISummarize}
              disabled={isGenerating}
              className="flex flex-col items-center justify-center p-5 bg-slate-800/50 rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all border border-slate-700 group"
            >
              <Sparkles className={`w-5 h-5 text-amber-400 mb-2 ${isGenerating && status === 'generating' ? 'animate-pulse' : 'group-hover:scale-110'}`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase">AI 요약</span>
            </button>
            <button 
              onClick={handleAIEnhance}
              disabled={isGenerating}
              className="flex flex-col items-center justify-center p-5 bg-slate-800/50 rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all border border-slate-700 group"
            >
              <Wand2 className={`w-5 h-5 text-emerald-400 mb-2 ${isGenerating && status === 'generating' ? 'animate-bounce' : 'group-hover:scale-110'}`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase">AI 기사 작성</span>
            </button>
            <button className="flex flex-col items-center justify-center p-5 bg-slate-800/50 rounded-2xl hover:bg-slate-800 transition-all border border-slate-700 group">
              <ImageIcon className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">이미지 재생성</span>
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <TypeIcon size={12} /> 헤드라인 (제목)
            </label>
            <input 
              type="text" 
              value={draft.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="뉴스 헤드라인을 입력하세요..."
              className="w-full bg-slate-800/30 border border-slate-700 rounded-2xl p-5 text-white font-bold text-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>

          <div className="space-y-3 pb-10">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">본문 리포팅</label>
            <textarea 
              value={draft.fullText}
              onChange={(e) => handleChange('fullText', e.target.value)}
              placeholder="이곳에 기사 내용을 입력하거나 AI 엔진을 통해 초안을 작성하세요..."
              className="w-full bg-slate-800/30 border border-slate-700 rounded-2xl p-6 text-slate-200 font-medium text-base leading-relaxed outline-none focus:ring-2 focus:ring-blue-600 transition-all h-[500px] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="w-1/2 flex flex-col bg-[#F4F1EA] shadow-2xl overflow-y-auto">
        <header className="p-6 border-b border-black/5 flex items-center justify-between sticky top-0 bg-[#F4F1EA]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 ${isGenerating ? 'bg-blue-600 animate-ping' : 'bg-rose-600'} rounded-full`}></div>
            <h2 className="serif text-sm font-black italic text-[#2C2C2C]">
              {isGenerating ? 'AI News Drafting...' : 'The Ullim Times Preview'}
            </h2>
          </div>
          <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Interactive Paper Mode</span>
        </header>
        <div className="flex-1">
          <ContentCanvas content={draft} onBack={() => {}} isPreviewMode={true} isLoading={isGenerating} />
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden scale-in animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                <SettingsIcon size={20} className="text-blue-500" /> 시스템 설정
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                  * API 키는 환경 변수(process.env.API_KEY)를 통해 자동으로 관리됩니다. 기사 작성이 안 될 경우 테스트 모드를 활용해 보세요.
                </p>
                <div className="flex items-center justify-between p-5 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">테스트 모드 (Mock Data)</p>
                    <p className="text-[10px] text-slate-500">API 호출 없이 더미 데이터를 사용하여 기능을 테스트합니다.</p>
                  </div>
                  <button 
                    onClick={() => setUseMockMode(!useMockMode)}
                    className={`w-12 h-6 rounded-full transition-all relative ${useMockMode ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useMockMode ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-4 bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
              >
                설정 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-3">
        {toasts.map(toast => (
          <div key={toast.id} className={`animate-toast flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl border ${
            toast.type === 'success' ? 'bg-slate-900 text-emerald-400 border-emerald-900/30' : 
            toast.type === 'error' ? 'bg-slate-900 text-rose-400 border-rose-900/30' : 
            'bg-slate-900 text-blue-400 border-blue-900/30'
          }`}>
            {toast.type === 'success' && <Check size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Loader2 size={16} className="animate-spin" />}
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
