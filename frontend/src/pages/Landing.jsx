import { ArrowRight, ArrowUpRight, Shield, Target, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F5F6F3] text-[#172820] font-sans overflow-x-hidden selection:bg-[#172820] selection:text-[#F5F6F3]">
      
      {/* 1. SOFT ENTRANCE HERO SECTION */}
      <div className="relative overflow-hidden">
        {/* Subtle background ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#E8EBE4] rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

        <nav className="relative z-10 flex justify-between items-center px-8 py-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 grid grid-cols-2 gap-0.5 transform rotate-45">
              <div className="bg-[#172820] rounded-tl-full rounded-bl-full"></div>
              <div className="bg-[#55E6C1] rounded-tr-full rounded-br-full"></div>
              <div className="bg-[#55E6C1] rounded-tl-full rounded-bl-full"></div>
              <div className="bg-[#172820] rounded-tr-full rounded-br-full"></div>
            </div>
            <span className="text-xl font-bold tracking-[0.2em] text-[#172820]">KHUSELA</span>
          </div>
          <span className="font-mono text-xs font-bold tracking-widest uppercase text-[#606961] border border-[#172820]/20 px-3 py-1 rounded-full">
            HackSecure 2026
          </span>
        </nav>

        <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-32">
          <div className="max-w-4xl">
            <p className="font-mono text-[#606961] text-sm tracking-widest uppercase mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <span className="w-8 h-[1px] bg-[#606961] inline-block"></span>
              Track 3 · SMME Cyber Protection
            </p>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              Security that<br />
              understands context.
            </h1>
            
            <p className="text-lg md:text-xl text-[#606961] max-w-2xl leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              A cybersecurity solution designed to help South African small businesses identify suspicious payment proofs and recognise common digital scams. Trust isn't assumed. It's verified.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
              <button 
                onClick={onEnter}
                className="bg-[#172820] text-[#F5F6F3] font-bold py-4 px-8 rounded-xl text-lg hover:bg-black transition-all duration-300 flex items-center justify-center gap-3 group shadow-xl shadow-[#172820]/10"
              >
                Enter Platform
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* 2. PROJECT OVERVIEW (SAGE BACKGROUND) */}
      <section className="bg-[#E8EBE4] py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">What we're building.</h2>
            <p className="text-[#606961] text-lg leading-relaxed mb-6">
              Khusela focuses on making digital payment verification and scam awareness more accessible to small businesses, including informal traders and sellers operating through WhatsApp and social media.
            </p>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex items-center gap-3 text-[#172820] font-bold">
                <Target size={18} /> Precision over guesswork.
              </div>
              <p className="text-[#606961] pl-8">Deterministic detection, explainable findings and secure systems.</p>
              
              <div className="flex items-center gap-3 text-[#172820] font-bold mt-4">
                <Zap size={18} /> Clarity in every decision.
              </div>
              <p className="text-[#606961] pl-8">Turning complex risk signals into practical next steps.</p>
            </div>
          </div>
          
          {/* Abstract visual for the overview */}
          <div className="bg-[#F5F6F3] rounded-2xl p-8 border border-[#172820]/5 shadow-2xl shadow-[#172820]/5 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="flex items-center gap-3 mb-6 border-b border-[#172820]/10 pb-4">
              <div className="w-3 h-3 rounded-full bg-[#172820]"></div>
              <span className="font-mono text-xs font-bold text-[#606961] uppercase tracking-wider">Verification Pipeline</span>
            </div>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-[#172820]/5 flex justify-between items-center">
                <span className="font-bold text-sm">Evidence Captured</span>
                <span className="text-xs font-mono bg-[#E8EBE4] px-2 py-1 rounded">OCR</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-[#172820]/5 flex justify-between items-center">
                <span className="font-bold text-sm">Reference Extracted</span>
                <span className="text-xs font-mono bg-[#E8EBE4] px-2 py-1 rounded">MATCH</span>
              </div>
              <div className="bg-[#172820] text-[#F5F6F3] p-4 rounded-lg flex justify-between items-center shadow-lg">
                <span className="font-bold text-sm">Risk Assessment</span>
                <span className="text-xs font-mono bg-[#55E6C1] text-[#172820] px-2 py-1 rounded font-bold">WAIT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE TEAM (DARK FOREST PANEL) */}
      <section className="bg-[#172820] text-[#F5F6F3] py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Different disciplines.<br/>One direction.</h2>
              <p className="text-[#606961] text-lg max-w-xl">Five people. A shared commitment to protection.</p>
            </div>
            <p className="font-mono text-xs text-[#55E6C1] tracking-widest uppercase border border-[#55E6C1]/30 px-4 py-2 rounded-full">
              5 Builders · 1 Shared Mission
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <div 
                key={index} 
                className="bg-[#0f1c15] border border-white/5 rounded-2xl p-8 hover:border-[#55E6C1]/50 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <div className="w-12 h-12 rounded-lg bg-[#172820] border border-white/10 flex items-center justify-center text-xl font-bold text-[#55E6C1] mb-6 group-hover:scale-110 transition-transform">
                  {member.initials}
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-[#55E6C1] text-xs font-mono tracking-wider uppercase mb-4">{member.role}</p>
                <p className="text-sm text-[#606961] leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CLOSING FOOTER */}
      <footer className="bg-[#172820] border-t border-white/10 py-12 text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
           <div className="w-6 h-6 grid grid-cols-2 gap-0.5 transform rotate-45">
              <div className="bg-[#55E6C1] rounded-tl-full rounded-bl-full"></div>
              <div className="bg-white rounded-tr-full rounded-br-full"></div>
              <div className="bg-white rounded-tl-full rounded-bl-full"></div>
              <div className="bg-[#55E6C1] rounded-tr-full rounded-br-full"></div>
            </div>
            <span className="text-lg font-bold tracking-[0.2em] text-white">KHUSELA</span>
        </div>
        <p className="text-sm text-[#606961] mb-6">Secure the bag. Protect the business.</p>
        <button 
          onClick={onEnter}
          className="text-[#55E6C1] text-sm font-bold hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          Access Workspace <ArrowUpRight size={16} />
        </button>
      </footer>
    </div>
  );
}