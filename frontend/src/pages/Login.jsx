import { useState } from 'react';
import { Shield, ArrowRight, Building2, User, Briefcase } from 'lucide-react';

export default function Login({ onLogin }) {
  const [step, setStep] = useState(1); // 1: Type, 2: Details
  const [userType, setUserType] = useState(null);
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');

  const handleTypeSelect = (type) => {
    setUserType(type);
    setStep(2);
  };

  const handleDemoLogin = () => {
    onLogin({ 
      name: "Thabo", 
      workspace: "Thabo Sneakers", 
      type: "business",
      isDemo: true 
    });
  };

  const handleComplete = (e) => {
    e.preventDefault();
    onLogin({
      name: name || "User",
      workspace: workspaceName || (userType === 'individual' ? "Personal Workspace" : "My Business"),
      type: userType,
      isDemo: false
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-obsidian rounded-2xl flex items-center justify-center mb-4 shadow-xl">
          <Shield size={32} className="text-mint" />
        </div>
        <h1 className="text-3xl font-bold text-obsidian tracking-tight">Welcome to Khusela</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md animate-in fade-in zoom-in-95 duration-500 delay-150">
        
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-obsidian mb-2">How will you use Khusela?</h2>
            <p className="text-sm text-slate-500 mb-6">Choose the option that best describes you. You can change this later.</p>
            
            <button onClick={() => handleTypeSelect('individual')} className="w-full text-left p-4 border border-slate-200 rounded-xl hover:border-mint-dark hover:bg-slate-50 transition-colors flex items-center gap-4">
              <User className="text-mint-dark" />
              <div>
                <h3 className="font-bold text-obsidian">Personal use</h3>
                <p className="text-xs text-slate-500 mt-1">Check suspicious messages and links for yourself.</p>
              </div>
            </button>

            <button onClick={() => handleTypeSelect('business')} className="w-full text-left p-4 border border-slate-200 rounded-xl hover:border-mint-dark hover:bg-slate-50 transition-colors flex items-center gap-4">
              <Building2 className="text-mint-dark" />
              <div>
                <h3 className="font-bold text-obsidian">Business or Organisation</h3>
                <p className="text-xs text-slate-500 mt-1">Protect a shop, company, or online store.</p>
              </div>
            </button>

            <button onClick={handleDemoLogin} className="w-full text-left p-4 border border-slate-200 rounded-xl hover:border-mint-dark hover:bg-slate-50 transition-colors flex items-center gap-4 bg-slate-50">
              <Briefcase className="text-slate-500" />
              <div>
                <h3 className="font-bold text-obsidian">Just exploring / testing</h3>
                <p className="text-xs text-slate-500 mt-1">Enter the Demo Workspace with synthetic data.</p>
              </div>
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleComplete} className="animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-obsidian mb-4">Personalise your workspace</h2>
            
            <label className="block text-sm font-semibold text-obsidian mb-2">Your Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jake"
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-mint-dark focus:ring-1 focus:ring-mint-dark mb-4"
            />

            {userType === 'business' && (
              <>
                <label className="block text-sm font-semibold text-obsidian mb-2">Business Name</label>
                <input 
                  type="text" 
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Jake Shoe Shop"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-mint-dark focus:ring-1 focus:ring-mint-dark mb-4"
                />
              </>
            )}

            <button 
              type="submit"
              className="w-full bg-obsidian text-white font-bold py-3.5 rounded-xl hover:bg-graphite transition-colors mt-2"
            >
              Enter Workspace
            </button>
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-slate-500 text-sm font-medium hover:text-obsidian mt-4"
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}