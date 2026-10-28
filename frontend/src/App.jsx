import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, Home, Shield, MessageSquare, AlertCircle, 
  Settings, ChevronRight, CheckCircle2, AlertTriangle, 
  X, Smartphone, Database, Send
} from 'lucide-react';

// Import Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Scanner from './pages/Scanner';
import Incidents from './pages/Incidents';
import AuditLog from './pages/AuditLog';
import AdminConsole from './pages/AdminConsole';
import Tasks from './pages/Tasks';
import SettingsPage from './pages/Settings';
import CheckPaymentModal from './components/CheckPaymentModal';

export default function App() {
  // --- LANDING PAGE STATE ---
  const [hasEntered, setHasEntered] = useState(false);

  // --- AUTH STATE ---
  const [user, setUser] = useState(null);
  
  // --- NAVIGATION STATE ---
  const [currentPage, setCurrentPage] = useState('overview');
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);

  // --- DASHBOARD REFRESH TRIGGER ---
  const [refreshStats, setRefreshStats] = useState(0);

  // --- WHATSAPP WIDGET STATE ---
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [waMessages, setWaMessages] = useState([
    { sender: 'bot', text: 'Molo! I am Khuzeka. Paste a suspicious message or ask me anything about staying safe.' }
  ]);
  const [waInput, setWaInput] = useState('');

  // --- DASHBOARD STATS STATE ---
  const [stats, setStats] = useState({
    checks_today: 0,
    needs_review: 0,
    open_incidents: 0,
    readiness: null,
    has_data: false
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // --- FETCH DASHBOARD STATS ---
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch('import.meta.env.VITE_API_URL || "http://localhost:8000"/api/v1/dashboard/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_demo: Boolean(user.isDemo) })
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats", err);
      }
      setStatsLoading(false);
    };

    if (user) fetchStats();
  }, [user, refreshStats]); // Refetch whenever an incident is saved

  // --- AI CHAT HANDLER ---
  const handleWaSend = async (e) => {
    e.preventDefault();
    if (!waInput.trim()) return;
    
    const userMsg = waInput;
    const typingId = Date.now().toString();
    
    setWaMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setWaInput('');
    setWaMessages(prev => [...prev, { id: typingId, sender: 'bot', text: 'Khuzeka is typing...', isTyping: true }]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); 

    try {
      // SMART ROUTING: Check if it's a task command first. If so, bypass payment engine.
      const isTaskCommand = /task|create|add/i.test(userMsg);
      const isPayment = /R\d+|paid|proof|pending|overpaid/i.test(userMsg) && !isTaskCommand;
      
      let botResponse = "";

      if (isPayment) {
        // Route to Deterministic Engine
        const res = await fetch('import.meta.env.VITE_API_URL || "http://localhost:8000"/api/v1/check/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text_input: userMsg }),
          signal: controller.signal
        });
        const data = await res.json();
        botResponse = `🔍 *Analysis Complete*\nStatus: ${data.status}\nReason: ${data.reason_codes[0].description}\n\n${data.recommended_action}`;
      } else {
        // Route to AI (Khuzeka)
        const res = await fetch('import.meta.env.VITE_API_URL || "http://localhost:8000"/api/v1/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: userMsg,
            context: `User is currently on the ${currentPage} page. Workspace: ${user.workspace || user.business}.` 
          }),
          signal: controller.signal
        });
        const data = await res.json();
        botResponse = data.response;
      }

      setWaMessages(prev => prev.filter(m => m.id !== typingId));
      setWaMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      
    } catch (err) {
      setWaMessages(prev => prev.filter(m => m.id !== typingId));
      if (err.name === 'AbortError') {
        setWaMessages(prev => [...prev, { sender: 'bot', text: "⚠️ Request timed out. The AI is taking too long." }]);
      } else {
        setWaMessages(prev => [...prev, { sender: 'bot', text: "⚠️ Connection error. Ensure the backend is running." }]);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // --- LANDING PAGE GUARD ---
  if (!hasEntered) {
    return <Landing onEnter={() => setHasEntered(true)} />;
  }

  // --- AUTH GUARD ---
  if (!user) {
    return (
      <div className="animate-in fade-in duration-700 ease-out">
        <Login onLogin={(userData) => setUser(userData)} />
      </div>
    );
  }

  // --- ADMIN VIEW GUARD ---
  if (currentPage === 'admin') {
    return <AdminConsole onSwitchToOwner={() => setCurrentPage('overview')} />;
  }

  // --- USER TYPE HELPERS ---
  const isIndividual = user.type === 'individual';
  const displayWorkspace = user.workspace || user.business;

  // --- MAIN OWNER DASHBOARD ---
  return (
    <div className="animate-in fade-in duration-500 h-screen">
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
              <NavItem icon={<Home size={18} />} label="Overview" active={currentPage === 'overview'} onClick={() => setCurrentPage('overview')} />
              <div onClick={() => setIsCheckModalOpen(true)}>
                <NavItem icon={<AlertCircle size={18} />} label={isIndividual ? "Check a message" : "Check payment"} />
              </div>
              <NavItem icon={<MessageSquare size={18} />} label="Message & link scan" active={currentPage === 'scanner'} onClick={() => setCurrentPage('scanner')} />
              <NavItem icon={<Shield size={18} />} label={isIndividual ? "Saved reports" : "Incident centre"} active={currentPage === 'incidents'} onClick={() => setCurrentPage('incidents')} />
              <NavItem icon={<Database size={18} />} label="Audit Log" active={currentPage === 'audit'} onClick={() => setCurrentPage('audit')} />
              <NavItem icon={<CheckCircle2 size={18} />} label="My Tasks" active={currentPage === 'tasks'} onClick={() => setCurrentPage('tasks')} />
              <NavItem icon={<Settings size={18} />} label="Settings" active={currentPage === 'settings'} onClick={() => setCurrentPage('settings')} />
              
              <div className="pt-4 mt-4 border-t border-white/10">
                <button 
                  onClick={() => setCurrentPage('admin')}
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
                {stats.readiness ? stats.readiness : '--'}<span className="text-sm text-slate font-normal">/100</span>
              </div>
              <div className="h-1.5 w-full bg-obsidian rounded-full overflow-hidden">
                <div className="h-full bg-mint rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.readiness || 0}%` }}></div>
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
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-obsidian leading-tight">{user.name}</p>
                  <p className="text-xs text-slate">{displayWorkspace}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8">
            
            {/* --- OVERVIEW PAGE --- */}
            {currentPage === 'overview' && (
              <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
                
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-obsidian tracking-tight">Good morning, {user.name}.</h2>
                    <p className="text-slate-500 mt-1 font-medium">Your business security, at a glance.</p>
                  </div>
                  <div className="text-right text-sm text-slate font-medium">
                    <p>{new Date().toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>

                {stats.needs_review > 0 && (
                  <div className="bg-white border-l-4 border-wait rounded-lg p-5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-wait/10 flex items-center justify-center text-wait">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-obsidian">{stats.needs_review} item{stats.needs_review === 1 ? '' : 's'} need attention</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Review the flagged activity to stay protected.</p>
                      </div>
                    </div>
                    <button onClick={() => setCurrentPage('incidents')} className="text-sm font-semibold text-obsidian hover:text-mint-dark transition-colors flex items-center gap-1">
                      Review now <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <StatCard title="Checks today" value={statsLoading ? "—" : stats.checks_today} trend={stats.has_data ? "+3" : "-"} />
                  <StatCard title="Needs review" value={statsLoading ? "—" : stats.needs_review} trend={stats.has_data ? "+1" : "-"} warning={stats.needs_review > 0} />
                  <StatCard title="Open incidents" value={statsLoading ? "—" : stats.open_incidents} trend="-" danger={stats.open_incidents > 0} />
                  <StatCard 
                    title="Readiness" 
                    value={statsLoading ? "—" : (stats.readiness ? `${stats.readiness}/100` : "Pending")} 
                    trend={stats.readiness ? "+6" : ""} 
                    success={stats.readiness > 0} 
                  />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-6">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-obsidian">Recent activity</h3>
                    {stats.has_data && <button onClick={() => setCurrentPage('incidents')} className="text-sm font-semibold text-slate hover:text-obsidian">View all</button>}
                  </div>
                  
                  {stats.has_data ? (
                    <table className="w-full text-left">
                      <thead className="bg-[#F8FAFC] border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-6 text-xs font-bold text-slate uppercase tracking-wider">Type</th>
                          <th className="py-3 px-6 text-xs font-bold text-slate uppercase tracking-wider">Details</th>
                          <th className="py-3 px-6 text-xs font-bold text-slate uppercase tracking-wider">Status</th>
                          <th className="py-3 px-6 text-xs font-bold text-slate uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <ActivityRow type="Payment screenshot" details="R2,450 · Amount mismatch" status="WAIT" time="Today, 09:42" />
                        <ActivityRow type="Supplier banking" details="New details not verified" status="STOP" time="Today, 08:17" />
                        <ActivityRow type="Customer order" details="Bank confirmation needed" status="WAIT" time="Yesterday, 16:08" />
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Shield size={24} className="text-slate-400" />
                      </div>
                      <h4 className="text-lg font-bold text-obsidian mb-2">No activity yet</h4>
                      <p className="text-slate-500 text-sm max-w-sm mb-6">Run your first security check to start building your protection history.</p>
                      <button onClick={() => setIsCheckModalOpen(true)} className="bg-obsidian text-white font-bold py-2.5 px-6 rounded-lg hover:bg-graphite transition-colors">
                        Run First Check
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- OTHER PAGES --- */}
            {currentPage === 'scanner' && <Scanner />}
            {currentPage === 'incidents' && <Incidents user={user} />}
            {currentPage === 'audit' && <AuditLog />}
            {currentPage === 'tasks' && <Tasks />}

            {/* --- SETTINGS PAGE --- */}
            {currentPage === 'settings' && (
              <SettingsPage user={user} onUpdateUser={(newUser) => setUser(newUser)} />
            )}

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
            <div className="bg-[#0b141a] border border-white/10 rounded-2xl w-[340px] shadow-2xl overflow-hidden mb-4 animate-in slide-in-from-bottom-5 duration-200 flex flex-col h-[450px]">
              {/* Header */}
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
                <button onClick={() => setWhatsappOpen(false)} className="text-slate hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {waMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-wrap ${
                      msg.sender === 'user' 
                        ? 'bg-[#005c4b] text-white rounded-tr-none' 
                        : 'bg-[#202c33] text-gray-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <form onSubmit={handleWaSend} className="p-3 bg-[#202c33] flex items-center gap-2 shrink-0">
                <input 
                  type="text" 
                  value={waInput}
                  onChange={(e) => setWaInput(e.target.value)}
                  placeholder="Type a message or paste text..."
                  className="flex-1 bg-[#2a3942] text-sm text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-mint"
                />
                <button type="submit" className="bg-[#00a884] p-2 rounded-full hover:bg-[#029676] transition">
                  <Send size={16} className="text-white" />
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

        {/* Modal */}
        <CheckPaymentModal
          isOpen={isCheckModalOpen}
          onClose={() => setIsCheckModalOpen(false)}
          user={user}
          onIncidentSaved={() => setRefreshStats(prev => prev + 1)}
        />
      </div>
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

function AssistantButton({ icon, label }) {
  return (
    <button className="w-full bg-graphite border border-white/10 hover:border-mint/50 transition-colors duration-200 text-white text-sm font-semibold py-3 px-4 rounded-xl flex items-center gap-3">
      <span className="text-slate">{icon}</span> {label}
    </button>
  );
}