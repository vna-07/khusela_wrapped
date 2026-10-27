import React, { useState } from 'react';
import { 
  Search, Bell, Home, Shield, MessageSquare, AlertCircle, 
  Settings, ChevronRight, CheckCircle2, AlertTriangle, 
  X, Smartphone
} from 'lucide-react';
import CheckPaymentModal from './components/CheckPaymentModal';

export default function App() {
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-obsidian">
      
      {/* ================= LEFT SIDEBAR (OBSIDIAN) ================= */}
      <aside className="w-[260px] bg-obsidian flex flex-col justify-between shrink-0">
        <div>
          <div className="h-[80px] flex items-center px-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 grid grid-cols-2 gap-0.5 transform rotate-45">
                <div className="bg-mint rounded-tl-full rounded-bl-full"></div>
                <div className="bg-white rounded-tr-full rounded-br-full"></div>
                <div className="bg-white rounded-tl-full rounded-bl-full"></div>
                <div className="bg-mint rounded-tr-full rounded-br-full"></div>
              </div>
              <div>
                <h1 className="text-white text-base font-bold tracking-[0.15em]">KHUSELA</h1>
                <p className="text-[10px] text-slate tracking-wide">Security workspace</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1 mt-2">
            <NavItem icon={<Home size={18} />} label="Overview" active />
            <div onClick={() => setIsCheckModalOpen(true)}>
              <NavItem icon={<AlertCircle size={18} />} label="Check payment" />
            </div>
            <NavItem icon={<MessageSquare size={18} />} label="Message & link scan" />
            <NavItem icon={<Shield size={18} />} label="Incident centre" />
            <NavItem icon={<CheckCircle2 size={18} />} label="Security coach" />
            <NavItem icon={<Settings size={18} />} label="Settings" />
          </nav>
        </div>

        <div className="p-5">
          <div className="bg-graphite rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate">Readiness</span>
              <ChevronRight size={14} className="text-slate" />
            </div>
            <div className="text-2xl font-bold text-white mb-3 tracking-tight">72<span className="text-sm text-slate font-normal">/100</span></div>
            <div className="h-1.5 w-full bg-obsidian rounded-full overflow-hidden">
              <div className="h-full bg-mint w-[72%] rounded-full transition-all duration-1000 ease-out"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN WORKSPACE (PORCELAIN/WHITE) ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        
        <header className="h-[80px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" size={18} />
            <input 
              type="text" 
              placeholder="Search incidents, transactions..." 
              className="w-full bg-slate-100 text-sm text-obsidian rounded-lg py-2.5 pl-10 pr-4 border border-transparent focus:outline-none focus:bg-white focus:border-mint-dark focus:ring-1 focus:ring-mint-dark transition-all"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-slate hover:text-obsidian transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-stop rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="w-9 h-9 rounded-full bg-obsidian text-mint flex items-center justify-center font-bold text-sm">
                T
              </div>
              <div>
                <p className="text-sm font-semibold text-obsidian leading-tight">Thabo</p>
                <p className="text-xs text-slate">Small Business Owner</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1000px] mx-auto space-y-6">
            
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-obsidian tracking-tight">Good morning, Thabo.</h2>
                <p className="text-slate-500 mt-1 font-medium">Your business security, at a glance.</p>
              </div>
              <div className="text-right text-sm text-slate font-medium">
                <p>Tue, 28 Oct 2026</p>
              </div>
            </div>

            <div className="bg-white border-l-4 border-wait rounded-lg p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-wait/10 flex items-center justify-center text-wait">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-obsidian">2 items need attention</h3>
                  <p className="text-sm text-slate-500 mt-0.5">One payment discrepancy and one supplier change.</p>
                </div>
              </div>
              <button className="text-sm font-semibold text-obsidian hover:text-mint-dark transition-colors flex items-center gap-1">
                Review now <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <StatCard title="Checks today" value="18" trend="+3" />
              <StatCard title="Needs review" value="2" trend="+1" warning />
              <StatCard title="Open incidents" value="1" trend="-" danger />
              <StatCard title="Readiness" value="72/100" trend="+6" success />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-6">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-obsidian">Recent activity</h3>
                <button className="text-sm font-semibold text-slate hover:text-obsidian">View all</button>
              </div>
              
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-6 text-xs font-semibold text-slate uppercase tracking-wider">Type</th>
                    <th className="py-3 px-6 text-xs font-semibold text-slate uppercase tracking-wider">Details</th>
                    <th className="py-3 px-6 text-xs font-semibold text-slate uppercase tracking-wider">Status</th>
                    <th className="py-3 px-6 text-xs font-semibold text-slate uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <ActivityRow type="Payment screenshot" details="R2,450 · Amount mismatch" status="WAIT" time="Today, 09:42" />
                  <ActivityRow type="Supplier banking" details="New details not verified" status="STOP" time="Today, 08:17" />
                  <ActivityRow type="Customer order" details="Bank confirmation needed" status="WAIT" time="Yesterday, 16:08" />
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ================= RIGHT SIDEBAR (KHUZEKA DARK GLASS) ================= */}
      <aside className="w-[380px] bg-obsidian/95 backdrop-blur-xl p-6 flex flex-col border-l border-white/5 shrink-0 hidden xl:flex shadow-2xl relative z-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-graphite flex items-center justify-center border border-white/10">
               <span className="text-mint font-bold text-lg">K</span>
            </div>
            <div>
              <h2 className="text-white font-semibold text-base tracking-wide">Khuzeka</h2>
              <p className="text-xs text-slate">Your security assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-graphite border border-white/10 text-mint text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse"></div> Online
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="bg-graphite/80 border border-white/10 p-5 rounded-2xl rounded-tl-sm text-sm text-slate-300 leading-relaxed shadow-lg">
            I found a mismatch in the R2,450 payment evidence. Don't release the goods yet. Confirm the payment in your banking app.
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <AssistantButton icon={<AlertCircle size={18} />} label="Explain why" />
          <AssistantButton icon={<CheckCircle2 size={18} />} label="Create task" />
          <AssistantButton icon={<MessageSquare size={18} />} label="Draft reply" />
        </div>

        <div className="mt-6 bg-graphite/50 border border-white/5 rounded-xl p-4 flex items-start gap-3">
          <Shield size={16} className="text-slate mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate leading-relaxed font-medium">
            Khusela flags suspicious evidence; only your bank can confirm funds received.
          </p>
        </div>
      </aside>

      {/* ================= WHATSAPP WIDGET ================= */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
        {whatsappOpen && (
          <div className="bg-obsidian border border-white/10 rounded-2xl w-80 shadow-2xl overflow-hidden mb-4 animate-in slide-in-from-bottom-5 duration-200">
            <div className="bg-graphite p-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="bg-[#25D366] p-1.5 rounded-full">
                  <Smartphone size={14} className="text-obsidian" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">WhatsApp</h4>
                  <p className="text-[10px] text-slate">Quick menu</p>
                </div>
              </div>
              <button onClick={() => setWhatsappOpen(false)} className="text-slate hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-2 space-y-1">
              <WaMenuItem index="1" label="Check payment" />
              <WaMenuItem index="2" label="Scan message/link" />
              <WaMenuItem index="3" label="Supplier verification" />
              <WaMenuItem index="4" label="Ask Khuzeka" />
            </div>
          </div>
        )}
        <button 
          onClick={() => setWhatsappOpen(!whatsappOpen)}
          className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform duration-200"
        >
          <MessageSquare size={24} className="text-obsidian" fill="currentColor" />
        </button>
      </div>

      <CheckPaymentModal isOpen={isCheckModalOpen} onClose={() => setIsCheckModalOpen(false)} />
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function NavItem({ icon, label, active }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
      active 
        ? 'bg-graphite text-white border-l-2 border-mint' 
        : 'text-slate hover:text-white hover:bg-graphite/50 border-l-2 border-transparent'
    }`}>
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, trend, warning, danger, success }) {
  let trendColor = "text-slate";
  if (warning) trendColor = "text-wait";
  if (danger) trendColor = "text-stop";
  if (success) trendColor = "text-mint-dark";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 transition-transform duration-200 cursor-default">
      <h4 className="text-xs font-semibold text-slate uppercase tracking-wider mb-2">{title}</h4>
      <div className="text-3xl font-bold text-obsidian mb-1">{value}</div>
      <div className={`text-xs font-bold ${trendColor}`}>{trend} <span className="text-slate font-medium">vs yesterday</span></div>
    </div>
  );
}

function ActivityRow({ type, details, status, time }) {
  const isStop = status === 'STOP';
  const badgeStyle = isStop ? 'bg-stop/10 text-stop' : 'bg-wait/10 text-wait';

  return (
    <tr className="hover:bg-slate-50 transition-colors cursor-pointer group">
      <td className="py-4 px-6 text-sm font-bold text-obsidian">{type}</td>
      <td className="py-4 px-6 text-sm text-slate-600 font-medium">{details}</td>
      <td className="py-4 px-6">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${badgeStyle}`}>
          {status}
        </span>
      </td>
      <td className="py-4 px-6 text-xs text-slate font-medium">{time}</td>
    </tr>
  );
}

function WaMenuItem({ index, label }) {
  return (
    <button className="w-full flex items-center gap-3 p-3 hover:bg-graphite rounded-lg transition-colors group">
      <div className="w-6 h-6 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center text-xs font-bold">
        {index}
      </div>
      <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}

function AssistantButton({ icon, label }) {
  return (
    <button className="w-full bg-graphite border border-white/10 hover:border-mint/50 transition-colors duration-200 text-white text-sm font-semibold py-3 px-4 rounded-xl flex items-center gap-3">
      <span className="text-slate">{icon}</span> {label}
    </button>
  );
}