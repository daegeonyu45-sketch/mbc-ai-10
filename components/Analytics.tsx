
import React from 'react';
import { ContentItem } from '../types';
import { BarChart3, TrendingUp, Users, Clock, Award, MousePointer2 } from 'lucide-react';

interface Props {
  contents: ContentItem[];
}

export const Analytics: React.FC<Props> = ({ contents }) => {
  const totalViews = contents.length * 1240; // 가상 데이터
  const avgReliability = 94.2;
  const aiEfficiency = 320; // 320% 향상

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-violet-500 w-8 h-8" />
          <h1 className="text-3xl font-black uppercase tracking-tighter">Engine Analytics</h1>
        </div>
        <p className="text-slate-500 text-sm font-bold">콘텐츠 성과 및 AI 제작 효율성 통계</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Readership', val: totalViews.toLocaleString(), icon: Users, color: 'bg-blue-500', trend: '+12%' },
          { label: 'AI Production Efficiency', val: `${aiEfficiency}%`, icon: Clock, color: 'bg-emerald-500', trend: 'Global Leader' },
          { label: 'Avg Fact Reliability', val: `${avgReliability}%`, icon: Award, color: 'bg-amber-500', trend: 'Verified' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-5 blur-[80px] group-hover:opacity-20 transition-opacity`}></div>
            <stat.icon className="w-6 h-6 text-slate-500 mb-6" />
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-4xl font-black text-white">{stat.val}</h4>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{stat.trend}</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">since last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance by Category */}
        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-8">
          <h3 className="font-black text-xl uppercase tracking-tight flex items-center gap-3">
            <TrendingUp size={20} className="text-blue-500" /> Topic Performance
          </h3>
          <div className="space-y-6">
            {[
              { cat: 'Tech', score: 92 },
              { cat: 'Economy', score: 84 },
              { cat: 'Culture', score: 76 },
              { cat: 'Politics', score: 65 },
              { cat: 'Society', score: 58 },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>{item.cat}</span>
                  <span>{item.score}% Reach</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${item.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Stats */}
        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 space-y-8">
          <h3 className="font-black text-xl uppercase tracking-tight flex items-center gap-3">
            <MousePointer2 size={20} className="text-emerald-500" /> User Interaction
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Share Rate', val: '4.2%', desc: 'Avg per article' },
              { label: 'TTS Usage', val: '68%', desc: 'Reader preference' },
              { label: 'Avg Stay Time', val: '4m 21s', desc: 'Focus duration' },
              { label: 'Feedback Pos.', val: '92%', desc: 'CSAT Score' },
            ].map((card, i) => (
              <div key={i} className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800/50">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
                <p className="text-2xl font-black text-white">{card.val}</p>
                <p className="text-[9px] font-bold text-slate-600 mt-2">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
