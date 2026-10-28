import { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Shield } from 'lucide-react';

export default function Incidents({ user }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const isDemo = Boolean(user?.isDemo);
        const res = await fetch(`import.meta.env.VITE_API_URL || "http://localhost:8000"/api/v1/incidents?is_demo=${isDemo}`);
        const data = await res.json();
        setIncidents(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchIncidents();
  }, [user]);

  const downloadReport = async (incidentId) => {
    try {
      const isDemo = Boolean(user?.isDemo);
      const res = await fetch(`import.meta.env.VITE_API_URL || "http://localhost:8000"/api/v1/incidents/${incidentId}/report?is_demo=${isDemo}`);
      if (!res.ok) throw new Error("Failed to generate report");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Khusela_Report_${incidentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Could not download report.");
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <p className="text-[#087f68] text-xs font-bold tracking-widest uppercase mb-2">Investigate & Respond</p>
        <h2 className="text-3xl font-bold text-obsidian tracking-tight mb-1">Incident centre</h2>
        <p className="text-slate-500 font-medium">Keep evidence, decisions and recovery actions together.</p>
      </div>

      {loading ? (
         <div className="text-slate-500">Loading incidents...</div>
      ) : incidents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Shield size={24} className="text-slate-400" />
          </div>
          <h4 className="text-lg font-bold text-obsidian mb-2">You're all caught up</h4>
          <p className="text-slate-500 text-sm max-w-sm mb-6">No incidents have been reported for your business. Run a check to ensure everything is safe.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <div key={inc.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-start gap-4 hover:border-slate-300 transition-colors cursor-pointer">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                inc.status === 'STOP' ? 'bg-red-50 text-stop' : 
                inc.status === 'WAIT' ? 'bg-amber-50 text-wait' : 
                'bg-green-50 text-mint-dark'
              }`}>
                {inc.status === 'MATCH' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-obsidian text-lg">{inc.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{inc.id} · {inc.description}</p>
              </div>
              <div className="text-right flex flex-col items-end justify-between h-full">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider inline-block mb-2 ${
                  inc.status === 'STOP' ? 'bg-red-100 text-stop' : 
                  inc.status === 'WAIT' ? 'bg-amber-100 text-wait' : 
                  'bg-green-100 text-mint-dark'
                }`}>
                  {inc.status}
                </span>
                <p className="text-xs text-slate font-medium mb-3">{inc.date}</p>
                
                {/* NEW EXPORT BUTTON */}
                <button 
                  onClick={(e) => { e.stopPropagation(); downloadReport(inc.id); }}
                  className="bg-obsidian text-white text-xs font-bold py-1.5 px-3 rounded hover:bg-graphite transition-colors flex items-center gap-1"
                >
                  Export PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}