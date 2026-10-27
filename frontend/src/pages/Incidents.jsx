import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Incidents() {
  const incidents = [
    { id: "INC-1042", title: "Payment evidence mismatch", type: "R2,450 · Reference differs", status: "WAIT", color: "wait" },
    { id: "INC-1041", title: "Supplier banking detail change", type: "New account details received", status: "STOP", color: "stop" },
    { id: "INC-1038", title: "Suspicious customer link", type: "Owner deleted and blocked", status: "RESOLVED", color: "match" }
  ];

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <p className="text-[#087f68] text-xs font-bold tracking-widest uppercase mb-2">Investigate & Respond</p>
        <h2 className="text-3xl font-bold text-obsidian tracking-tight mb-1">Incident centre</h2>
        <p className="text-slate-500 font-medium">Keep evidence, decisions and recovery actions together.</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button className="bg-obsidian text-white px-4 py-2 rounded-lg text-sm font-bold">All incidents</button>
        <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold">Open</button>
        <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold">Resolved</button>
      </div>

      <div className="space-y-4">
        {incidents.map((inc) => (
          <div key={inc.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-start gap-4 hover:border-slate-300 transition-colors cursor-pointer">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${inc.color === 'stop' ? 'bg-red-50 text-stop' : inc.color === 'wait' ? 'bg-amber-50 text-wait' : 'bg-green-50 text-mint-dark'}`}>
              {inc.status === 'RESOLVED' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-obsidian text-lg">{inc.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{inc.id} · {inc.type}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${inc.color === 'stop' ? 'bg-red-100 text-stop' : inc.color === 'wait' ? 'bg-amber-100 text-wait' : 'bg-green-100 text-mint-dark'}`}>
              {inc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}