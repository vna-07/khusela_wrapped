import { useState } from 'react';
import { Save, Building2, User } from 'lucide-react';

export default function Settings({ user, onUpdateUser }) {
  const [name, setName] = useState(user.name);
  const [workspace, setWorkspace] = useState(user.workspace);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateUser({ ...user, name, workspace });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-3xl font-bold text-obsidian tracking-tight mb-1">Settings</h2>
        <p className="text-slate-500 font-medium">Manage your personal profile and workspace identity.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        
        <div>
          <h3 className="text-lg font-bold text-obsidian flex items-center gap-2 mb-4">
            <User size={20} className="text-mint-dark" /> Personal Profile
          </h3>
          <label className="block text-sm font-semibold text-obsidian mb-2">Display Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-mint-dark focus:ring-1 focus:ring-mint-dark"
          />
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-lg font-bold text-obsidian flex items-center gap-2 mb-4">
            <Building2 size={20} className="text-mint-dark" /> Workspace Identity
          </h3>
          <label className="block text-sm font-semibold text-obsidian mb-2">Workspace Name</label>
          <input 
            type="text" 
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-mint-dark focus:ring-1 focus:ring-mint-dark"
          />
          <p className="text-xs text-slate-500 mt-2">This name appears on your dashboard and reports.</p>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button type="submit" className="bg-obsidian text-white font-bold py-2.5 px-6 rounded-lg hover:bg-graphite transition-colors flex items-center gap-2">
            <Save size={18} /> Save Changes
          </button>
          {saved && <span className="text-mint-dark text-sm font-bold animate-in fade-in">Saved successfully!</span>}
        </div>
      </form>
    </div>
  );
}