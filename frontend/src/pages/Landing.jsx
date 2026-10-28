import { ArrowRight, ArrowUpRight, Shield, Target, Zap, MessageSquare, ShieldAlert, BookOpen } from 'lucide-react';

export default function Landing({ onEnter }) {
  const team = [
    {
      initials: "AD",
      name: "Andiswa (MissRose)",
      role: "Project Lead & Integration",
      desc: "Coordinates the team, connects the technical workstreams and leads the product demonstration."
    },
    {
      initials: "SD",
      name: "Sphiwe Dube",
      role: "Data Systems & Auth",
      desc: "Builds the data layer, account systems and foundations for secure, separated user records."
    },
    {
      initials: "AV",
      name: "Ayanda Vena",
      role: "Risk Intelligence & AI",
      desc: "Develops the deterministic risk engine and the AI explanations that make its findings understandable."
    },
    {
      initials: "NM",
      name: "Nyakallo Masiu",
      role: "Document Intelligence (OCR)",
      desc: "Develops the pipeline that extracts transaction details from screenshots and documents."
    },
    {
      initials: "NL",
      name: "Ntoampi LP",
      role: "Frontend Engineering & UX",
      desc: "Builds the interface through which users interact with scans, findings and incident records."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F3] text-[#172820] font-sans overflow-x-hidden selection:bg-[#172820] selection:text-[#55E6C1]">
      
      {/* 1. SOFT ENTRANCE HERO SECTION */}
      <div className="relative overflow-hidden">
        {/* Subtle background ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#E8EBE4] rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#55E6C1] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

        <nav className="relative z-10 flex justify-between items-center px-6 md:px-12 py-6 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 grid grid-cols-2 gap-0.5 transform rotate-45">
              <div className="bg-[#172820] rounded-tl-full rounded-bl-full"></div>
              <div className="bg-[#55E6C1] rounded-tr-full rounded-br-full"></div>
              <div className="bg-[#55E6C1] rounded-tl-full rounded-bl-full"></div>
              <div className="bg-[#172820] rounded-tr-full rounded-br-full"></div>
            </div>
            <span className="text-xl font-black tracking-[0.2em] text-[#172820]">KHUSELA</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:block font-mono text-xs font-bold tracking-widest uppercase text-[#606961]">
              HackSecure 2026
            </span>
            <button 
              onClick={onEnter}
              className="text-sm font-bold text-[#172820] hover:text-[#087F68] transition-colors flex items-center gap-2"
            >
              Sign In <ArrowRight size={16} />
            </button>
          </div>
        </nav>

        <main className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-24">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <span className="px-3 py-1 rounded-full bg-[#172820] text-[#55E6C1] text-xs font-bold tracking-widest uppercase">
                Track 3 · SMME Cyber Protection
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              Security that<br />
              understands <span className="text-[#087F68] italic font-serif">context.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-[#606961] max-w-2xl leading-relaxed mb-12 font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              A cybersecurity solution designed to help South African small businesses identify suspicious payment proofs and recognise common digital scams. Trust isn't assumed. It's verified.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
              <button 
                onClick={onEnter}
                className="bg-[#172820] text-[#F5F6F3] font-bold py-4 px-8 rounded-xl text-lg hover:bg-black hover:shadow-2xl hover:shadow-[#172820]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                Enter Web Platform
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              {/* Try Telegram Bot — opens the bot in a new tab */}
              <a 
                href="https://t.me/KHUSELABot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#229ED9] text-white font-bold py-4 px-8 rounded-xl text-lg hover:bg-[#1e8bc0] hover:shadow-2xl hover:shadow-[#229ED9]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Try Telegram Bot
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* 2. TRACK 3 ALIGNMENT PILLARS */}
      <section className="border-y border-[#172820]/10 bg-[#E8EBE4]/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-700 delay-500">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#172820] flex items-center justify-center text-[#55E6C1]">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold">Low-Cost Toolkits</h3>
              <p className="text-[#606961] leading-relaxed">Zero-install web app + WhatsApp bot. Requires no IT department and runs on free-tier infrastructure.</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#172820] flex items-center justify-center text-[#55E6C1]">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-xl font-bold">Incident Response</h3>
              <p className="text-[#606961] leading-relaxed">Deterministic rules engine. Generates tamper-evident PDF reports ready for SAPS and banks.</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#172820] flex items-center justify-center text-[#55E6C1]">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold">Awareness & AI</h3>
              <p className="text-[#606961] leading-relaxed">Khuzeka AI explains *why* a link is dangerous in plain, culturally relevant language.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROJECT OVERVIEW */}
      <section className="py-24">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">What we're building.</h2>
            <p className="text-[#606961] text-xl leading-relaxed mb-8">
              Khusela focuses on making digital payment verification and scam awareness accessible to small businesses, including informal traders and sellers operating through WhatsApp and social media.
            </p>
            <div className="space-y-6 font-mono text-sm bg-white p-6 rounded-2xl border border-[#172820]/10 shadow-sm">
              <div className="flex items-start gap-4">
                <Target size={20} className="text-[#087F68] shrink-0 mt-1" /> 
                <div>
                  <span className="text-[#172820] font-bold block mb-1">Precision over guesswork.</span>
                  <span className="text-[#606961]">Deterministic detection, explainable findings and secure systems.</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MessageSquare size={20} className="text-[#087F68] shrink-0 mt-1" /> 
                <div>
                  <span className="text-[#172820] font-bold block mb-1">Clarity in every decision.</span>
                  <span className="text-[#606961]">Turning complex risk signals into practical next steps.</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-[#172820]/10 shadow-2xl shadow-[#172820]/5 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="flex items-center gap-3 mb-6 border-b border-[#172820]/10 pb-4">
              <div className="w-3 h-3 rounded-full bg-[#172820]"></div>
              <div className="w-3 h-3 rounded-full bg-[#55E6C1]"></div>
              <div className="w-3 h-3 rounded-full bg-[#E8EBE4]"></div>
              <span className="font-mono text-xs font-bold text-[#606961] uppercase tracking-wider ml-auto">Verification Pipeline</span>
            </div>
            <div className="space-y-4">
              <div className="bg-[#F5F6F3] p-4 rounded-xl border border-[#172820]/5 flex justify-between items-center">
                <span className="font-bold text-sm">Evidence Captured</span>
                <span className="text-xs font-mono bg-[#172820] text-[#55E6C1] px-2 py-1 rounded">OCR</span>
              </div>
              <div className="bg-[#F5F6F3] p-4 rounded-xl border border-[#172820]/5 flex justify-between items-center">
                <span className="font-bold text-sm">Reference Extracted</span>
                <span className="text-xs font-mono bg-[#172820] text-[#55E6C1] px-2 py-1 rounded">MATCH</span>
              </div>
              <div className="bg-[#172820] text-[#F5F6F3] p-4 rounded-xl flex justify-between items-center shadow-lg transform scale-105">
                <span className="font-bold text-sm">Risk Assessment</span>
                <span className="text-xs font-mono bg-[#55E6C1] text-[#172820] px-2 py-1 rounded font-bold">WAIT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE TEAM (DARK FOREST PANEL) */}
      <section className="bg-[#172820] text-[#F5F6F3] py-24">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Different disciplines.<br/>One direction.</h2>
              <p className="text-[#A0B0A6] text-lg max-w-xl">Five people. A shared commitment to protection.</p>
            </div>
            <p className="font-mono text-xs text-[#55E6C1] tracking-widest uppercase border border-[#55E6C1]/30 px-4 py-2 rounded-full">
              5 Builders · 1 Shared Mission
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <div 
                key={index} 
                className="bg-[#0f1c15] border border-white/5 rounded-2xl p-8 hover:border-[#55E6C1]/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#55E6C1]/5 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <div className="w-14 h-14 rounded-xl bg-[#172820] border border-white/10 flex items-center justify-center text-xl font-black text-[#55E6C1] mb-6 group-hover:scale-110 group-hover:bg-[#55E6C1] group-hover:text-[#172820] transition-all duration-300">
                  {member.initials}
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-[#55E6C1] text-xs font-mono tracking-wider uppercase mb-4">{member.role}</p>
                <p className="text-sm text-[#A0B0A6] leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CLOSING FOOTER */}
      <footer className="bg-[#172820] border-t border-white/10 py-16 text-center">
        <div className="flex justify-center items-center gap-3 mb-6">
           <div className="w-8 h-8 grid grid-cols-2 gap-0.5 transform rotate-45">
              <div className="bg-[#55E6C1] rounded-tl-full rounded-bl-full"></div>
              <div className="bg-white rounded-tr-full rounded-br-full"></div>
              <div className="bg-white rounded-tl-full rounded-bl-full"></div>
              <div className="bg-[#55E6C1] rounded-tr-full rounded-br-full"></div>
            </div>
            <span className="text-xl font-black tracking-[0.2em] text-white">KHUSELA</span>
        </div>
        <p className="text-[#A0B0A6] mb-8 font-medium">Secure the bag. Protect the business.</p>
        <button 
          onClick={onEnter}
          className="bg-[#55E6C1] text-[#172820] font-bold py-3 px-8 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 mx-auto shadow-lg"
        >
          Enter Platform <ArrowUpRight size={18} />
        </button>
      </footer>
    </div>
  );
}