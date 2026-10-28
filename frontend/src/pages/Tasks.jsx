import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

// Match the rest of the app — hardcoded Render backend
const API_BASE = 'https://khusela-wrapped.onrender.com';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    // 60s — Render free tier can take 30–50s to wake from cold start
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch(`${API_BASE}/api/v1/tasks`, { signal: controller.signal });
      if (!res.ok) throw new Error("Backend returned an error");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      if (err.name === 'AbortError') {
        setError("Connection timed out. Is the backend running or blocked?");
      } else {
        setError("Could not connect to the backend.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const completeTask = async (taskId) => {
    try {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'done' } : t));
      await fetch(`${API_BASE}/api/v1/tasks/${taskId}/complete`, { method: 'POST' });
    } catch (err) {
      console.error(err);
      fetchTasks(); // Revert on failure
    }
  };

  const openTasks = tasks.filter(t => t.status === 'open');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <p className="text-[#087f68] text-xs font-bold tracking-widest uppercase mb-2">Follow Through</p>
        <h2 className="text-3xl font-bold text-obsidian tracking-tight mb-1">My Tasks</h2>
        <p className="text-slate-500 font-medium">Small actions that help protect your business.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 bg-slate-200 rounded-full mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl text-red-600">
          <p className="font-bold mb-2">Failed to load tasks</p>
          <p className="text-sm">{error}</p>
          <button onClick={fetchTasks} className="mt-4 bg-white border border-red-200 text-red-600 font-bold px-4 py-2 rounded-lg hover:bg-red-100">
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Open Tasks */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-[#F8FAFC]">
              <h3 className="font-bold text-obsidian flex items-center gap-2">
                <Clock size={16} className="text-wait" /> To Do ({openTasks.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {openTasks.length === 0 && <div className="p-6 text-sm text-slate-500">No open tasks. You are all caught up!</div>}
              {openTasks.map(task => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <button onClick={() => completeTask(task.id)} className="text-slate-300 hover:text-mint-dark transition-colors">
                      <Circle size={24} />
                    </button>
                    <div>
                      <p className="font-bold text-obsidian group-hover:text-mint-dark transition-colors">{task.title}</p>
                      <p className="text-xs text-slate-500 mt-1 capitalize">Priority: {task.priority}</p>
                    </div>
                  </div>
                  <button onClick={() => completeTask(task.id)} className="text-xs font-bold text-slate bg-white border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50">
                    Mark Done
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Done Tasks */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm opacity-70">
            <div className="p-4 border-b border-slate-100 bg-[#F8FAFC]">
              <h3 className="font-bold text-obsidian flex items-center gap-2">
                <CheckCircle2 size={16} className="text-mint-dark" /> Completed ({doneTasks.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {doneTasks.length === 0 && <div className="p-6 text-sm text-slate-500">No completed tasks yet.</div>}
              {doneTasks.map(task => (
                <div key={task.id} className="p-4 flex items-center gap-4">
                  <CheckCircle2 size={24} className="text-mint-dark" />
                  <p className="font-medium text-slate line-through">{task.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}