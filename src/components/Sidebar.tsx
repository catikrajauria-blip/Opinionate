import React from 'react';
import NewsletterBox from './NewsletterBox';

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col gap-10 bg-surface p-10 border-l border-border min-h-screen">
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
