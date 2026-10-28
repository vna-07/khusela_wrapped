import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, ArrowUpRight, Banknote, MessageSquare, Truck, ShieldAlert, BookOpen, Zap,
  Lock, Eye, Clock, AlertTriangle, Sparkles, Shield, Check, X, ChevronDown, Bot, Globe
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
const FOREST = '#172820';
const MINT = '#55E6C1';
const DEEP = '#087F68';
const SLATE = '#606961';

const VERDICT = {
  STOP:  { c: '#B43C28', tint: '#F6E3DD', blob: '#E8806C', label: 'STOP' },
  WAIT:  { c: '#C8780A', tint: '#F7EBD2', blob: '#F2B84B', label: 'WAIT' },
  MATCH: { c: '#168050', tint: '#DCF3E7', blob: MINT,      label: 'MATCH' },
};

const THEMES = {
  light: { bg: '#F5F6F3', a: '#E8EBE4', b: MINT,      dot: 'rgba(23,40,32,.10)' },
  warm:  { bg: '#F6EFE3', a: '#F3DDB8', b: '#F2A65A', dot: 'rgba(120,70,20,.10)' },
  mint:  { bg: '#E5F6EF', a: '#C7EFE0', b: MINT,      dot: 'rgba(8,127,104,.12)' },
  dark:  { bg: FOREST,    a: '#0F3A2C', b: MINT,      dot: 'rgba(255,255,255,.07)' },
};

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */
const SCENARIOS = [
  {
    id: 'name', tab: 'Wrong name', verdict: 'WAIT',
    chat: '"Paid already. The courier is waiting!"',
    fields: [
      ['Amount', 'R1,800.00', 'R1,800.00', true],
      ['Recipient', 'Thabo Sneakers', 'T. Mokoena', false],
      ['Reference', 'SNK-0412', 'SNK-0412', true],
    ],
    prints: 'No close match from another seller',
    reasons: ['The recipient name differs from your business.', 'No bank alert was supplied to cross-check.'],
    say: 'The amount matches, but the recipient name is different. Do not release the goods yet.',
  },
  {
    id: 'reuse', tab: 'Reused screenshot', verdict: 'STOP',
    chat: '"Please hurry, I have to leave."',
    fields: [
      ['Amount', 'R1,800.00', 'R1,800.00', true],
      ['Recipient', 'Thabo Sneakers', 'Thabo Sneakers', true],
      ['Reference', 'SNK-0412', 'SNK-0412', true],
    ],
    prints: '94% similar to an image another seller checked earlier',
    reasons: ['Near-identical image seen from a different seller.', 'Treat as a possible reused fake. This is a warning sign, not proof.'],
    say: 'Every field matches, but this image looks almost identical to one a different seller checked. Do not dispatch.',
  },
  {
    id: 'refund', tab: 'Refund pressure', verdict: 'WAIT',
    chat: '"I overpaid by R2,000. Send R200 back now."',
    fields: [
      ['Amount', 'R1,800.00', 'R3,800.00', false],
      ['Recipient', 'Thabo Sneakers', 'Thabo Sneakers', true],
      ['Reference', 'SNK-0412', 'SNK-0412', true],
    ],
    prints: 'No close match from another seller',
    reasons: ['The amount does not match your sale.', 'Urgency plus a refund request is a known scam pattern.'],
    say: 'Do not send any refund yet. Money that really arrived will show in your bank app.',
  },
  {
    id: 'ok', tab: 'Details match', verdict: 'MATCH',
    chat: '"Here is my proof of payment."',
    fields: [
      ['Amount', 'R1,800.00', 'R1,800.00', true],
      ['Recipient', 'Thabo Sneakers', 'Thabo Sneakers', true],
      ['Reference', 'SNK-0412', 'SNK-0412', true],
    ],
    prints: 'No close match from another seller',
    reasons: ['Amount, name and reference agree with your sale.'],
    say: 'The details match your sale. Khusela cannot see your balance, so check it before you release the goods.',
  },
];

const THREATS = [
  'Edited payment proofs', 'Reused screenshots', 'Overpayment refund scams', 'Fake bank SMS and links',
  'Fake courier messages', 'Supplier bank-detail changes', 'SIM-swap warning signs', 'Account-suspension threats',
  'Fake Harvard Certificates', 'Altered Invoices'
];

