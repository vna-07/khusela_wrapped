import React from 'react';
import { Shield, AlertTriangle, Activity, Database, ChevronRight, CheckCircle2, Search, Bell } from 'lucide-react';

export default function AdminConsole({ onSwitchToOwner }) {
  return (
    <div className="flex h-screen bg-obsidian font-sans text-white overflow-hidden">
      
      {/* ADMIN SIDEBAR */}
      <aside className="w-[260px] bg-[#0a0d10] border-r border-white/5 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-[80px] flex items-center px-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded border-2 border-mint flex items-center justify-center">
                <Shield size={16} className="text-mint" />
              </div>
              <div>
                <h1 className="text-white text-sm font-bold tracking-[0.15em]">CONTROL</h1>
                <p className="text-[10px] text-slate tracking-wide">Admin Console</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1 mt-2">
            <AdminNavItem icon={<Activity size={18} />} label="Platform Overview" active />
            <AdminNavItem icon={<AlertTriangle size={18} />} label="Review Queue" badge="3" />
            <AdminNavItem icon={<Database size={18} />} label="Detection Lab" />
            <AdminNavItem icon={<Shield size={18} />} label="Threat Intelligence" />
            <AdminNavItem icon={<CheckCircle2 size={18} />} label="Audit Logs" />
          </nav>
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={onSwitchToOwner}
            className="w-full bg-graphite text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            ← Back to Owner View
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[80px] border-b border-white/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-mint/10 text-mint text-xs px-3 py-1.5 rounded-full font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse"></div> Systems Operational
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Search size={18} className="text-slate" />
             <Bell size={18} className="text-slate" />
             <div className="w-8 h-8 rounded-full bg-graphite flex items-center justify-center border border-white/10 text-xs font-bold text-mint">
                SA
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Platform Operations</h2>
              <p className="text-slate text-sm">Live telemetry and incident review queue.</p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-4 gap-4">
              <AdminMetric title="Queue depth" value="12" desc="Jobs awaiting processing" />
              <AdminMetric title="Failed jobs" value="2" desc="Require investigation" alert />
              <AdminMetric title="Webhook errors" value="0" desc="In the demo window" />
              <AdminMetric title="AI fallback" value="3" desc="Template responses used" />
            </div>

            {/* Review Queue */}
            <div className="bg-[#0a0d10] border border-white/10 rounded-xl overflow-hidden mt-8">
              <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold text-sm">Review Queue</h3>
                <button className="text-xs text-mint hover:text-white font-semibold transition">View all →</button>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs text-slate uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5 font-semibold">Incident ID</th>
                    <th className="py-3 px-5 font-semibold">Type</th>
                    <th className="py-3 px-5 font-semibold">Status</th>
                    <th className="py-3 px-5 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AdminRow id="INC-1042" type="Reported payment scam" status="NEW" />
                  <AdminRow id="INC-1041" type="Supplier impersonation" status="REVIEW" />
                  <AdminRow id="INC-1039" type="Possible repeated screenshot" status="CHECK" />
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

function AdminNavItem({ icon, label, active, badge }) {
  return (
    <button className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-medium ${
      active ? 'bg-graphite text-mint' : 'text-slate hover:text-white hover:bg-white/5'
    }`}>
      <div className="flex items-center gap-3">
        {icon} {label}
      </div>
      {badge && <span className="bg-stop text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{badge}</span>}
    </button>
  );
}

function AdminMetric({ title, value, desc, alert }) {
  return (
    <div className="bg-[#0a0d10] border border-white/10 rounded-xl p-5 shadow-lg">
      <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-2">{title}</h4>
      <div className={`text-3xl font-bold mb-1 ${alert ? 'text-stop' : 'text-white'}`}>{value}</div>
      <div className="text-xs text-slate font-medium">{desc}</div>
    </div>
  );
}

function AdminRow({ id, type, status }) {
  const badgeColor = 
    status === 'NEW' ? 'bg-info/20 text-info' : 
    status === 'REVIEW' ? 'bg-wait/20 text-wait' : 'bg-slate/20 text-slate';

  return (
    <tr className="hover:bg-white/5 transition-colors cursor-pointer group">
      <td className="py-4 px-5 font-bold text-gray-300">{id}</td>
      <td className="py-4 px-5 text-gray-400">{type}</td>
      <td className="py-4 px-5">
        <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${badgeColor}`}>
          {status}
        </span>
      </td>
      <td className="py-4 px-5">
        <button className="text-xs font-bold text-mint flex items-center gap-1 group-hover:text-white transition">
          Inspect <ChevronRight size={14} />
        </button>
      </td>
    </tr>
  );
}