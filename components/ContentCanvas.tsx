
import React, { useState, useEffect, useCallback } from 'react';
import { ContentItem } from '../types';
import { SafeImage } from './SafeImage';
import { 
  ArrowLeft, Globe, Play, Square, ShieldCheck, Clock, Zap, 
  Instagram, Video, MessageSquare, ThumbsUp, ThumbsDown, 
  ChevronRight, ChevronLeft, Copy, Share2, ExternalLink, Link as LinkIcon,
  Search, Wand2
} from 'lucide-react';

interface Props {
  content: ContentItem | null;
  onBack: () => void;
  onEdit?: () => void;
  isPreviewMode?: boolean;
  isLoading?: boolean;
}

type Language = 'ko' | 'en' | 'cn' | 'jp';

export const ContentCanvas: React.FC<Props> = ({ content, onBack, onEdit, isPreviewMode = false, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState<'article' | 'osmu' | 'debate'>('article');
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState<Language>('ko');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [vote, setVote] = useState<'pro' | 'con' | null>(null);
  const [proVotes, setProVotes] = useState(124);
  const [conVotes, setConVotes] = useState(89);

  // Keyboard Navigation Support
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (activeTab !== 'osmu' || !content?.cardNews) return;
    
    if (e.key === 'ArrowLeft') {
      setCurrentSlide(prev => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      setCurrentSlide(prev => Math.min(content.cardNews!.length - 1, prev + 1));
    }
  }, [activeTab, content?.cardNews]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!content) return null;

  const translations: Record<Language, { title: string; body: string }> = {
    ko: { title: content.title, body: content.fullText },
    en: { title: `[Global] ${content.title}`, body: content.fullText ? 'Translation active. ' + content.fullText.substring(0, 200) + '...' : '' },
    cn: { title: `[全球] ${content.title}`, body: `报告: ${content.summary}` },
    jp: { title: `[グローバル] ${content.title}`, body: `レポート: ${content.summary}` }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const textToRead = `${translations[language].title}. ${translations[language].body}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVote = (type: 'pro' | 'con') => {
    if (vote) return;
    setVote(type);
    if (type === 'pro') setProVotes(p => p + 1);
    else setConVotes(c => c + 1);
  };

  const totalVotes = proVotes + conVotes;
  const proPercent = Math.round((proVotes / totalVotes) * 100);

  return (
    <div className={`min-h-full ${isPreviewMode ? 'bg-[#F4F1EA] px-4 lg:px-16 pt-12 pb-32' : 'bg-slate-900 pb-20'} transition-all duration-500`}>
      <style>{`
        .article-headline { font-family: 'Noto Serif KR', serif; font-size: 2.8rem; font-weight: 900; line-height: 1.25; color: #1A1A1A; word-break: keep-all; }
        .article-body p { font-family: 'Noto Sans KR', sans-serif; font-size: 1.125rem; line-height: 1.85; color: #333333; margin-bottom: 1.6rem; word-break: keep-all; }
        .article-summary { font-family: 'Noto Serif KR', serif; font-style: italic; font-size: 1.25rem; line-height: 1.7; color: #555555; padding-left: 1.5rem; border-left: 3px solid #1A1A1A; margin: 2rem 0; }
        .mz-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .nav-btn { transition: all 0.3s ease; backdrop-filter: blur(4px); }
        .nav-btn:hover { transform: translateY(-50%) scale(1.1); background-color: rgba(0,0,0,0.8); }
        .dot { transition: all 0.3s ease; }
      `}</style>

      {/* Navigation & Tabs */}
      {!isPreviewMode && (
        <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg text-white">콘텐츠 프리뷰</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-900 p-1 rounded-xl">
              {[
                { id: 'article', label: '뉴스레터', icon: Globe },
                { id: 'osmu', label: 'MZ 타겟팅', icon: Instagram },
                { id: 'debate', label: '커뮤니티', icon: MessageSquare }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setActiveTab(t.id as any)} 
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-10">
        {activeTab === 'article' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <article className="bg-white p-8 lg:p-16 rounded-[40px] shadow-2xl border border-black/5">
              <header className="mb-10 border-b border-black/5 pb-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-blue-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">Live News</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> {new Date().toLocaleDateString()}</span>
                </div>
                <h1 className="article-headline">{translations[language].title}</h1>
                <div className="flex items-center justify-between mt-6">
                  <div className="flex bg-slate-100 p-1 rounded-lg border border-black/5">
                    {(['ko', 'en', 'cn', 'jp'] as Language[]).map(lang => (
                      <button key={lang} onClick={() => setLanguage(lang)} className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${language === lang ? 'bg-black text-white' : 'text-slate-400'}`}>{lang}</button>
                    ))}
                  </div>
                  <button onClick={handleTogglePlay} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black transition-all ${isPlaying ? 'bg-rose-600 text-white' : 'bg-black text-white hover:scale-105'}`}>
                    {isPlaying ? <Square size={12} fill="white"/> : <Play size={12} fill="white"/>} {isPlaying ? '중단' : '오디오 브리핑'}
                  </button>
                </div>
              </header>

              <SafeImage 
                src={content.imageUrl} 
                category={content.category} 
                className="w-full h-auto min-h-[400px] object-cover rounded-3xl mb-10 shadow-lg" 
              />

              <div className="article-summary">{content.summary}</div>
              <div className="article-body">
                {translations[language].body.split('\n').map((p, i) => p && <p key={i}>{p}</p>)}
              </div>

              {/* [Reference] Section */}
              {content.sources && content.sources.length > 0 && (
                <div className="mt-16 pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-6 text-slate-400">
                    <LinkIcon size={16} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">References & Sources</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {content.sources.map((url, i) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                            {i + 1}
                          </div>
                          <span className="text-xs font-bold text-slate-600 truncate">{url}</span>
                        </div>
                        <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>
        )}

        {activeTab === 'osmu' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Instagram Card News Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 rounded-2xl text-white shadow-lg">
                    <Instagram size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">MZ Card News</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Swipe or click to navigate</p>
                  </div>
                </div>
              </div>

              {/* Improved Carousel UI */}
              <div className="relative group/carousel">
                <div className="relative aspect-square max-w-[500px] mx-auto overflow-hidden rounded-[40px] shadow-2xl bg-black mz-card border-8 border-white/10 ring-1 ring-black/5">
                  {content.cardNews && content.cardNews.length > 0 ? (
                    <>
                      {content.cardNews.map((card, idx) => (
                        <div key={idx} className={`absolute inset-0 transition-all duration-700 ease-in-out flex flex-col justify-end text-white ${idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                          <SafeImage src={card.imageUrl} category={content.category} className="absolute inset-0 w-full h-full" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                          
                          {/* Image Type Badge */}
                          <div className="absolute top-8 right-8 z-20">
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${card.imageSourceType === 'search' ? 'bg-blue-600/60 border-blue-400 text-white' : 'bg-violet-600/60 border-violet-400 text-white'}`}>
                              {card.imageSourceType === 'search' ? <><Search size={10} /> Real Photo</> : <><Wand2 size={10} /> AI Generated</>}
                            </span>
                          </div>

                          <div className="relative z-10 p-12 space-y-4">
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/30">Slide {idx + 1}</span>
                            <p className="text-2xl font-black leading-tight serif drop-shadow-lg">{card.sentence}</p>
                          </div>
                        </div>
                      ))}

                      {/* Navigation Arrows */}
                      {currentSlide > 0 && (
                        <button 
                          onClick={() => setCurrentSlide(prev => prev - 1)}
                          className="nav-btn absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center border border-white/20"
                          aria-label="Previous Slide"
                        >
                          <ChevronLeft size={24} />
                        </button>
                      )}
                      
                      {currentSlide < content.cardNews.length - 1 && (
                        <button 
                          onClick={() => setCurrentSlide(prev => prev + 1)}
                          className="nav-btn absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center border border-white/20"
                          aria-label="Next Slide"
                        >
                          <ChevronRight size={24} />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300 font-bold">카드뉴스를 생성 중입니다...</div>
                  )}
                </div>

                {/* Pagination Dots */}
                {content.cardNews && content.cardNews.length > 0 && (
                  <div className="flex justify-center items-center gap-2.5 mt-6">
                    {content.cardNews.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`dot h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Shorts Script Section */}
            <section className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 blur-[100px]"></div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-600 rounded-2xl shadow-lg shadow-rose-900/20">
                    <Video size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">1-Min Shorts Script</h3>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Vertical Video Strategy</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(content.shortFormScript || "");
                    alert('대본이 클립보드에 복사되었습니다.');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/10"
                >
                  <Copy size={14} /> 대본 복사
                </button>
              </div>
              <div className="bg-black/40 rounded-3xl p-8 border border-white/5 font-medium leading-relaxed text-slate-300 italic">
                {content.shortFormScript || "생성된 대본이 없습니다."}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'debate' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-700">
            <header className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-xs font-black uppercase tracking-widest">
                <Zap size={14} className="fill-current" /> Community Hot Topic
              </div>
              <h2 className="text-4xl font-black serif leading-tight px-10">{content.debate?.topic}</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pro/Con Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-emerald-600">
                  <ThumbsUp size={24} className="fill-current opacity-20" />
                  <h4 className="text-lg font-black uppercase tracking-widest">긍정적 측면 (PROS)</h4>
                </div>
                <div className="space-y-4">
                  {content.debate?.pros.map((point, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex gap-4 hover:border-emerald-500 transition-all group">
                      <span className="text-emerald-500 font-black text-sm">{i + 1}.</span>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-rose-600">
                  <ThumbsDown size={24} className="fill-current opacity-20" />
                  <h4 className="text-lg font-black uppercase tracking-widest">비판적 측면 (CONS)</h4>
                </div>
                <div className="space-y-4">
                  {content.debate?.cons.map((point, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm flex gap-4 hover:border-rose-500 transition-all group">
                      <span className="text-rose-500 font-black text-sm">{i + 1}.</span>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Voting Section */}
            <div className="bg-white rounded-[40px] p-12 border border-black/5 shadow-2xl text-center space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">독자 여러분의 의견은 어떠신가요?</h3>
                <p className="text-sm text-slate-500 font-medium">현재 {totalVotes}명 참여</p>
              </div>

              <div className="relative h-16 bg-slate-100 rounded-full overflow-hidden flex items-center px-8 border border-slate-200">
                <div className="absolute inset-0 bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${proPercent}%` }}></div>
                <div className="absolute inset-0 bg-rose-500 transition-all duration-1000 ease-out left-auto" style={{ width: `${100 - proPercent}%` }}></div>
                <div className="absolute inset-0 flex justify-between items-center px-10 text-white font-black text-xl z-10">
                  <span className="flex items-center gap-2"><ThumbsUp size={20} /> {proPercent}%</span>
                  <span className="flex items-center gap-2">{100 - proPercent}% <ThumbsDown size={20} /></span>
                </div>
              </div>

              <div className="flex justify-center gap-6">
                <button onClick={() => handleVote('pro')} disabled={!!vote} className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${vote === 'pro' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-emerald-600 disabled:opacity-50'}`}>
                  <ThumbsUp size={18} /> 찬성 / 공감
                </button>
                <button onClick={() => handleVote('con')} disabled={!!vote} className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${vote === 'con' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white hover:bg-rose-600 disabled:opacity-50'}`}>
                  <ThumbsDown size={18} /> 반대 / 신중
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
