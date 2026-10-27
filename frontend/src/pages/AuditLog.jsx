import { useState, useEffect } from 'react';
import { Shield, MessageSquare, Monitor, Image as ImageIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch logs every 3 seconds to simulate real-time updates
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/audit-logs');
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-ZA', { 
      dateStyle: 'medium', 
      timeStyle: 'medium' 
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <p className="text-[#087f68] text-xs font-bold tracking-widest uppercase mb-2">Security Operations</p>
        <h2 className="text-3xl font-bold text-obsidian tracking-tight mb-1">Audit Log</h2>
        <p className="text-slate-500 font-medium">A tamper-evident history of all checks, messages, and incidents across Web and WhatsApp.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAFC] border-b border-slate-200">
            <tr>
              <th className="py-4 px-6 text-xs font-bold text-slate uppercase tracking-wider">Timestamp</th>
              <th className="py-4 px-6 text-xs font-bold text-slate uppercase tracking-wider">Channel</th>
              <th className="py-4 px-6 text-xs font-bold text-slate uppercase tracking-wider">Event</th>
              <th className="py-4 px-6 text-xs font-bold text-slate uppercase tracking-wider">Details</th>
              <th className="py-4 px-6 text-xs font-bold text-slate uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 text-xs text-slate font-medium whitespace-nowrap">
                  {formatDate(log.timestamp)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-obsidian">
                    {log.channel === 'WhatsApp' ? <MessageSquare size={14} className="text-[#25D366]" /> : <Monitor size={14} className="text-info" />}
                    {log.channel}
                  </div>
                  <div className="text-xs text-slate mt-0.5">{log.sender}</div>
                </td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-1 bg-slate-100 rounded text-[10px] font-bold tracking-wider text-slate uppercase">
                    {log.event_type}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm font-semibold text-obsidian">{log.description}</div>
                  <div className="text-xs text-slate-500 mt-1">{log.context}</div>
                </td>
                <td className="py-4 px-6">
                  {log.status === 'warning' ? (
                    <AlertTriangle size={18} className="text-wait" />
                  ) : log.status === 'success' ? (
                    <CheckCircle2 size={18} className="text-mint-dark" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-info"></div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && !loading && (
          <div className="p-8 text-center text-slate">No audit logs found.</div>
        )}
      </div>
    </div>
  );
}