const MOMENTS = [
  {
    icon: Banknote, title: 'A payment arrives',
    scam: 'An edited or reused proof of payment. An "overpayment" and a request for a refund. Pressure to dispatch before you can check.',
    help: 'Khusela compares the amount, name and reference with your sale and checks image fingerprints. Then it reminds you to confirm in your bank app.',
  },
  {
    icon: MessageSquare, title: 'A message asks you to act',
    scam: 'Bank-impersonation links, fake courier or collection SMS, threats that your account will be suspended today.',
    help: 'Khusela flags the urgency, lookalike links and requests for PINs or OTPs, and drafts a safe reply for you to approve.',
  },
  {
    icon: Truck, title: 'A supplier asks for money',
    scam: 'Invoice fraud: "we have changed our banking details". The message looks like your supplier, but it is not.',
    help: 'Khusela compares the new details with the ones you saved, and walks you through a callback to a number you already trust.',
  },
  {
    icon: Globe, title: 'A scam hits the network',
    scam: 'A fake proof of payment is sent to multiple sellers in the same area on the same day.',
    help: 'Our Live Network Feed and Shared Registry instantly alert other opted-in sellers. We share the cryptographic hash, never your private conversations.',
  },
];

const STEPS = [
  ['Forward it anywhere', 'Send the screenshot, message or document via the Web App or our Telegram Bot.'],
  ['Intelligent Classification', 'The system auto-detects if it is a payment, invoice, certificate or suspicious link.'],
  ['Extraction & Sync', 'OCR extracts the text. Telegram uploads instantly sync to the Web Dashboard.'],
  ['Rules decide', 'Deterministic logic returns CONSISTENT, REVIEW REQUIRED, SUSPICIOUS, or UNVERIFIED.'],
  ['Khuzeka explains', 'The AI assistant puts the result in plain language and suggests next steps.'],
  ['Evidence & Report', 'You check your bank app, save to the Incident Centre, and export a tamper-evident PDF.'],
];

const TRUST = [
  [Lock, 'No passwords, PINs or OTPs', 'Khusela never asks for them and never connects to your bank account.'],
  [Shield, 'Rules decide, AI explains', 'A model can raise a warning. It can never turn a warning into an approval.'],
  [AlertTriangle, 'It never says "paid"', 'The best result is "details match". The bank app has the final word.'],
  [Globe, 'Universal Document Intel', 'We investigate certificates and invoices, detecting placeholder text instantly.'],
  [Eye, 'Cross-Channel Magic', 'Telegram and the Web Dashboard share the exact same backend, cases, and audit logs.'],
  [Clock, 'POPIA by design', 'Raw images are deleted. Fingerprints and verdicts are kept for 90 days.'],
];

const FAQ = [
  ['Does Khusela tell me a payment is safe?', 'No. It tells you whether the evidence matches your sale and what looks wrong. Only your bank can confirm that money arrived, so every result ends with a reminder to check your bank app.'],
  ['Does it need my banking login?', 'No. You forward what you received via Telegram or the Web App. Khusela never asks for passwords, PINs or OTPs.'],
  ['What if the AI gets something wrong?', 'The AI does not make the decision. Fixed rules produce the verdict (CONSISTENT, REVIEW REQUIRED, SUSPICIOUS), and the AI only explains. If the AI is unavailable, plain templates take over.'],
  ['Can I check things other than payments?', 'Yes. Our Universal Investigator identifies invoices, bank statements, certificates, and supplier messages. If you upload a fake Harvard certificate, it flags the placeholder text instead of verifying it.'],
  ['Why is it free for sellers?', 'Banks, payment providers and wholesalers lose money to merchant fraud, so they can sponsor protection for their merchants. This is our plan, and we still need to confirm it with a pilot.'],
  ['Where does my data go?', 'In this prototype only synthetic data is used. The design keeps data to a minimum, deletes raw images, and sends only redacted summaries to text AI models.'],
];

const TEAM = [
  { initials: 'AD', name: 'Andiswa (MissRose)', role: 'Project Lead & Integration', desc: 'Coordinates the team, connects the technical workstreams and leads the product demonstration.' },
  { initials: 'SD', name: 'Sphiwe Dube', role: 'Data Systems & Auth', desc: 'Builds the data layer, account systems and foundations for secure, separated user records.' },
  { initials: 'AV', name: 'Ayanda Vena', role: 'Risk Intelligence & AI', desc: 'Develops the deterministic risk engine and the AI explanations that make its findings understandable.' },
  { initials: 'NM', name: 'Nyakallo Masiu', role: 'Document Intelligence (OCR)', desc: 'Develops the pipeline that extracts transaction details from screenshots and documents.' },
  { initials: 'NL', name: 'Ntoampi LP', role: 'Frontend Engineering & UX', desc: 'Builds the interface through which users interact with scans, findings and incident records.' },
];

