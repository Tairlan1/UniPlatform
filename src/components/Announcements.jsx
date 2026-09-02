import React, { useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { ANNOUNCEMENTS } from "../data/university";
import { fmtDate } from "../utils/format";

function Announcements() {
  const [openId, setOpenId] = useState(null);
  return (
    <div className="space-y-3">
      {ANNOUNCEMENTS.map((n) => {
        const open = openId === n.id;
        return (
          <div key={n.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <button onClick={() => setOpenId(open ? null : n.id)} className="w-full text-left p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Bell size={16} className="text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">{n.scope}</span>
                  <span className="text-[11px] text-slate-400">{n.author} · {fmtDate(n.date)}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{n.title}</p>
              </div>
              <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{n.text}</div>}
          </div>
        );
      })}
    </div>
  );
}

export default Announcements;
