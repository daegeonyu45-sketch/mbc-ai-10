
import React, { useState } from 'react';
import { ContentItem, CategoryType } from '../types';
import { SafeImage } from './SafeImage';
import { Plus, Clock, TrendingUp, Search, Zap, Newspaper, Settings } from 'lucide-react';

interface Props {
  contents: ContentItem[];
  onView: (item: ContentItem) => void;
  onCreateNew: () => void;
  onSwitchToAdmin: () => void;
}

const CATEGORIES: { id: CategoryType | 'All'; label: string; color: string }[] = [
  { id: 'All', label: '전체보기', color: 'bg-slate-500' },
  { id: 'Politics', label: '정치', color: 'bg-rose-600' },
  { id: 'Economy', label: '경제', color: 'bg-blue-600' },
  { id: 'Society', label: '사회', color: 'bg-emerald-600' },
  { id: 'Tech', label: 'IT/과학', color: 'bg-violet-600' },
  { id: 'Culture', label: '문화', color: 'bg-amber-600' },
];

export const WorkflowDashboard: React.FC<Props> = ({ contents, onView, onCreateNew, onSwitchToAdmin }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');

  const filteredContents = selectedCategory === 'All' 
    ? contents 
    : contents.filter(c => c.category === selectedCategory);

  const heroNews = contents[0];
  const rankingNews = contents.slice(1, 6);

  return (
    <div className="bg-[#fdfdfd] min-h-screen text-[#1a1a1a] transition-all duration-700">
      <header className="border-b-4 border-double border-slate-900 mx-auto max-w-[1400px] py-12 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6 px-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Established 2025</div>
          <div className="flex items-center gap-3">
            <Newspaper className="w-12 h-12 text-[#1a1a1a]" />
            <h1 className="serif text-7xl font-black tracking-tighter uppercase italic leading-none">The Ullim Times</h1>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Edition No. 124</div>
        </div>
        <div className="w-full flex justify-between items-center text-[11px] font-bold border-t border-slate-300 pt-3 px-4 uppercase tracking-widest text-slate-500">
          <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
          <span className="text-slate-900 font-black animate-pulse">● LIVE AI STREAMING</span>
          <span>Seoul, South Korea</span>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-8 lg:p-12 space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            {heroNews ? (
              <div onClick={() => onView(heroNews)} className="group cursor-pointer space-y-6">
                <div className="relative overflow-hidden rounded-lg border border-slate-200 shadow-xl">
                  <SafeImage 
                    src={heroNews.imageUrl} 
                    category={heroNews.category} 
                    className="w-full aspect-[16/9] transition-transform duration-1000 group-hover:scale-105" 
                  />
                  <div className="absolute top-6 left-6 z-20">
                    <span className={`${CATEGORIES.find(c => c.id === heroNews.category)?.color} text-white px-4 py-1.5 text-[11px] font-black uppercase tracking-widest shadow-lg`}>
                      {heroNews.category}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="serif text-6xl font-black leading-[1.1] group-hover:text-blue-800 transition-colors">
                    {heroNews.title}
                  </h2>
                  <p className="text-2xl text-slate-600 leading-relaxed font-medium line-clamp-3 serif italic opacity-80">
                    {heroNews.summary}
                  </p>
                  <div className="flex items-center gap-6 text-[11px] font-black text-slate-400 border-t border-slate-100 pt-4">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(heroNews.createdAt).toLocaleTimeString()} UPDATED</span>
                    <span className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100"><Zap className="w-3 h-3 fill-current" /> EDITORIAL PICK</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[500px] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 rounded-lg">
                <p className="serif text-3xl font-bold mb-4 opacity-50">현재 신문 1면이 비어있습니다.</p>
                <button onClick={onCreateNew} className="px-8 py-3 bg-[#1a1a1a] text-white font-bold rounded-full hover:scale-105 transition-all flex items-center gap-2 shadow-xl">
                  기사 작성 시작 <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 border-l border-slate-200 pl-10">
            <h3 className="serif text-2xl font-black border-b-4 border-slate-900 pb-3 mb-8 uppercase flex items-center justify-between">
              실시간 랭킹 <TrendingUp className="w-6 h-6 text-rose-600" />
            </h3>
            <div className="space-y-8">
              {rankingNews.map((news, idx) => (
                <div key={news.id} onClick={() => onView(news)} className="group flex gap-6 cursor-pointer items-start">
                  <span className="serif text-5xl font-black text-slate-100 group-hover:text-blue-600 transition-colors leading-none">{idx + 1}</span>
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg leading-tight group-hover:underline decoration-blue-500 underline-offset-4 line-clamp-2 serif">
                      {news.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{news.category}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-16 p-8 bg-slate-50 border border-slate-200 rounded-lg space-y-5">
              <div className="flex items-center gap-2 text-blue-700">
                <Settings className="w-5 h-5" />
                <h5 className="serif text-xl font-black uppercase italic">The Desk</h5>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">관리자 전용 AI 엔진을 통해 심층 보도를 직접 편집하고 발행할 수 있습니다.</p>
              <button onClick={onSwitchToAdmin} className="w-full bg-[#1a1a1a] text-white py-4 rounded-lg font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-700 transition-all">편집국 접속</button>
            </div>
          </div>
        </section>

        <section className="pt-20 border-t-2 border-slate-200 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="flex bg-slate-100 p-1.5 rounded-lg gap-1.5 border border-slate-200">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat.id ? 'bg-[#1a1a1a] text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}>{cat.label}</button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="기사 본문 검색..." className="bg-transparent border-b-2 border-slate-200 pl-12 pr-6 py-3 text-sm font-bold focus:border-blue-600 outline-none w-80" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {filteredContents.map(item => (
              <div key={item.id} onClick={() => onView(item)} className="group cursor-pointer border-b border-slate-100 pb-8 last:border-0 hover:border-blue-200 transition-colors">
                <div className="aspect-[16/10] overflow-hidden bg-slate-50 mb-6 rounded-lg shadow-sm">
                  <SafeImage 
                    src={item.imageUrl} 
                    category={item.category} 
                    className="w-full h-full group-hover:scale-110 transition-transform duration-1000" 
                  />
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest border-b-2 border-blue-100">{item.category}</span>
                  <h4 className="serif text-2xl font-black leading-[1.2] group-hover:text-blue-700 transition-colors line-clamp-2">{item.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-medium">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-[#1a1a1a] text-slate-500 py-20 px-12 mt-32 border-t-8 border-blue-900">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Zap className="text-blue-500 w-8 h-8 fill-current" />
              <span className="serif text-3xl font-black text-white italic">ULLIM TIMES</span>
            </div>
            <p className="text-xs leading-loose opacity-60">울림 타임즈는 생성형 AI 기술을 활용하여 24시간 끊김 없는 글로벌 뉴스를 전달합니다.</p>
          </div>
          <div className="text-[9px] uppercase tracking-widest leading-loose opacity-40">
            &copy; 2025 AuraFlow AI Multimedia Group. <br/> Certified by Digital Journalism Ethics Board.
          </div>
        </div>
      </footer>
    </div>
  );
};
