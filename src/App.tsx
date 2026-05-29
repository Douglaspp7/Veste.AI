// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Settings, Zap, Target, Crosshair, Loader2
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [ads, setAds] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apifyToken, setApifyToken] = useState('');
  const [actorId, setActorId] = useState('epctex/facebook-ads-scraper');
  const [isMiningModalOpen, setIsMiningModalOpen] = useState(false);
  const [miningKeyword, setMiningKeyword] = useState('');
  const [isMining, setIsMining] = useState(false);
  const [miningStatus, setMiningStatus] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('apifyToken');
    const savedActor = localStorage.getItem('actorId');
    if (savedToken) setApifyToken(savedToken);
    if (savedActor) setActorId(savedActor);
  }, []);

  const saveSettings = () => {
    localStorage.setItem('apifyToken', apifyToken);
    localStorage.setItem('actorId', actorId);
    setIsSettingsOpen(false);
    alert("Configurações guardadas com sucesso!");
  };

  const startMining = async () => {
    if (!apifyToken || !actorId) {
      alert("Configure o Token e o ID do Actor nas definições.");
      return;
    }
    setIsMining(true);
    setMiningStatus('A iniciar robô na Apify...');
    
    try {
      // Substitui a barra por til para garantir compatibilidade com a URL da API
      const runUrl = `https://api.apify.com/v2/acts/${actorId.replace('/', '~')}/runs?token=${apifyToken}`;
      const runResponse = await fetch(runUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerms: [miningKeyword], countries: ["BR"] })
      });
      
      if (runResponse.status === 403) {
        throw new Error("Erro 403: Acesso negado. O seu token não tem permissão para executar este actor. Verifique se o 'subscreveu' na Apify Store.");
      }
      
      const runData = await runResponse.json();
      
      if (!runData.data) throw new Error("Erro ao iniciar. Verifique o ID do Actor.");

      setMiningStatus('A aguardar resultados...');
      await new Promise(r => setTimeout(r, 5000));
      
      const datasetUrl = `https://api.apify.com/v2/datasets/${runData.data.defaultDatasetId}/items?token=${apifyToken}`;
      const datasetResponse = await fetch(datasetUrl);
      const rawAds = await datasetResponse.json();

      setAds(rawAds.map((ad, i) => ({
        id: i, title: ad.pageName || "Anúncio", copy: ad.body || "Sem descrição"
      })));
      setIsMiningModalOpen(false);
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setIsMining(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Ad<span className="text-green-500">Sniper</span></h1>
          <input type="password" placeholder="Chave de Acesso" className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg mb-4" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
          <button onClick={() => passwordInput === 'sniper2026' ? setIsAuthenticated(true) : alert('Senha incorreta')} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg">Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between mb-8">
          <h1 className="text-2xl font-bold">Painel de Ofertas</h1>
          <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
            <Settings size={18} /> Configurações
          </button>
        </div>

        <button onClick={() => setIsMiningModalOpen(true)} className="bg-green-600 px-6 py-3 rounded-lg font-bold mb-8">Iniciar Nova Mineração</button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ads.map(ad => (
            <div key={ad.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">{ad.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-3">{ad.copy}</p>
            </div>
          ))}
        </div>
      </main>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Configurações</h2>
            <label className="block text-sm mb-1">Token Apify</label>
            <input className="w-full bg-slate-950 p-2 rounded mb-4" value={apifyToken} onChange={e => setApifyToken(e.target.value)} />
            
            <label className="block text-sm mb-1">ID do Actor (Robô)</label>
            <input className="w-full bg-slate-950 p-2 rounded mb-4" value={actorId} onChange={e => setActorId(e.target.value)} />
            
            <button onClick={saveSettings} className="w-full bg-green-600 py-2 rounded">Guardar</button>
          </div>
        </div>
      )}
      
      {isMiningModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Mineração</h2>
            <input className="w-full bg-slate-950 p-2 rounded mb-4" placeholder="Nicho..." value={miningKeyword} onChange={e => setMiningKeyword(e.target.value)} />
            <button onClick={startMining} className="w-full bg-green-600 py-2 rounded">{isMining ? 'A minerar...' : 'Iniciar'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
