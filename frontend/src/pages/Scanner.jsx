import { useState } from 'react';
import { ShieldAlert, ShieldCheck, Search } from 'lucide-react';

export default function Scanner() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scanMessage = async () => {
    if (!inputText) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/check/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_input: inputText })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <p className="text-[#087f68] text-xs font-bold tracking-widest uppercase mb-2">Threat Screening</p>
        <h2 className="text-3xl font-bold text-obsidian tracking-tight mb-1">Message & link scan</h2>
        <p className="text-slate-500 font-medium">Review suspicious messages, links and requests before acting.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-bold text-obsidian mb-2">Suspicious message or URL</label>
        <textarea 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste the message exactly as you received it..."
          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-mint-dark focus:ring-1 focus:ring-mint-dark h-32 resize-none mb-4"
        />
        <button 
          onClick={scanMessage}
          disabled={loading}
          className="bg-obsidian text-white font-bold py-2.5 px-6 rounded-lg hover:bg-graphite transition-colors disabled:opacity-50"
        >
          {loading ? "Scanning..." : "Scan Message →"}
        </button>

        {result && (
          <div className={`mt-6 p-5 rounded-xl border ${result.status === 'STOP' ? 'border-stop/30 bg-red-50' : result.status === 'WAIT' ? 'border-wait/30 bg-amber-50' : 'border-mint-dark/30 bg-green-50'}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.status === 'STOP' ? <ShieldAlert className="text-stop" /> : <ShieldCheck className="text-mint-dark" />}
              <h3 className={`font-bold ${result.status === 'STOP' ? 'text-stop' : 'text-mint-dark'}`}>
                {result.status === 'STOP' ? 'SUSPICIOUS · Needs Review' : 'No Strong Indicators Found'}
              </h3>
            </div>
            <p className="text-sm font-medium text-obsidian mb-4">{result.recommended_action}</p>
            <ul className="space-y-2">
              {result.reason_codes.map((r, i) => (
                <li key={i} className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> {r.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}