const ROTATING = ['a fake receipt arrives', 'a phishing link is sent', 'a supplier changes details', 'a scam hits the network'];

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */
const CSS = `
@keyframes kh-drift1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(70px,-40px) scale(1.12)}66%{transform:translate(-50px,35px) scale(.94)}}
@keyframes kh-drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-80px,60px) scale(1.1)}}
@keyframes kh-drift3{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,-70px) scale(1.15)}}
@keyframes kh-hue{0%,100%{filter:hue-rotate(-28deg)}50%{filter:hue-rotate(34deg)}}
@keyframes kh-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes kh-pop{0%{opacity:0;transform:translateY(10px) scale(.97)}100%{opacity:1;transform:none}}
@keyframes kh-scan{0%{top:-4%}100%{top:104%}}
@keyframes kh-ring{0%{box-shadow:0 0 0 0 rgba(85,230,193,.55)}100%{box-shadow:0 0 0 14px rgba(85,230,193,0)}}
@keyframes kh-float{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-16px) rotate(calc(var(--r,0deg) + 4deg))}}
@keyframes kh-dots{0%,80%,100%{opacity:.25}40%{opacity:1}}
@keyframes kh-shine{0%{background-position:0% 50%}100%{background-position:200% 50%}}
.kh-drift1{animation:kh-drift1 26s ease-in-out infinite}
.kh-drift2{animation:kh-drift2 32s ease-in-out infinite}
.kh-drift3{animation:kh-drift3 38s ease-in-out infinite}
.kh-hue{animation:kh-hue 22s ease-in-out infinite}
.kh-marquee{animation:kh-marquee 38s linear infinite}
.kh-pop{animation:kh-pop .45s cubic-bezier(.2,.8,.2,1) both}
.kh-scan{animation:kh-scan 1.8s linear infinite}
.kh-ring{animation:kh-ring 1.6s ease-out infinite}
.kh-float{animation:kh-float 9s ease-in-out infinite}
.kh-dot{animation:kh-dots 1.1s infinite}
.kh-shine{background-image:linear-gradient(90deg,currentColor 0%,${MINT} 45%,currentColor 90%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:kh-shine 7s linear infinite}
.kh-reveal{opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}
.kh-reveal.in{opacity:1;transform:none}
.kh-root a:focus-visible,.kh-root button:focus-visible{outline:2px solid ${DEEP};outline-offset:3px;border-radius:8px}
@media (prefers-reduced-motion:reduce){
  .kh-root *{animation:none!important;transition:none!important}
  .kh-reveal{opacity:1;transform:none}
}
`;

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`kh-reveal ${shown ? 'in' : ''} ${className}`}>
      {children}
    </div>
  );
}

function CountUp({ to, suffix = '' }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / 1400, 1);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

