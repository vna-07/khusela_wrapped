import { useState } from 'react';
import {
  X, ShieldAlert, ShieldCheck, Clock, AlertTriangle, Download,
  Upload, FileImage, Loader2,
} from 'lucide-react';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const API_BASE = 'https://khusela-wrapped.onrender.com';

// Statuses that map to a payment-flow result — only these show the
// reassessment prompt ("Did you check your bank balance?")
const PAYMENT_STATUSES = ['STOP', 'WAIT', 'ESCALATE', 'SUSPICIOUS'];

// Statuses where the case is already resolved — no reassessment needed
const SAFE_STATUSES = ['MATCH', 'CONSISTENT'];

export default function CheckPaymentModal({ isOpen, onClose, user, onIncidentSaved }) {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  const [networkAlert, setNetworkAlert] = useState(null);

  const [followUp, setFollowUp] = useState('');
  const [reassessLoading, setReassessLoading] = useState(false);
  const [reassessError, setReassessError] = useState(null);

  if (!isOpen) return null;

  // ===== Shape-agnostic readers =====
  // The backend may return a payment verdict (with reason_codes + recommended_action)
  // OR an investigator verdict (with reason + finding + verification + action).
  // Both shapes are supported so the modal keeps working before and after the
  // investigate_document rollout.
  const reasonText =
    verdict?.reason_codes?.[0]?.description ||
    verdict?.reason ||
    verdict?.finding ||
    'No specific reason recorded.';

  const actionText =
    verdict?.recommended_action ||
    verdict?.action ||
    'See reason above.';

  const findingText = verdict?.finding || null;
  const verificationText = verdict?.verification || null;

  // Show the Reason Codes block only when it adds information beyond the
  // single Reasoning line (i.e., 2+ codes, or a code whose text differs from
  // reasonText). Prevents duplicate "Amount mismatch" appearing twice.
  const showReasonCodesBlock =
    Array.isArray(verdict?.reason_codes) &&
    verdict.reason_codes.length > 0 &&
    !(
      verdict.reason_codes.length === 1 &&
      verdict.reason_codes[0].description === reasonText
    );

  const isPaymentFlow = PAYMENT_STATUSES.includes(verdict?.status);
  const isSafe = SAFE_STATUSES.includes(verdict?.status);

  // ===== Reset / close =====
  const resetAll = () => {
    setInputText('');
    setSelectedFile(null);
    setExtractedText('');
    setErrorMessage(null);
    setVerdict(null);
    setAiExplanation(null);
    setIsRecovery(false);
    setNetworkAlert(null);
    setFollowUp('');
    setReassessLoading(false);
    setReassessError(null);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleFileSelect = (file) => {
    setErrorMessage(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose an image file (PNG or JPG).');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setErrorMessage('Image is larger than 5 MB. Please compress it and try again.');
      return;
    }
    setSelectedFile(file);
  };

  const runCheck = async () => {
    setLoading(true);
    setVerdict(null);
    setAiExplanation(null);
    setExtractedText('');
    setErrorMessage(null);
    setIsRecovery(false);
    setNetworkAlert(null);
    setFollowUp('');
    setReassessError(null);

    try {
      let endpoint;
      let body;
      let headers;

      if (selectedFile) {
        endpoint = `${API_BASE}/api/v1/check/image`;
        body = new FormData();
        body.append('file', selectedFile);
        headers = {};
      } else {
        endpoint = `${API_BASE}/api/v1/check/payment`;
        body = JSON.stringify({
          text_input: inputText || 'Payment is pending. Please release goods.',
        });
        headers = { 'Content-Type': 'application/json' };
      }

      const res = await fetch(endpoint, { method: 'POST', headers, body });
      const data = await res.json();

      if (data?.error) {
        setErrorMessage(data.error);
      } else if (selectedFile) {
        setExtractedText(data.extracted_text || '');
        // Accept either shape: data.investigation (new) or data.verdict (legacy).
        setVerdict(data.investigation || data.verdict || null);
        if (data.network_alert) {
          setNetworkAlert(data.network_context || 'Network alert triggered.');
        } else {
          setNetworkAlert(null);
        }
        if (!data.investigation && !data.verdict) {
          setErrorMessage('The engine did not return a verdict for this image.');
        }
      } else {
        setVerdict(data);
        setNetworkAlert(null);
      }
    } catch (err) {
      console.error('Backend not running?', err);
      setErrorMessage('Could not reach the security engine. Is the backend running?');
    }
    setLoading(false);
  };

  const handleReassess = async () => {
    if (!followUp.trim()) return;
    setReassessLoading(true);
    setReassessError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/check/reassess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_verdict: verdict,
          user_answer: followUp,
        }),
      });
      const data = await res.json();
      if (data?.error) {
        setReassessError(data.error);
      } else {
        setVerdict(data);
        setFollowUp('');
        if (data.status === 'MATCH' || data.status === 'CONSISTENT') {
          setNetworkAlert(null);
        }
      }
    } catch (err) {
      console.error(err);
      setReassessError('Could not reach the security engine for reassessment.');
    }
    setReassessLoading(false);
  };

  const askKhuzeka = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/assistant/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verdict }),
      });
      const data = await res.json();
      setAiExplanation(data.response);
    } catch (err) {
      console.error(err);
      setAiExplanation(
        'Khuzeka is currently unavailable. Please follow the recommended action above.'
      );
    }
    setAiLoading(false);
  };

  const saveIncident = async () => {
    // Derive a title that reflects the actual document type, not always "payment"
    const incidentTitle = networkAlert
      ? 'Network-Flagged Payment'
      : (verdict?.status === 'REVIEW REQUIRED' || verdict?.status === 'UNVERIFIED')
      ? 'Certificate Review'
      : 'Payment Check Flagged';

    try {
      await fetch(`${API_BASE}/api/v1/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: incidentTitle,
          description: `Status: ${verdict.status} · ${reasonText}`,
          status: verdict.status,
          is_demo: user.isDemo,
        }),
      });

      onIncidentSaved?.();
      resetAll();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save incident.');
    }
  };

  const downloadEvidenceReport = () => {
    if (!verdict) return;
    const stamp = new Date().toISOString();
    const evidenceSource = (extractedText || inputText || '').trim();

    // Build reason codes block — tolerate missing reason_codes (investigator shape)
    const reasonCodesBlock = (verdict.reason_codes || []).map(
      (r, i) => `${i + 1}. [${r.code || 'N/A'}] ${r.description}`
    );
    if (reasonCodesBlock.length === 0 && reasonText) {
      reasonCodesBlock.push(`1. ${reasonText}`);
    }

    const lines = [
      'KHUSELA — INCIDENT EVIDENCE REPORT',
      '==================================',
      `Generated:        ${stamp}`,
      `Reported by:      Thabo (Small Business Owner)`,
      `Source:           ${selectedFile ? `Image upload (${selectedFile.name})` : 'Text input'}`,
      `Verdict status:   ${verdict.status}`,
      `Recommended:      ${actionText}`,
      ...(findingText ? ['', 'Findings:', '---------', findingText] : []),
      ...(verificationText ? ['', 'Verification Status:', '--------------------', verificationText] : []),
      ...(networkAlert
        ? ['', 'NETWORK ALERT:', '--------------', networkAlert]
        : []),
      '',
      'Evidence submitted:',
      '-------------------',
      evidenceSource || '(none)',
      '',
      'Reason codes:',
      '-------------',
      ...reasonCodesBlock,
      '',
      'Notes:',
      '------',
      'This report is generated from deterministic checks; only your bank can',
      'confirm whether funds were received. Use alongside your bank statement',
      'and SAPS case number.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khusela-evidence-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ===== Status helpers — support old + new vocabulary =====
  const getStatusIcon = (status) => {
    if (['STOP', 'SUSPICIOUS', 'ESCALATE'].includes(status))
      return <ShieldAlert className="text-stop" size={32} />;
    if (['WAIT', 'REVIEW REQUIRED', 'VERIFICATION REQUIRED'].includes(status))
      return <Clock className="text-wait" size={32} />;
    if (['MATCH', 'CONSISTENT'].includes(status))
      return <ShieldCheck className="text-mint-dark" size={32} />;
    return <ShieldAlert className="text-slate" size={32} />;
  };

  const getStatusColor = (status) => {
    if (['STOP', 'SUSPICIOUS', 'ESCALATE'].includes(status))
      return 'border-stop/20 bg-[#FEE2E2]/50 text-stop';
    if (['WAIT', 'REVIEW REQUIRED', 'VERIFICATION REQUIRED'].includes(status))
      return 'border-wait/20 bg-[#FEF3C7]/50 text-wait';
    if (['MATCH', 'CONSISTENT'].includes(status))
      return 'border-mint-dark/20 bg-[#D1FAE5]/50 text-mint-dark';
    return 'border-slate-200 bg-slate-50 text-slate';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-obsidian">Check Payment Proof</h2>
            <p className="text-sm text-slate">Deterministic security engine</p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate hover:text-obsidian transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!verdict ? (
            <>
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-mint-dark hover:bg-[#F8FAFC] transition-colors cursor-pointer mb-4"
                onClick={() => document.getElementById('file-upload').click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />
                {selectedFile ? (
                  <>
                    <FileImage className="mx-auto text-mint-dark mb-2" size={24} />
                    <p className="text-sm font-bold text-obsidian break-all">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {(selectedFile.size / 1024).toFixed(0)} KB · click to replace
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                    <p className="text-sm font-bold text-obsidian">
                      Click to upload a screenshot
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-xs font-semibold text-slate uppercase tracking-wider">
                  or paste text
                </span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (e.target.value && selectedFile) setSelectedFile(null);
                }}
                placeholder="e.g. 'Hi, I have paid the R2450. Here is the confirmation, please release the sneakers.'"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 text-sm text-obsidian focus:outline-none focus:border-mint-dark focus:ring-1 focus:ring-mint-dark resize-none h-32 mb-4 transition-all"
              />

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg border border-stop/20 bg-[#FEE2E2]/50 text-stop text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                onClick={runCheck}
                disabled={loading || (!selectedFile && !inputText.trim())}
                className="w-full bg-obsidian text-white font-bold py-3 rounded-xl hover:bg-graphite transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {selectedFile ? 'Reading screenshot…' : 'Analyzing Evidence…'}
                  </>
                ) : (
                  'Run Security Check'
                )}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {networkAlert && (
                <div className="bg-red-500/10 border-2 border-red-500 text-red-600 p-4 rounded-xl font-bold flex items-start gap-3 animate-pulse">
                  <ShieldAlert size={24} className="shrink-0 mt-0.5" />
                  <div className="text-sm leading-relaxed">{networkAlert}</div>
                </div>
              )}

              <div
                className={`p-4 rounded-xl border flex items-center gap-4 ${getStatusColor(
                  verdict.status
                )}`}
              >
                {getStatusIcon(verdict.status)}
                <div>
                  <h3 className="font-bold text-lg">{verdict.status}</h3>
                  <p className="text-sm opacity-90">{actionText}</p>
                </div>
              </div>

              {extractedText && (
                <div className="bg-[#F8FAFC] rounded-xl p-4 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">
                    Text read from image
                  </h4>
                  <p className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed max-h-32 overflow-y-auto">
                    {extractedText}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 italic">
                    OCR isn&apos;t perfect — double-check names, amounts and reference numbers
                    against the original image.
                  </p>
                </div>
              )}

              {/* Reason / Findings / Verification — headings from the spec,
                  content sourced via the shape-agnostic readers above. */}
              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-slate-200 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-1">
                    Reasoning
                  </h4>
                  <p className="text-sm text-obsidian font-medium">{reasonText}</p>
                </div>

                {findingText && (
                  <div>
                    <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-1">
                      Findings
                    </h4>
                    <p className="text-sm text-obsidian leading-relaxed">{findingText}</p>
                  </div>
                )}

                {verificationText && (
                  <div>
                    <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-1">
                      Verification Status
                    </h4>
                    <p className="text-sm text-wait font-medium leading-relaxed">
                      {verificationText}
                    </p>
                  </div>
                )}
              </div>

              {/* Reason Codes — shown only when it adds structured detail beyond
                  the single Reasoning line above (e.g., multi-code legacy verdicts) */}
              {showReasonCodesBlock && (
                <div className="bg-[#F8FAFC] rounded-xl p-4 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">
                    Reason Codes
                  </h4>
                  <ul className="space-y-2">
                    {verdict.reason_codes.map((r, i) => (
                      <li
                        key={i}
                        className="text-sm text-obsidian flex items-start gap-2 font-medium"
                      >
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate shrink-0"></div>
                        {r.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* P0.4 reassessment — payment-flow only */}
              {isPaymentFlow && !isSafe && (
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <label className="block text-sm font-bold text-obsidian mb-2">
                    Khuzeka asks: Did you check your available balance in your banking app?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={followUp}
                      onChange={(e) => setFollowUp(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && followUp.trim() && !reassessLoading) {
                          handleReassess();
                        }
                      }}
                      placeholder="e.g., Yes, I checked, it is cleared."
                      className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-mint-dark"
                    />
                    <button
                      onClick={handleReassess}
                      disabled={reassessLoading || !followUp.trim()}
                      className="bg-obsidian text-white font-bold px-4 rounded-lg hover:bg-graphite disabled:opacity-50 flex items-center gap-2"
                    >
                      {reassessLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          …
                        </>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                  {reassessError && (
                    <p className="text-xs text-stop mt-2">{reassessError}</p>
                  )}
                </div>
              )}

              <div className="mt-4 p-4 bg-obsidian rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-mint/20 text-mint flex items-center justify-center text-xs font-bold">
                    K
                  </div>
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
                    className="text-sm font-bold text-mint hover:text-white transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {aiLoading ? 'Khuzeka is thinking...' : 'Ask Khuzeka to explain this →'}
                  </button>
                )}
              </div>

              {!isRecovery ? (
                <button
                  type="button"
                  onClick={() => setIsRecovery(true)}
                  className="w-full bg-[#FEE2E2] text-stop font-bold py-3 rounded-xl hover:bg-red-200 transition-colors mt-2 text-sm border border-red-200"
                >
                  🚨 I already sent the money!
                </button>
              ) : (
                <div className="mt-4 p-5 bg-[#FEF3C7]/30 border border-wait/50 rounded-xl animate-in fade-in">
                  <h4 className="font-bold text-wait mb-2 flex items-center gap-2">
                    <AlertTriangle size={18} /> Recovery Mode Activated
                  </h4>
                  <p className="text-sm text-obsidian mb-4 font-medium">
                    Do not panic. Follow these steps immediately. Khuzeka has prepared
                    your evidence pack.
                  </p>

                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <span className="text-xs font-bold text-slate uppercase">Step 1</span>
                      <p className="text-sm font-bold text-obsidian">
                        Call your bank&apos;s fraud line immediately.
                      </p>
                      <p className="text-xs text-slate mt-1">
                        FNB: 087 575 9444 | Capitec: 0860 010 2048
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <span className="text-xs font-bold text-slate uppercase">Step 2</span>
                      <p className="text-sm font-bold text-obsidian">Report to SAPS.</p>
                      <p className="text-xs text-slate mt-1">
                        Open a case. Khusela will generate a report with timestamps and
                        evidence for you to hand to the police.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={downloadEvidenceReport}
                      className="w-full bg-obsidian text-white font-bold py-2 rounded-lg text-sm hover:bg-graphite mt-2 flex items-center justify-center gap-2"
                    >
                      <Download size={16} /> Download Evidence Report
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetAll();
                    onClose();
                  }}
                  className="flex-1 bg-[#F8FAFC] border border-slate-200 text-obsidian font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={saveIncident}
                  className="flex-1 bg-obsidian text-white font-bold py-3 rounded-xl hover:bg-graphite transition-colors"
                >
                  Save to Incident Centre
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}