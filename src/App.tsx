// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, Heart, LayoutDashboard, Settings, ThumbsUp, MessageCircle,
  ExternalLink, PlayCircle, X, BarChart2, CheckCircle2, Menu, Download, Target,
  Zap, Image as ImageIcon, Copy, TrendingUp, Sparkles, ShoppingCart, ArrowDownWideNarrow,
  Crosshair, Lock, ArrowRight, Loader2, AlertCircle, Terminal
} from 'lucide-react';

const MOCK_ADS = [
  {
    id: 1,
    title: "Gota Glicosada - Controle",
    advertiser: "Saúde & Vida BR",
    copy: "Descubra o segredo milenar que está ajudando milhares de brasileiros a equilibrar o açúcar no sangue naturalmente. Veja o vídeo antes que saia do ar! Oferta exclusiva para quem assistir até o final.",
    niche: "Saúde",
    platform: "Facebook",
    likes: "12.4k",
    likesCount: 12400,
    comments: "854",
    status: "Escalando",
    type: "Vídeo",
    roi: "Alto",
    color: "from-emerald-600 to-green-900",
    date: "Hoje",
    checkout: "Yampi",
    aiAnalysis: { persuasion: 92, retention: 85, cta: 88, appeal: "Curiosidade" }
  }
];

const StatusBadge = ({ status }) => {
  const colors = {
    "Escalando": "bg-green-500/20 text-green-400 border-green-500/30",
    "Validado": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Teste": "bg-lime-500/20 text-lime-400 border-lime-500/30",
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-md border flex items-center gap-1.5 ${colors[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Escalando' ? 'bg-green-400 animate-pulse' : status === 'Validado' ? 'bg-emerald-400' : 'bg-lime-400'}`}></span>
      {status}
    </span>
  );
};

const PlatformBadge = ({ platform }) => (
  <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-xs font-semibold border border-slate-700">
    {platform}
  </span>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [ads, setAds] = useState(MOCK_ADS);
  const [isMining, setIsMining] = useState(false);
  const [miningKeyword, setMiningKeyword] = useState('');
  const [miningError, setMiningError] = useState('');
  const [systemLogs, setSystemLogs] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [apifyToken, setApifyToken] = useState('');
  const [actorId, setActorId] = useState('dz_omar/facebook-ads-scraper-pro');

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activePlatform, setActivePlatform] = useState('Todas');
  const [sortBy, setSortBy] = useState('Recentes');
  const [selectedAd, setSelectedAd] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addLog = (msg, type = 'info') => {
    setSystemLogs(prev => [...prev.slice(-4), { msg, type, time: new Date().toLocaleTimeString() }]);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('adsniper_apify_token');
    const savedActor = localStorage.getItem('adsniper_apify_actor');
    if (savedToken) setApifyToken(savedToken);
    if (savedActor) setActorId(savedActor);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('adsniper_apify_token', apifyToken.trim());
    localStorage.setItem('adsniper_apify_actor', actorId.trim());
    setShowSettings(false);
    addLog('Configurações guardadas com sucesso.');
  };

  const startMining = async () => {
    setMiningError('');
    setSystemLogs([]);
    const token = apifyToken.trim();
    const actor = actorId.trim();

    if (!token) {
      setMiningError("Configure o seu Token da Apify nas Configurações.");
      return;
    }

    setIsMining(true);
    addLog('A iniciar ligação com a API da Apify...');

    const safeActorId = actor.replace('/', '~');
    
    try {
      const runResponse = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerms: [miningKeyword.trim()], countries: ["BR"] })
      });

      if (!runResponse.ok) {
         const err = await runResponse.json();
         throw new Error(err.error?.message || "Token inválido ou acesso negado.");
      }
      
      const runData = await runResponse.json();
      const runId = runData.data.id;
      addLog(`Tarefa criada (ID: ${runId}). A aguardar resultados...`);

      let finished = false;
      while (!finished) {
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs/${runId}?token=${token}`);
        const statusData = await statusRes.json();
        
        if (statusData.data.status === 'SUCCEEDED') {
            finished = true;
            addLog('Extração concluída com sucesso!');
        } else if (['FAILED', 'ABORTED'].includes(statusData.data.status)) {
            throw new Error(`O robô falhou: ${statusData.data.status}`);
        }
      }

      const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${runData.data.defaultDatasetId}/items?token=${token}`);
      const rawAds = await datasetRes.json();
      addLog(`Recebidos ${rawAds.length} anúncios.`);

      const formattedAds = rawAds.map((item, index) => ({
        id: Date.now() + index,
        title: item.pageName || "Anúncio Externo",
        advertiser: item.pageName || "Página Desconhecida",
        copy: item.body || item.primaryText || "Sem descrição.",
        niche: "Geral",
        platform: "Facebook",
        likesCount: 0,
        status: "Validado",
        type: "Imagem",
        color: "from-green-600 to-emerald-900",
        aiAnalysis: { persuasion: 85, retention: 80, cta: 90, appeal: "Direto" }
      }));

      setAds([...formattedAds, ...ads]);

    } catch (error) {
      console.error(error);
      const msg = error.message.includes('Failed to fetch') 
        ? "Erro de Ligação: Verifique se não tem um AdBlock ativo ou firewall bloqueando a API." 
        : error.message;
      setMiningError(msg);
      addLog(`Erro crítico: ${msg}`, 'error');
    } finally {
      setIsMining(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full bg-slate-950 items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <Crosshair className="w-12 h-12 text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-white">AdSniper</h1>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if(passwordInput === 'sniper2026') setIsAuthenticated(true); else setLoginError(true); }} className="space-y-4">
            <input type="password" placeholder="Chave de Acesso" className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-3" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
            {loginError && <p className="text-red-400 text-sm">Senha incorreta.</p>}
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6">
        <div className="flex items-center gap-2 text-green-500 font-bold text-xl mb-8">
            <Crosshair /> <span>AdSniper</span>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setShowSettings(false)} className="w-full text-left p-3 rounded-lg hover:bg-slate-800 flex items-center gap-2"><LayoutDashboard className="w-5"/> Painel</button>
          <button onClick={() => setShowSettings(true)} className="w-full text-left p-3 rounded-lg hover:bg-slate-800 flex items-center gap-2"><Settings className="w-5"/> API</button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {!showSettings ? (
            <>
              <div className="flex gap-4 mb-8">
                <input className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-lg text-white" placeholder="Palavra-chave..." value={miningKeyword} onChange={e => setMiningKeyword(e.target.value)} />
                <button onClick={startMining} disabled={isMining} className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2">
                    {isMining ? <Loader2 className="animate-spin"/> : <Zap />} Iniciar Radar
                </button>
              </div>

              {miningError && <div className="p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg mb-6">{miningError}</div>}
              
              {systemLogs.length > 0 && (
                <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs">
                    <div className="flex items-center gap-2 mb-2 text-slate-500"><Terminal size={14}/> LOGS DO SISTEMA</div>
                    {systemLogs.map((l, i) => <div key={i} className="text-slate-400">{`[${l.time}] ${l.msg}`}</div>)}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map(ad => (
                  <div key={ad.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-green-500 transition-colors">
                    <h3 className="font-bold text-white mb-2">{ad.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-3">"{ad.copy}"</p>
                    <button onClick={() => setSelectedAd(ad)} className="text-green-500 text-sm font-bold border border-green-500/30 px-3 py-1 rounded">Analisar</button>
                  </div>
                ))}
              </div>
            </>
        ) : (
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 max-w-lg">
                <h2 className="text-xl font-bold text-white mb-4">Configurações Apify</h2>
                <input type="password" value={apifyToken} onChange={e => setApifyToken(e.target.value)} placeholder="Token..." className="w-full bg-slate-950 p-3 rounded mb-4" />
                <button onClick={handleSaveSettings} className="bg-green-600 px-6 py-2 rounded text-white font-bold">Guardar</button>
            </div>
        )}
      </main>
    </div>
  );
}
