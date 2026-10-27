import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Bell, Home, Shield, MessageSquare, AlertCircle,
  Settings, ChevronRight, CheckCircle2, AlertTriangle,
  X, Smartphone, Database, History
} from 'lucide-react';
import CheckPaymentModal from './components/CheckPaymentModal';
import AdminConsole from './pages/AdminConsole';
import Scanner from './pages/Scanner';
import Incidents from './pages/Incidents';
import AuditLog from './pages/AuditLog';

export default function App() {
  const [currentView, setCurrentView] = useState('owner'); // 'owner' | 'admin'
  const [currentPage, setCurrentPage] = useState('overview'); // owner sub-page
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);

  // WhatsApp chat state
  const [waMessages, setWaMessages] = useState([
    {
      sender: 'bot',
      text: "Molo! I'm Khuzeka. Paste a suspicious message, payment proof, or supplier update — or just ask me anything about staying safe.",
    },
  ]);
  const [waInput, setWaInput] = useState('');
  const waScrollRef = useRef(null);

  useEffect(() => {
    if (waScrollRef.current) {
      waScrollRef.current.scrollTop = waScrollRef.current.scrollHeight;
    }
  }, [waMessages, whatsappOpen]);

  const handleWaSend = async (e) => {
    e.preventDefault();
    if (!waInput.trim()) return;

    const userMsg = waInput;
    // Unique per-message ID — cleans up exactly this indicator, not others
    const typingId = `typing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    setWaMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg },
      { id: typingId, sender: 'bot', text: '', isTyping: true },
    ]);
    setWaInput('');

    // Helper: swap this indicator for the real reply (works in success + error paths)
    const replaceTyping = (replyText) => {
      setWaMessages((prev) => [
        ...prev.filter((m) => m.id !== typingId),
        { sender: 'bot', text: replyText },
      ]);
    };

    try {
      // Triage: does this look like payment evidence?
      const isPayment =
        /\b(r\s?\d|paid|payment|eft|deposit(?:ed)?|transfer(?:red)?|proof|screenshot|receipt|confirmation|overpaid|underpaid|invoice|supplier|pending|amount)\b|https?:\/\/|www\.|\+\d{6,}/i.test(
          userMsg
        );

      if (isPayment) {
        const res = await fetch('http://localhost:8000/api/v1/check/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text_input: userMsg }),
        });
        const data = await res.json();

        const status = data?.status ?? 'INFO';
        const reason = data?.reason_codes?.[0]?.description ?? 'See recommended action';
        const action = data?.recommended_action ?? 'Proceed with caution.';
        replaceTyping(
          `🔍 *Analysis Complete*\n` +
            `Status: ${status}\n` +
            `Reason: ${reason}\n\n` +
            `${action}`
        );
      } else {
        const res = await fetch('http://localhost:8000/api/v1/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMsg }),
        });
        const data = await res.json();
        replaceTyping(data?.response ?? "I'm here — can you say a bit more?");
      }
    } catch (err) {
      console.error('WhatsApp send failed:', err);
      // Always clear the indicator, even on failure — this is the actual fix
      replaceTyping(
        "⚠️ Connection error. Please ensure the backend is running."
      );
    }
  };

  // ================= ADMIN VIEW (early return, AFTER all hooks) =================
  if (currentView === 'admin') {
    return (
      <AdminConsole
        onSwitchToOwner={() => {
          setCurrentView('owner');
        }}
      />
    );
  }

  // ================= OWNER VIEW =================
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
            <NavItem
              icon={<Home size={18} />}
              label="Overview"
              active={currentPage === 'overview'}
              onClick={() => setCurrentPage('overview')}
            />
            <NavItem
              icon={<AlertCircle size={18} />}
              label="Check payment"
              onClick={() => setIsCheckModalOpen(true)}
            />
            <NavItem
              icon={<MessageSquare size={18} />}
              label="Message & link scan"
              active={currentPage === 'scanner'}
              onClick={() => setCurrentPage('scanner')}
            />
            <NavItem
              icon={<Shield size={18} />}
              label="Incident centre"
              active={currentPage === 'incidents'}
              onClick={() => setCurrentPage('incidents')}
            />
            <NavItem
              icon={<History size={18} />}
              label="Audit Log"
              active={currentPage === 'audit'}
              onClick={() => setCurrentPage('audit')}
            />
            <NavItem icon={<CheckCircle2 size={18} />} label="Security coach" />
            <NavItem icon={<Settings size={18} />} label="Settings" />

            {/* Admin Console switch */}
            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                onClick={() => setCurrentView('admin')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold text-slate hover:text-mint hover:bg-graphite/50 transition-all"
              >
                <Database size={16} /> Open Admin Console
              </button>
            </div>
          </nav>
        </div>

        <div className="p-5">
          <div className="bg-graphite rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate">Readiness</span>
              <ChevronRight size={14} className="text-slate" />
            </div>
            <div className="text-2xl font-bold text-white mb-3 tracking-tight">
              72<span className="text-sm text-slate font-normal">/100</span>
            </div>
            <div className="h-1.5 w-full bg-obsidian rounded-full overflow-hidden">
              <div className="h-full bg-mint w-[72%] rounded-full transition-all duration-1000 ease-out"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN WORKSPACE ================= */}
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
          {currentPage === 'overview' && (
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
          )}

          {currentPage === 'scanner' && <Scanner />}
          {currentPage === 'incidents' && <Incidents />}
          {currentPage === 'audit' && <AuditLog />}
        </main>
      </div>

      {/* ================= RIGHT SIDEBAR (KHUZEKA) ================= */}
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
          <div className="bg-[#0b141a] border border-white/10 rounded-2xl w-[340px] shadow-2xl overflow-hidden mb-4 animate-in slide-in-from-bottom-5 duration-200 flex flex-col h-[450px]">
            <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-[#25D366] p-1.5 rounded-full">
                  <Smartphone size={14} className="text-obsidian" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">Khusela Bot</h4>
                  <p className="text-[10px] text-slate">Online</p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappOpen(false)}
                className="text-slate hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div ref={waScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {waMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-[#005c4b] text-white rounded-tr-none'
                        : 'bg-[#202c33] text-gray-200 rounded-tl-none'
                    }`}
                  >
                    {msg.isTyping ? (
                      <span className="inline-flex items-center gap-1 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </span>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleWaSend} className="p-3 bg-[#202c33] flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={waInput}
                onChange={(e) => setWaInput(e.target.value)}
                placeholder="Paste a message or ask anything..."
                className="flex-1 bg-[#2a3942] text-sm text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-mint"
              />
              <button
                type="submit"
                className="bg-[#00a884] p-2 rounded-full hover:bg-[#029676] transition"
              >
                <ChevronRight size={18} className="text-white" />
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setWhatsappOpen(!whatsappOpen)}
          className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform duration-200"
        >
          <MessageSquare size={24} className="text-obsidian" fill="currentColor" />
        </button>
      </div>

      <CheckPaymentModal
        isOpen={isCheckModalOpen}
        onClose={() => setIsCheckModalOpen(false)}
      />
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
        active
          ? 'bg-graphite text-white border-l-2 border-mint'
          : 'text-slate hover:text-white hover:bg-graphite/50 border-l-2 border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, trend, warning, danger, success }) {
  let trendColor = 'text-slate';
  if (warning) trendColor = 'text-wait';
  if (danger) trendColor = 'text-stop';
  if (success) trendColor = 'text-mint-dark';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 transition-transform duration-200 cursor-default">
      <h4 className="text-xs font-semibold text-slate uppercase tracking-wider mb-2">{title}</h4>
      <div className="text-3xl font-bold text-obsidian mb-1">{value}</div>
      <div className={`text-xs font-bold ${trendColor}`}>
        {trend} <span className="text-slate font-medium">vs yesterday</span>
      </div>
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

function AssistantButton({ icon, label }) {
  return (
    <button className="w-full bg-graphite border border-white/10 hover:border-mint/50 transition-colors duration-200 text-white text-sm font-semibold py-3 px-4 rounded-xl flex items-center gap-3">
      <span className="text-slate">{icon}</span> {label}
    </button>
  );
}