function Tilt({ children, className = '', max = 7 }) {
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ''; };
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} className={`transition-transform duration-200 will-change-transform ${className}`}>
      {children}
    </div>
  );
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ------------------------------------------------------------------ */
/* Dynamic background                                                  */
/* ------------------------------------------------------------------ */
function Backdrop({ t }) {
  const tr = 'background-color 1.4s ease';
  const mask = 'radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%)';
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ backgroundColor: t.bg, transition: tr }}>
      <div className="absolute inset-0 kh-hue">
        <div className="absolute -top-44 left-1/2 w-[820px] h-[820px] -ml-[410px] rounded-full blur-[120px] kh-drift1"
          style={{ backgroundColor: t.a, opacity: 0.75, transition: tr }} />
        <div className="absolute top-[8%] -right-40 w-[560px] h-[560px] rounded-full blur-[140px] kh-drift2"
          style={{ backgroundColor: t.b, opacity: 0.24, transition: tr }} />
        <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full blur-[130px] kh-drift3"
          style={{ backgroundColor: t.b, opacity: 0.16, transition: tr }} />
      </div>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(${t.dot} 1px, transparent 1px)`, backgroundSize: '28px 28px',
        maskImage: mask, WebkitMaskImage: mask,
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(480px circle at var(--mx,50%) var(--my,30%), rgba(85,230,193,.16), transparent 62%)',
      }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Verdict card + live demo                                            */
/* ------------------------------------------------------------------ */
function VerdictCard({ s }) {
  const v = VERDICT[s.verdict];
  return (
    <div className="kh-pop rounded-2xl bg-white border overflow-hidden shadow-xl" style={{ borderColor: `${v.c}55` }}>
      <div className="flex items-center justify-between px-5 py-3 text-white" style={{ backgroundColor: v.c }}>
        <span className="font-black tracking-wide text-lg">{v.label}</span>
        <span className="text-xs font-semibold opacity-90">
          {s.verdict === 'STOP' ? 'Do not dispatch' : s.verdict === 'WAIT' ? 'Check your bank app first' : 'Details agree with your sale'}
        </span>
      </div>
      <div className="p-5 space-y-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs" style={{ color: SLATE }}>
              <th className="font-semibold pb-1">Check</th><th className="font-semibold pb-1">Your sale</th><th className="font-semibold pb-1">Found in proof</th><th />
            </tr>
          </thead>
          <tbody>
            {s.fields.map(([k, exp, got, ok]) => (
              <tr key={k} className="border-t border-black/5">
                <td className="py-1.5 font-semibold">{k}</td>
                <td className="py-1.5">{exp}</td>
                <td className="py-1.5 font-semibold" style={{ color: ok ? FOREST : VERDICT.STOP.c }}>{got}</td>
                <td className="py-1.5 text-right">{ok ? <Check size={16} color={VERDICT.MATCH.c} /> : <X size={16} color={VERDICT.STOP.c} />}</td>
              </tr>
            ))}
            <tr className="border-t border-black/5">
              <td className="py-1.5 font-semibold">Fingerprint</td>
              <td className="py-1.5 text-xs" colSpan={2} style={{ color: s.verdict === 'STOP' ? VERDICT.STOP.c : FOREST }}>{s.prints}</td>
              <td className="py-1.5 text-right">{s.verdict === 'STOP' ? <X size={16} color={VERDICT.STOP.c} /> : <Check size={16} color={VERDICT.MATCH.c} />}</td>
            </tr>
          </tbody>
        </table>
        <ul className="text-sm space-y-1 list-disc pl-5" style={{ color: FOREST }}>
          {s.reasons.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <div className="flex gap-3 rounded-xl p-3" style={{ backgroundColor: `${v.c}12` }}>
          <Bot size={18} className="shrink-0 mt-0.5" color={v.c} />
          <p className="text-sm leading-snug"><span className="font-bold">Khuzeka: </span>{s.say}</p>
        </div>
        <p className="text-xs" style={{ color: SLATE }}>Confirm the money in your bank app before you release goods.</p>
      </div>
    </div>
  );
}

const STEP_LABELS = ['Evidence received', 'Classifying document', 'Comparing with records', 'Checking fingerprints'];

function LiveCheck({ onVerdict }) {
  const [i, setI] = useState(0);
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const hover = useRef(false);
  const s = SCENARIOS[i];

  useEffect(() => {
    if (!auto) return undefined;
    const id = setInterval(() => { if (!hover.current) setStep((p) => p + 1); }, 950);
    return () => clearInterval(id);
  }, [auto]);

  useEffect(() => {
    if (step === 4 && onVerdict) onVerdict(s.verdict);
    if (step >= 11 && auto) { setStep(0); setI((p) => (p + 1) % SCENARIOS.length); }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (idx) => { setAuto(false); setI(idx); setStep(4); if (onVerdict) onVerdict(SCENARIOS[idx].verdict); };

  return (
    <div onMouseEnter={() => { hover.current = true; }} onMouseLeave={() => { hover.current = false; }}
      className="rounded-3xl bg-white/80 backdrop-blur border border-black/10 shadow-2xl p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5"><span className="kh-ring absolute inline-flex h-full w-full rounded-full" style={{ backgroundColor: DEEP }} /><span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: DEEP }} /></span>
        <span className="text-sm font-bold">Live check</span>
        <span className="ml-auto text-xs" style={{ color: SLATE }}>Synthetic example</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4" role="tablist" aria-label="Example scenarios">
        {SCENARIOS.map((sc, idx) => (
          <button key={sc.id} type="button" onClick={() => pick(idx)} aria-pressed={idx === i}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
            style={idx === i ? { backgroundColor: FOREST, color: '#fff', borderColor: FOREST } : { borderColor: 'rgba(23,40,32,.15)', color: FOREST }}>
            {sc.tab}
          </button>
        ))}
      </div>
      <div className="min-h-[27rem]">
        {step < 4 ? (
          <div className="space-y-4">
            <div className="relative h-44 rounded-2xl bg-[#F5F6F3] border border-black/5 overflow-hidden p-4">
              <p className="text-xs mb-3" style={{ color: SLATE }}>Buyer says: <span className="font-semibold" style={{ color: FOREST }}>{s.chat}</span></p>
              {[70, 92, 55, 80, 40].map((w, k) => <div key={k} className="h-2 rounded bg-black/10 mb-2.5" style={{ width: `${w}%` }} />)}
              <div className="kh-scan absolute left-0 right-0 h-10" style={{ background: `linear-gradient(to bottom, transparent, ${MINT}66, transparent)` }} />
            </div>
            <ul className="space-y-2">
              {STEP_LABELS.map((l, idx) => (
                <li key={l} className="flex items-center gap-3 text-sm transition-opacity duration-300" style={{ opacity: idx <= step ? 1 : 0.35 }}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ backgroundColor: idx < step ? DEEP : 'rgba(23,40,32,.25)' }}>
                    {idx < step ? <Check size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        ) : <VerdictCard key={s.id} s={s} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Khuzeka chat demo                                                   */
/* ------------------------------------------------------------------ */
const CHAT = [
  { from: 'you', t: 'He says he paid R1,800 and the courier is waiting.' },
  { from: 'k', t: 'I checked the proof. The amount matches, but the recipient name is different from your business. Please do not release the goods yet.' },
  { from: 'k', t: 'Open your bank app and look for a R1,800 credit. Want me to draft a polite reply asking him to confirm?' },
  { from: 'you', t: 'Yes, draft it.' },
  { from: 'k', t: '"Hi, I cannot see the payment in my account yet. Please send the confirmation from your bank app and I will dispatch once it shows."', draft: true },
];

function ChatDemo() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [n, setN] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started || n >= CHAT.length) { setTyping(false); return undefined; }
    const isK = CHAT[n].from === 'k';
    setTyping(isK);
    const id = setTimeout(() => { setTyping(false); setN((p) => p + 1); }, isK ? 1500 : 900);
    return () => clearTimeout(id);
  }, [started, n]);

  return (
    <div ref={ref} className="rounded-3xl bg-white border border-black/10 shadow-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3" style={{ backgroundColor: FOREST }}>
        <div className="h-8 w-8 rounded-full flex items-center justify-center font-black" style={{ backgroundColor: MINT, color: FOREST }}>K</div>
        <div><p className="text-sm font-bold text-white leading-none">Khuzeka</p><p className="text-xs text-[#A0B0A6]">Your security assistant</p></div>
        <button type="button" onClick={() => { setN(0); setStarted(true); }} className="ml-auto text-xs font-semibold text-[#55E6C1] hover:text-white transition-colors">Replay</button>
      </div>
      <div className="p-4 space-y-3 min-h-[23rem] bg-[#F5F6F3]">
        {CHAT.slice(0, n).map((m, idx) => (
          <div key={idx} className={`kh-pop flex ${m.from === 'you' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-snug ${m.from === 'you' ? 'text-white rounded-br-sm' : 'bg-white border border-black/5 rounded-bl-sm'} ${m.draft ? 'italic' : ''}`}
              style={m.from === 'you' ? { backgroundColor: DEEP } : undefined}>
              {m.t}
              {m.draft && <span className="block not-italic text-xs mt-2 font-semibold" style={{ color: SLATE }}>Draft only. You review it before anything is sent.</span>}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start"><div className="rounded-2xl rounded-bl-sm bg-white border border-black/5 px-4 py-3 flex gap-1">
            {[0, 1, 2].map((d) => <span key={d} className="kh-dot h-1.5 w-1.5 rounded-full bg-[#606961]" style={{ animationDelay: `${d * 0.18}s` }} />)}
          </div></div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Landing({ onEnter }) {
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const lineRef = useRef(null);
  const howRef = useRef(null);
  const [theme, setTheme] = useState('hero');
  const [heroVerdict, setHeroVerdict] = useState('WAIT');
  const [scrolled, setScrolled] = useState(false);
  const [word, setWord] = useState(0);
  const [moment, setMoment] = useState(0);
  const [faq, setFaq] = useState(0);

  // Cursor spotlight + scroll progress + timeline line (no re-renders)
  useEffect(() => {
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        rootRef.current?.style.setProperty('--mx', `${e.clientX}px`);
        rootRef.current?.style.setProperty('--my', `${e.clientY}px`);
      });
    };
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      setScrolled((prev) => (prev !== h.scrollTop > 24 ? !prev : prev));
      const how = howRef.current;
      if (how && lineRef.current) {
        const r = how.getBoundingClientRect();
        const q = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
        lineRef.current.style.transform = `scaleY(${q})`;
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  // Background theme follows the section in the middle of the screen
  useEffect(() => {
    const els = document.querySelectorAll('[data-theme]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setTheme(e.target.getAttribute('data-theme')); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Rotating hero phrase
  useEffect(() => {
    const id = setInterval(() => setWord((w) => (w + 1) % ROTATING.length), 2600);
    return () => clearInterval(id);
  }, []);

  const hv = VERDICT[heroVerdict];
  const t = theme === 'hero' ? { bg: hv.tint, a: hv.tint, b: hv.blob, dot: 'rgba(23,40,32,.10)' } : THEMES[theme] || THEMES.light;
  const dark = theme === 'dark';
  const M = MOMENTS[moment];

  return (
    <div ref={rootRef} className="kh-root relative min-h-screen font-sans overflow-x-hidden selection:bg-[#172820] selection:text-[#55E6C1]" style={{ color: FOREST }}>
      <style>{CSS}</style>
      <Backdrop t={t} />
      <div ref={barRef} aria-hidden="true" className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left" style={{ backgroundColor: MINT, transform: 'scaleX(0)' }} />

      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${scrolled ? 'backdrop-blur-md py-3' : 'py-6'}`}
        style={{ backgroundColor: scrolled ? (dark ? 'rgba(23,40,32,.8)' : 'rgba(245,246,243,.75)') : 'transparent', color: dark ? '#F5F6F3' : FOREST }}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <button type="button" onClick={() => scrollToId('top')} className="flex items-center gap-3" aria-label="Khusela home">
            <div className="w-9 h-9 grid grid-cols-2 gap-0.5 rotate-45 transition-transform duration-700 hover:rotate-[225deg]">
              <div className="rounded-tl-full rounded-bl-full" style={{ backgroundColor: dark ? '#fff' : FOREST }} />
              <div className="rounded-tr-full rounded-br-full" style={{ backgroundColor: MINT }} />
              <div className="rounded-tl-full rounded-bl-full" style={{ backgroundColor: MINT }} />
              <div className="rounded-tr-full rounded-br-full" style={{ backgroundColor: dark ? '#fff' : FOREST }} />
            </div>
            <span className="text-xl font-black tracking-[0.18em]">KHUSELA</span>
          </button>
          <div className="hidden lg:flex items-center gap-7 text-sm font-semibold">
            {[['moments', 'Where scams strike'], ['how', 'How it works'], ['khuzeka', 'Khuzeka'], ['trust', 'Trust'], ['team', 'Team'], ['faq', 'Questions']].map(([id, l]) => (
              <button key={id} type="button" onClick={() => scrollToId(id)} className="opacity-70 hover:opacity-100 transition-opacity">{l}</button>
            ))}
          </div>
          <button type="button" onClick={onEnter} className="text-sm font-bold flex items-center gap-2 group">
            Sign in <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      <div className="relative z-10">
        {/* 1. HERO */}
        <header id="top" data-theme="hero" className="relative">
          <div aria-hidden="true" className="absolute top-40 left-[46%] h-14 w-14 rounded-2xl border-2 kh-float hidden md:block" style={{ borderColor: `${hv.c}66`, '--r': '12deg', transition: 'border-color 1s' }} />
          <div aria-hidden="true" className="absolute bottom-24 left-[6%] h-8 w-8 rounded-full kh-float" style={{ backgroundColor: `${hv.c}33`, animationDelay: '-3s', transition: 'background-color 1s' }} />
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-36 md:pt-44 pb-24 grid lg:grid-cols-[1.05fr_.95fr] gap-14 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-[#55E6C1] mb-8" style={{ backgroundColor: FOREST }}>
                HackSecure 2026, Track 3: SMME Cyber Protection
              </span>
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.98] mb-6">
                Check the evidence before the stock leaves.
              </h1>
              <p className="text-xl md:text-2xl font-semibold mb-6 h-16 md:h-9" style={{ color: DEEP }}>
                Protecting your business when{' '}
                <span key={word} className="kh-pop inline-block kh-shine">{ROTATING[word]}</span>
              </p>
              <p className="text-lg text-[#606961] max-w-xl leading-relaxed mb-10 font-medium">
                Forward a document via the Web App or our Telegram Bot. Khusela's Universal Investigator extracts the details, checks the rules, and Khuzeka explains the risk in plain language. <strong>Free for small businesses.</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={onEnter}
                  className="font-bold py-4 px-8 rounded-xl text-lg text-[#F5F6F3] flex items-center justify-center gap-3 group hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300"
                  style={{ backgroundColor: FOREST }}>
                  Enter web platform
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="https://t.me/KHUSELABot" target="_blank" rel="noopener noreferrer"
                  className="bg-[#229ED9] text-white font-bold py-4 px-8 rounded-xl text-lg hover:bg-[#1e8bc0] hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                  Try the Telegram bot
                </a>
              </div>
            </div>
            <Tilt max={4}><LiveCheck onVerdict={setHeroVerdict} /></Tilt>
          </div>
        </header>

        {/* Threat marquee */}
        <div aria-hidden="true" className="border-y border-black/10 bg-white/40 backdrop-blur overflow-hidden py-4">
          <div className="kh-marquee flex w-max gap-10 whitespace-nowrap text-sm font-semibold">
            {[...THREATS, ...THREATS].map((x, idx) => (
              <span key={idx} className="flex items-center gap-10" style={{ color: SLATE }}>{x}<span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: MINT }} /></span>
            ))}
          </div>
        </div>

        {/* 2. TRACK 3 */}
        <section data-theme="light" className="py-24">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mb-14">A security toolkit for businesses with no IT department.</h2></Reveal>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                [Zap, 'Low-cost toolkit', 'Free to the seller. A zero-install web app plus a Telegram bot. No passwords, no bank login, no IT skills needed.'],
                [ShieldAlert, 'Incident response', 'When something goes wrong, step-by-step playbooks and a tamper-evident evidence report you can give to your bank or the police.'],
                [BookOpen, 'Awareness', 'Khuzeka explains why something looks dangerous in plain language, and a Live Threat Feed warns you about scams in your area.'],
              ].map(([Icon, h, d], idx) => (
                <Reveal key={h} delay={idx * 120}>
                  <Tilt className="h-full border-t-2 pt-6" max={5}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-[#55E6C1]" style={{ backgroundColor: FOREST }}><Icon size={24} /></div>
                    <h3 className="text-xl font-bold mb-2">{h}</h3>
                    <p className="leading-relaxed" style={{ color: SLATE }}>{d}</p>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 3. WHERE SCAMS STRIKE */}
        <section id="moments" data-theme="warm" className="py-24">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mb-4">Small businesses are attacked at four moments.</h2></Reveal>
            <Reveal delay={100}><p className="text-lg max-w-2xl mb-12" style={{ color: SLATE }}>Pick one to see what the scam looks like and how Khusela responds.</p></Reveal>
            <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-8 items-start">
              <div className="flex flex-col gap-2" role="tablist">
                {MOMENTS.map((m, idx) => {
                  const Icon = m.icon;
                  const on = idx === moment;
                  return (
                    <button key={m.title} type="button" role="tab" aria-selected={on} onClick={() => setMoment(idx)}
                      className="flex items-center gap-4 text-left rounded-2xl px-5 py-4 border transition-all duration-300 hover:translate-x-1"
                      style={on ? { backgroundColor: FOREST, color: '#fff', borderColor: FOREST } : { backgroundColor: 'rgba(255,255,255,.6)', borderColor: 'rgba(23,40,32,.1)' }}>
                      <Icon size={22} color={on ? MINT : DEEP} />
                      <span className="font-bold">{m.title}</span>
                    </button>
                  );
                })}
              </div>
              <div key={moment} className="kh-pop rounded-3xl bg-white/80 backdrop-blur border border-black/10 shadow-xl p-8 md:p-10 grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: VERDICT.STOP.c }}>What the scam looks like</p>
                  <p className="text-lg leading-relaxed">{M.scam}</p>
                </div>
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: DEEP }}>What Khusela does</p>
                  <p className="text-lg leading-relaxed">{M.help}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS */}
        <section id="how" data-theme="mint" className="py-24">
          <div className="max-w-[1100px] mx-auto px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">From forward to decision in seconds.</h2></Reveal>
            <Reveal delay={100}><p className="text-lg mb-14 max-w-2xl" style={{ color: SLATE }}>Everything that decides is a fixed rule you can test. The AI only explains.</p></Reveal>
            <div ref={howRef} className="relative pl-12 md:pl-16">
              <div className="absolute left-[15px] md:left-[23px] top-2 bottom-2 w-0.5 bg-black/10" />
              <div ref={lineRef} className="absolute left-[15px] md:left-[23px] top-2 bottom-2 w-0.5 origin-top" style={{ backgroundColor: DEEP, transform: 'scaleY(0)' }} />
              <div className="space-y-10">
                {STEPS.map(([h, d], idx) => (
                  <Reveal key={h} delay={60}>
                    <div className="relative">
                      <span className="absolute -left-12 md:-left-16 top-0 h-8 w-8 md:h-12 md:w-12 rounded-full flex items-center justify-center font-black text-sm md:text-lg text-[#55E6C1]" style={{ backgroundColor: FOREST }}>{idx + 1}</span>
                      <h3 className="text-xl md:text-2xl font-bold mb-1">{h}</h3>
                      <p className="text-lg max-w-xl" style={{ color: SLATE }}>{d}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. KHUZEKA */}
        <section id="khuzeka" data-theme="light" className="py-24">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Khuzeka turns a warning into a plan.</h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: SLATE }}>Khusela finds the problem. Khuzeka, the AI security assistant, explains it in plain language and helps you act on it.</p>
              <ul className="space-y-4">
                {[
                  'Explains which part of the evidence raised the warning.',
                  'Drafts a polite reply. You approve it before anything is sent.',
                  'Builds a task list that stays open until you confirm each step.',
                  'Switches to recovery if money has already been sent.',
                  'Never claims it reported, froze or recovered anything unless that really happened.',
                ].map((x) => (
                  <li key={x} className="flex gap-3 text-lg"><Check size={22} className="shrink-0 mt-1" color={DEEP} />{x}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={150}><ChatDemo /></Reveal>
          </div>
        </section>

        {/* 6. STATS */}
        <section data-theme="light" className="pb-8">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 border-y border-black/10">
            {[
              [4, '', 'moments of attack covered'],
              [3, '', 'clear outcomes: CONSISTENT, REVIEW, SUSPICIOUS'],
              [24, 'h', 'default raw-image retention'],
              [0, '', 'payments approved by AI'],
            ].map(([n, suf, l], idx) => (
              <div key={l} className={`py-10 px-4 md:px-8 ${idx > 0 ? 'md:border-l border-black/10' : ''}`}>
                <p className="text-5xl md:text-6xl font-black tracking-tighter" style={{ color: DEEP }}><CountUp to={n} suffix={suf} /></p>
                <p className="mt-2 font-semibold" style={{ color: SLATE }}>{l}</p>
              </div>
            ))}
          </div>
          <p className="max-w-[1400px] mx-auto px-6 md:px-12 pt-3 text-xs" style={{ color: SLATE }}>These are design facts about the prototype, not measured results.</p>
        </section>

        {/* 7. TRUST */}
        <section id="trust" data-theme="light" className="py-24">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mb-14">Trust is not assumed. It is checked, and the limits are stated.</h2></Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12">
              {TRUST.map(([Icon, h, d], idx) => (
                <Reveal key={h} delay={(idx % 3) * 100}>
                  <div className="border-t border-black/15 py-7 group">
                    <Icon size={24} color={DEEP} className="mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                    <h3 className="text-lg font-bold mb-1">{h}</h3>
                    <p style={{ color: SLATE }}>{d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 8. TEAM */}
        <section id="team" data-theme="dark" className="py-24 text-[#F5F6F3]">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <Reveal>
              <div className="flex flex-col md:flex-row justify-between md:items-end mb-14 gap-6">
                <div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Different disciplines.<br />One direction.</h2>
                  <p className="text-[#A0B0A6] text-lg max-w-xl">Five people building protection for small businesses.</p>
                </div>
                <p className="text-xs font-semibold text-[#55E6C1] border border-[#55E6C1]/30 px-4 py-2 rounded-full w-fit">5 builders, 1 shared mission</p>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEAM.map((m, idx) => (
                <Reveal key={m.name} delay={idx * 90}>
                  <Tilt max={6}>
                    <div className="bg-[#0f1c15] border border-white/5 rounded-2xl p-8 hover:border-[#55E6C1]/50 transition-colors duration-300 group h-full">
                      <div className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center text-xl font-black mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#55E6C1] group-hover:text-[#172820]" style={{ backgroundColor: FOREST, color: MINT }}>{m.initials}</div>
                      <h3 className="text-xl font-bold mb-1">{m.name}</h3>
                      <p className="text-[#55E6C1] text-sm font-semibold mb-4">{m.role}</p>
                      <p className="text-sm text-[#A0B0A6] leading-relaxed">{m.desc}</p>
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FAQ */}
        <section id="faq" data-theme="light" className="py-24">
          <div className="max-w-[900px] mx-auto px-6 md:px-12">
            <Reveal><h2 className="text-3xl md:text-5xl font-black tracking-tight mb-10">Questions we expect.</h2></Reveal>
            <div className="border-t border-black/15">
              {FAQ.map(([q, a], idx) => {
                const open = faq === idx;
                return (
                  <div key={q} className="border-b border-black/15">
                    <button type="button" aria-expanded={open} onClick={() => setFaq(open ? -1 : idx)} className="w-full flex items-center justify-between gap-6 py-5 text-left">
                      <span className="text-lg font-bold">{q}</span>
                      <ChevronDown size={22} className="shrink-0 transition-transform duration-300" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
                    </button>
                    <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .35s ease' }}>
                      <div className="overflow-hidden"><p className="pb-5 text-lg leading-relaxed" style={{ color: SLATE }}>{a}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 10. FOOTER */}
        <footer data-theme="dark" className="py-20 text-center" style={{ color: '#F5F6F3' }}>
          <div className="flex justify-center items-center gap-3 mb-5">
            <div className="w-8 h-8 grid grid-cols-2 gap-0.5 rotate-45">
              <div className="rounded-tl-full rounded-bl-full" style={{ backgroundColor: MINT }} />
              <div className="rounded-tr-full rounded-br-full bg-white" />
              <div className="rounded-tl-full rounded-bl-full bg-white" />
              <div className="rounded-tr-full rounded-br-full" style={{ backgroundColor: MINT }} />
            </div>
            <span className="text-xl font-black tracking-[0.18em]">KHUSELA</span>
          </div>
          <p className="text-[#A0B0A6] mb-8 font-medium">Secure the bag. Protect the business.</p>
          <button type="button" onClick={onEnter}
            className="font-bold py-3 px-8 rounded-xl hover:bg-white transition-colors inline-flex items-center gap-2 shadow-lg" style={{ backgroundColor: MINT, color: FOREST }}>
            Enter platform <ArrowUpRight size={18} />
          </button>
          <p className="mt-10 text-xs text-[#A0B0A6]">Prototype for HackSecure 2026. Synthetic data only. Legal and privacy positions are provisional.</p>
        </footer>
      </div>
    </div>
  );
}