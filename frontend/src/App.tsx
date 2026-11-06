import React, { useEffect, useState } from 'react';
import { Activity, Server, AlertTriangle, CheckCircle, Trash2, Plus, RefreshCw, Cpu, HardDrive } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  environment: string;
  status: 'healthy' | 'warning' | 'critical';
  cpu_usage: number;
  memory_usage: number;
  updated_at: string;
}

const API_URL = 'http://127.0.0.1:8000/api/v1/services';

export default function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('production');
  const [cpuUsage, setCpuUsage] = useState(25);
  const [memoryUsage, setMemoryUsage] = useState(40);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Impossibile contattare il backend FastAPI');
      const data = await res.json();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let status = 'healthy';
    if (cpuUsage > 85 || memoryUsage > 85) status = 'critical';
    else if (cpuUsage > 70 || memoryUsage > 70) status = 'warning';

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          environment,
          status,
          cpu_usage: Number(cpuUsage),
          memory_usage: Number(memoryUsage),
        }),
      });

      if (!res.ok) throw new Error('Errore nella creazione del servizio');
      setName('');
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler rimuovere questo servizio?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Errore durante la cancellazione');
      fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const healthyCount = services.filter((s) => s.status === 'healthy').length;
  const warningCount = services.filter((s) => s.status === 'warning').length;
  const criticalCount = services.filter((s) => s.status === 'critical').length;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-800 gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-cyan-400">
              <Activity className="w-8 h-8 text-cyan-400" />
              DevOps Infrastructure & Health Monitor
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Microservizi orchestrati, metriche in tempo reale e cluster health
            </p>
          </div>
          <button
            onClick={fetchServices}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </button>
        </header>

        {/* Error message */}
        {error && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-300 p-4 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <div>
              <p className="font-semibold">Errore di comunicazione:</p>
              <p className="text-sm">{error}. Assicurati che FastAPI sia attivo su http://127.0.0.1:8000</p>
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Servizi Totali</p>
              <p className="text-3xl font-bold mt-1">{services.length}</p>
            </div>
            <Server className="w-9 h-9 text-slate-500" />
          </div>

          <div className="bg-slate-900 border border-emerald-950/50 p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-emerald-400 text-sm">Healthy</p>
              <p className="text-3xl font-bold mt-1 text-emerald-300">{healthyCount}</p>
            </div>
            <CheckCircle className="w-9 h-9 text-emerald-500" />
          </div>

          <div className="bg-slate-900 border border-amber-950/50 p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-sm">Warning</p>
              <p className="text-3xl font-bold mt-1 text-amber-300">{warningCount}</p>
            </div>
            <AlertTriangle className="w-9 h-9 text-amber-500" />
          </div>

          <div className="bg-slate-900 border border-rose-950/50 p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-rose-400 text-sm">Critical</p>
              <p className="text-3xl font-bold mt-1 text-rose-400">{criticalCount}</p>
            </div>
            <AlertTriangle className="w-9 h-9 text-rose-500" />
          </div>
        </div>

        {/* Form: Add New Service */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-200">
            <Plus className="w-5 h-5 text-cyan-400" />
            Registra Nuovo Servizio
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nome Servizio / Nodo</label>
              <input
                type="text"
                placeholder="es. K3s-Worker-02"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Ambiente</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">CPU Usage ({cpuUsage}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={cpuUsage}
                onChange={(e) => setCpuUsage(Number(e.target.value))}
                className="w-full mt-2 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">RAM Usage ({memoryUsage}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={memoryUsage}
                onChange={(e) => setMemoryUsage(Number(e.target.value))}
                className="w-full mt-2 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Aggiungi
              </button>
            </div>
          </form>
        </div>

        {/* Services Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-slate-200">Stato Nodi & Servizi</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Nome Servizio</th>
                  <th className="py-3 px-4">Ambiente</th>
                  <th className="py-3 px-4">Stato</th>
                  <th className="py-3 px-4">CPU</th>
                  <th className="py-3 px-4">RAM</th>
                  <th className="py-3 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Nessun servizio registrato. Inseriscine uno dal modulo sopra!
                    </td>
                  </tr>
                ) : (
                  services.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-500">#{s.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-200 flex items-center gap-2">
                        <Server className="w-4 h-4 text-slate-400" />
                        {s.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">
                          {s.environment}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                            s.status === 'healthy'
                              ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800'
                              : s.status === 'warning'
                              ? 'bg-amber-950/70 text-amber-400 border border-amber-800'
                              : 'bg-rose-950/70 text-rose-400 border border-rose-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              s.status === 'healthy'
                                ? 'bg-emerald-400'
                                : s.status === 'warning'
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-slate-400" />
                          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${
                                s.cpu_usage > 85 ? 'bg-rose-500' : s.cpu_usage > 70 ? 'bg-amber-500' : 'bg-cyan-500'
                              }`}
                              style={{ width: `${Math.min(s.cpu_usage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{s.cpu_usage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-slate-400" />
                          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${
                                s.memory_usage > 85 ? 'bg-rose-500' : s.memory_usage > 70 ? 'bg-amber-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${Math.min(s.memory_usage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{s.memory_usage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-slate-400 hover:text-rose-400 transition p-1.5 rounded-lg hover:bg-slate-800"
                          title="Elimina servizio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
