
import React, { useState } from 'react';
import { WorkflowStatus, ContentItem, CategoryType } from '../types';
import { 
  conductAIGroundingSearch, generateArticleDraft, generateIllustrativeImage, 
  summarizeContent, generateOSMUContent, performFactCheck, 
  extractDebatePoints, classifyArticle, fetchNewsImages, generateAIImage 
} from '../services/gemini';
import { Zap, ChevronRight, ShieldCheck, Search, Globe, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  onComplete: (item: ContentItem) => void;
}

export const AutomationEngine: React.FC<Props> = ({ onComplete }) => {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<WorkflowStatus>(WorkflowStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<{ msg: string; type: 'info' | 'success' | 'error' }[]>([]);
  const [config, setConfig] = useState({ tone: '전문적인', length: 'medium', includeImages: true });

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { msg, type }]);
  };

  const startWorkflow = async () => {
    if (!keyword) return;
    setLogs([]);
    setStatus(WorkflowStatus.CRAWLING);
    setProgress(5);
    addLog('엔진 기동: 실시간 뉴스 검색(RAG) 파이프라인을 활성화합니다.', 'info');

    try {
      const updateProgress = async (val: number, log?: string, logType: any = 'info') => {
        setProgress(val);
        if (log) addLog(log, logType);
        await new Promise(r => setTimeout(r, 100));
      };

      // 1. 데이터 수집 및 검색
      await updateProgress(10, 'Google Search 도구를 통해 실시간 데이터를 수집 중...', 'info');
      const searchResult = await conductAIGroundingSearch(keyword);
      if (searchResult.sources.length === 0) {
        addLog('관련된 최신 기사를 찾을 수 없어 일반 지식 기반으로 작성합니다.', 'error');
      } else {
        addLog(`${searchResult.sources.length}개의 신뢰할 수 있는 출처를 확보했습니다.`, 'success');
      }
      
      // 2. 기사 초안 작성 (Context 주입)
      await updateProgress(30, '확보된 데이터를 바탕으로 팩트 기반 기사 초안 작성 중...', 'info');
      const draft = await generateArticleDraft(searchResult.text, config.tone, config.length);
      
      // 3. 분류 및 요약
      await updateProgress(50, '콘텐츠 카테고리 분석 및 요약 생성 중...', 'info');
      const category = await classifyArticle(draft);
      const summary = await summarizeContent(draft);
      
      // 4. 비주얼 에셋 및 부가 콘텐츠 (하이브리드 시스템 적용)
      await updateProgress(70, 'AI 일러스트 생성 및 카드뉴스 스마트 라우팅 중...', 'info');
      const [mainImg, debate, osmu] = await Promise.all([
        generateIllustrativeImage(keyword),
        extractDebatePoints(draft),
        generateOSMUContent(draft)
      ]);

      // 카드뉴스 이미지 소스 할당 (Search vs Generate)
      const processedCardNews = osmu.slides.map((slide: any) => {
        const url = slide.image_source_type === 'search' 
          ? fetchNewsImages(slide.image_keyword)
          : generateAIImage(slide.image_keyword);
        
        return {
          sentence: slide.text,
          imageUrl: url,
          imageSourceType: slide.image_source_type,
          imageKeyword: slide.image_keyword
        };
      });
      
      // 5. 최종 검증
      await updateProgress(90, '기사 신뢰도 검증 및 팩트 체크 수행 중...', 'info');
      const factCheck = await performFactCheck(searchResult.text, draft);

      await updateProgress(100, '전 공정 완료. 실시간 보도가 준비되었습니다.', 'success');
      
      const newItem: ContentItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: keyword,
        category: category,
        summary,
        fullText: draft,
        imageUrl: mainImg,
        cardNews: processedCardNews,
        shortFormScript: osmu.script,
        factCheck: factCheck,
        debate: debate,
        createdAt: new Date().toISOString(),
        status: 'published',
        sources: searchResult.sources
      };

      setStatus(WorkflowStatus.COMPLETED);
      setTimeout(() => onComplete(newItem), 800);

    } catch (error: any) {
      addLog(`에러 발생: ${error.message}`, 'error');
      setStatus(WorkflowStatus.FAILED);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-slate-200 rounded-[40px] shadow-2xl overflow-hidden text-slate-900">
        <div className="p-10 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Zap className="text-blue-600 w-6 h-6 fill-current" />
              <h2 className="text-2xl font-black tracking-tight serif uppercase italic">AI Live News Center</h2>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Hybrid Real-time Engine v2.5</p>
          </div>
          {status === WorkflowStatus.COMPLETED && <CheckCircle2 className="text-emerald-500 w-10 h-10 animate-bounce" />}
        </div>

        <div className="p-10 space-y-8">
          {status === WorkflowStatus.IDLE || status === WorkflowStatus.FAILED ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Main Keyword / Topic</label>
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
                    placeholder="예: 손흥민 프리미어리그, 인공지능 윤리 논쟁..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 pl-16 pr-8 outline-none focus:border-blue-600 focus:bg-white transition-all text-xl font-bold placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <Globe className="text-blue-500 w-5 h-5 mb-3" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Source Reliability</p>
                  <p className="text-sm font-bold">Hybrid Search Active</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <ShieldCheck className="text-violet-500 w-5 h-5 mb-3" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Visual Router</p>
                  <p className="text-sm font-bold">Search vs Generate</p>
                </div>
              </div>

              <button 
                onClick={startWorkflow} 
                disabled={!keyword}
                className="w-full bg-[#1a1a1a] text-white py-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-30"
              >
                하이브리드 보도 생성 시작 <ChevronRight />
              </button>
            </div>
          ) : (
            <div className="space-y-10 py-10">
              <div className="text-center space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] animate-pulse">{status}</p>
                <h3 className="text-5xl font-black text-slate-900">{progress}%</h3>
              </div>

              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-1">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out shadow-lg shadow-blue-500/50" style={{ width: `${progress}%` }}></div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 h-48 overflow-y-auto space-y-3 font-mono text-[11px] border border-slate-800 shadow-inner">
                {logs.map((log, i) => (
                  <div key={i} className={`flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300 ${log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-rose-400' : 'text-slate-400'}`}>
                    <span className="shrink-0 text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                    <span className="font-bold">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
