import React from 'react';
import NewsletterBox from './NewsletterBox';
import { Star } from 'lucide-react';

export default function Sidebar() {
  const trending = [
    { rank: '01', title: 'The Illusion of Digital Ownership in an Always-Online Economy', views: '1.2k', rating: '4.2' },
    { rank: '02', title: 'Why Remote Work is Failing the Next Generation', views: '2.1k', rating: '3.9' },
    { rank: '03', title: 'The Return of the Personal Website', views: '1.8k', rating: '4.5' },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-10 bg-surface p-10 border-l border-border min-h-screen">
      <div className="sidebar-section">
        <h4 className="text-[12px] uppercase tracking-widest text-text-secondary font-bold mb-6 flex justify-between items-center">
          Trending Today
        </h4>
        <div className="space-y-6">
          {trending.map((item) => (
            <div key={item.rank} className="flex gap-4 group cursor-pointer">
              <div className="font-serif italic text-2xl text-gray-300 min-w-[24px] group-hover:text-text-primary transition-colors">
                {item.rank}
              </div>
              <div>
                <h5 className="text-[14px] font-bold leading-tight mb-1 group-hover:underline">{item.title}</h5>
                <div className="flex items-center gap-2 text-[11px] text-text-secondary font-medium">
                  <span>👁️ {item.views} views</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-0.5"><Star size={10} className="fill-yellow-500 text-yellow-500" /> {item.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h4 className="text-[12px] uppercase tracking-widest text-text-secondary font-bold mb-6">
          Recent Comments
        </h4>
        <div className="space-y-4">
          <div className="text-[13px] border-l-2 border-border pl-3">
             <p className="font-bold text-text-primary mb-1">Sarah J.</p>
             <p className="text-text-secondary leading-normal italic">"The point about licenses vs ownership is exactly why I started buying physical media again..."</p>
          </div>
          <div className="text-[13px] border-l-2 border-border pl-3">
             <p className="font-bold text-text-primary mb-1">Marcus V.</p>
             <p className="text-text-secondary leading-normal italic">"Great analysis. We need better legislative frameworks immediately."</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
