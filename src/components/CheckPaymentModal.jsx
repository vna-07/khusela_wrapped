import { useState } from 'react';
import { X, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';

export default function CheckPaymentModal({ isOpen, onClose }) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  if (!isOpen) return null;

  const runCheck = async () => {
    setLoading(true);
    setVerdict(null);
    setAiExplanation(null);
    try {
      const res = await fetch('http://localhost:8000/api/v1/check/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_input: inputText || "Payment is pending. Please release goods." })
      });
      const data = await res.json();
      setVerdict(data);
    } catch (err) {
      console.error("Backend not running?", err);
    }
    setLoading(false);
  };

  const askKhuzeka = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/assistant/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verdict: verdict })
      });
      const data = await res.json();
      setAiExplanation(data.response);
    } catch (err) {
      console.error(err);
      setAiExplanation("Khuzeka is currently unavailable. Please follow the recommended action above.");
    }
    setAiLoading(false);
  };

  const getStatusIcon = (status) => {
    if (status === 'STOP') return <ShieldAlert className="text-stop" size={32} />;
    if (status === 'WAIT') return <Clock className="text-wait" size={32} />;
    return <ShieldCheck className="text-mint-dark" size={32} />;
  };

  const getStatusColor = (status) => {
    if (status === 'STOP') return 'border-stop/20 bg-[#FEE2E2]/50 text-stop';
    if (status === 'WAIT') return 'border-wait/20 bg-[#FEF3C7]/50 text-wait';
    return 'border-mint-dark/20 bg-[#D1FAE5]/50 text-mint-dark';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-obsidian">Check Payment Proof</h2>
            <p className="text-sm text-slate">Deterministic security engine</p>
          </div>
          <button onClick={onClose} className="text-slate hover:text-obsidian transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!verdict ? (
            <>
              <label className="block text-sm font-semibold text-obsidian mb-2">
                Paste the message or payment evidence text
              </label>
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. 'Hi, I have paid the R2450. Here is the confirmation, please release the sneakers.'"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 text-sm text-obsidian focus:outline-none focus:border-mint-dark focus:ring-1 focus:ring-mint-dark resize-none h-32 mb-6 transition-all"
              />
              <button 
                onClick={runCheck}
                disabled={loading}
                className="w-full bg-obsidian text-white font-bold py-3 rounded-xl hover:bg-graphite transition-colors disabled:opacity-50"
              >
                {loading ? "Analyzing Evidence..." : "Run Security Check"}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-center gap-4 ${getStatusColor(verdict.status)}`}>
                {getStatusIcon(verdict.status)}
                <div>
                  <h3 className="font-bold text-lg">{verdict.status}</h3>
                  <p className="text-sm opacity-90">{verdict.recommended_action}</p>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Reason Codes</h4>
                <ul className="space-y-2">
                  {verdict.reason_codes.map((r, i) => (
                    <li key={i} className="text-sm text-obsidian flex items-start gap-2 font-medium">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate shrink-0"></div>
                      {r.description}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Khuzeka AI Block */}
              <div className="mt-4 p-4 bg-obsidian rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-mint/20 text-mint flex items-center justify-center text-xs font-bold">K</div>
                  <span className="text-white text-sm font-bold">Khuzeka AI</span>
                </div>
                
                {aiExplanation ? (
                  <p className="text-sm text-slate-300 leading-relaxed animate-in fade-in duration-300">
                    {aiExplanation}
                  </p>
                ) : (
                  <button 
                    onClick={askKhuzeka}
                    disabled={aiLoading}
                    className="text-sm font-bold text-mint hover:text-white transition-colors flex items-center gap-2"
                  >
                    {aiLoading ? "Khuzeka is thinking..." : "Ask Khuzeka to explain this →"}
                  </button>
                )}
              </div>

              <button 
                onClick={() => { setVerdict(null); setInputText(''); setAiExplanation(null); onClose(); }}
                className="w-full bg-[#F8FAFC] border border-slate-200 text-obsidian font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors mt-2"
              >
                Close & Save to Incident Log
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}