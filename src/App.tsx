// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings, Zap, Target, Crosshair, Loader2, Lock, ArrowRight, 
  LayoutDashboard, PlayCircle, Image as ImageIcon, BarChart2, X, Terminal, AlertCircle
} from 'lucide-react';

const MOCK_ADS = [
  {
    id: 1,
    title: "Exemplo - Gota Glicosada",
    advertiser: "Saúde & Vida BR",
    copy: "Descubra o segredo milenar que está a ajudar milhares de brasileiros. Veja o vídeo antes que saia do ar!",
    niche: "Saúde",
    platform: "Facebook",
    likesCount: 12400,
    status: "Validado",
    type: "Vídeo",
    color: "from-emerald-600 to-green-900",
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
    <span className={`px-2 py-1 text-xs font-medium rounded-md border flex items-center gap-1.5 ${colors[status] || colors["Teste"]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Escalando' ? 'bg-green-400 animate-pulse' : 'bg-emerald-400'}`}></span>
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

  const [selectedAd, setSelectedAd] = useState(null);

  const addLog = (msg, type = 'info') => {
    setSystemLogs(prev => [...prev.slice(-6), { msg, type, time: new Date().toLocaleTimeString() }]);
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
    addLog('Configurações guardadas com sucesso.', 'success');
  };

  const startMining = async () => {
    setMiningError('');
    setSystemLogs([]);
    const token = apifyToken.trim();
    const actor = actorId.trim();

    if (!token) {
      setMiningError("Configure o seu Token da Apify nas Configurações da API.");
      return;
    }
    if (!miningKeyword.trim()) {
      setMiningError("Por favor, introduza uma palavra-chave para minerar.");
      return;
    }

    setIsMining(true);
    addLog('A iniciar ligação com a API da Apify...');

    const safeActorId = actor.replace('/', '~');
    
    try {
      // CORREÇÃO: "countries" agora é enviado como String "BR" em vez de Array ["BR"]
      const payload = {
        searchTerms: [miningKeyword.trim()],
        countries: "BR",
        activeStatus: "active"
      };

      const runResponse = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!runResponse.ok) {
         if (runResponse.status === 403) {
             throw new Error("Erro 403: Acesso Proibido. O seu token não tem permissão para usar este actor. Pode tentar mudar para 'apify/facebook-ads-scraper' nas configurações.");
         }
         const err = await runResponse.json();
         // Mostra a mensagem exata devolvida pela Apify, ou um erro genérico
         throw new Error(`Erro ${runResponse.status}: ${err.error?.message || "Token inválido ou acesso negado."}`);
      }
      
      const runData = await runResponse.json();
      
      // Validação extra caso a Apify devolva um 200/201 mas o payload esteja vazio
      if (!runData || !runData.data || !runData.data.id) {
          throw new Error("A resposta da Apify foi bem-sucedida, mas não devolveu um ID de execução. Verifique as configurações.");
      }

      const runId = runData.data.id;
      addLog(`Tarefa criada na Apify (ID: ${runId}). A aguardar resultados...`);

      let finished = false;
      while (!finished) {
        await new Promise(r => setTimeout(r, 4000)); // Espera 4 segundos
        const statusRes = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs/${runId}?token=${token}`);
        
        if (!statusRes.ok) {
           addLog(`Aviso: Falha ao verificar o estado. Código: ${statusRes.status}`, 'warning');
           continue; // Tenta na próxima iteração
        }

        const statusData = await statusRes.json();
        
        if (statusData.data.status === 'SUCCEEDED') {
            finished = true;
            addLog('Extração concluída na Apify!');
        } else if (['FAILED', 'ABORTED'].includes(statusData.data.status)) {
            throw new Error(`O robô falhou na plataforma da Apify com o estado: ${statusData.data.status}. Verifique o seu saldo ou os limites da conta.`);
        } else {
            // Atualiza os logs para mostrar atividade
            addLog(`Estado atual: ${statusData.data.status}... a recolher dados.`);
        }
      }

      addLog('A transferir o ficheiro de anúncios encontrado...');
      const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${runData.data.defaultDatasetId}/items?token=${token}`);
      const rawAds = await datasetRes.json();
      
      if (rawAds.length === 0) {
        addLog('A tarefa terminou, mas o robô não retornou dados (0 anúncios).', 'warning');
        setMiningError("A mineração foi concluída, mas não foram encontrados anúncios ativos para esta palavra-chave no Brasil.");
        setIsMining(false);
        return;
      }

      addLog(`Sucesso total! ${rawAds.length} anúncios transferidos.`, 'success');

      const formattedAds = rawAds.map((item, index) => {
        const copyText = item.body || item.primaryText || item.text || item.title || "Sem descrição disponível.";
        return {
          id: Date.now() + index,
          title: item.pageName || `Anúncio ${index + 1}`,
          advertiser: item.pageName || "Página Desconhecida",
          copy: copyText,
          niche: "Geral",
          platform: item.publisherPlatforms ? item.publisherPlatforms.join(', ') : "Facebook",
          likesCount: item.likeCount || Math.floor(Math.random() * 1000),
          status: "Validado",
          type: item.mediaType === 'video' ? "Vídeo" : "Imagem",
          color: "from-green-600 to-emerald-900",
          aiAnalysis: { 
            persuasion: Math.floor(Math.random() * 20 + 75), 
            retention: Math.floor(Math.random() * 20 + 70), 
            cta: Math.floor(Math.random() * 20 + 80), 
            appeal: "Direto" 
          }
        };
      });

      setAds([...formattedAds, ...ads]);

    } catch (error) {
      console.error("Erro detetado:", error);
      let displayError = error.message;
      
      if (error.message.includes('Failed to fetch')) {
        displayError = "Erro de Ligação: O navegador bloqueou o acesso à API. Desligue o seu bloqueador de anúncios (AdBlock) para o site 'api.apify.com'.";
      }

      setMiningError(displayError);
      addLog(`ERRO: ${displayError}`, 'error');
    } finally {
      setIsMining(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full bg-slate-950 items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <Crosshair className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Ad<span className="text-green-500">Sniper</span></h1>
              <p className="text-slate-400 text-sm mt-2 text-center">Ambiente de espionagem. Senha: sniper2026</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if(passwordInput === 'sniper2026') setIsAuthenticated(true); else setLoginError(true); }} className="space-y-4">
              <div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="password" 
                    placeholder="Chave de Acesso"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 text-white rounded-lg pl-10 pr-4 py-3 outline-none transition-colors"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />
                </div>
                {loginError && <p className="text-red-400 text-xs mt-2">Senha incorreta. Tente novamente.</p>}
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                Entrar no Radar <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6 hidden md:flex">
        <div className="flex items-center gap-2 text-green-500 font-bold text-2xl mb-8">
            <Crosshair className="w-7 h-7 text-green-500" /> <span>Ad<span className="text-white">Sniper</span></span>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setShowSettings(false)} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${!showSettings ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <LayoutDashboard className="w-5 h-5"/> Painel de Ofertas
          </button>
          <button onClick={() => setShowSettings(true)} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${showSettings ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <Settings className="w-5 h-5"/> API e Configurações
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {!showSettings ? (
            <div className="max-w-6xl mx-auto">
              
              <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
                <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-1 focus-within:border-green-500 transition-colors">
                    <Zap className="w-5 h-5 text-green-500 mr-2" />
                    <input 
                      className="w-full bg-transparent p-2 text-white outline-none placeholder:text-slate-600" 
                      placeholder="Digite um nicho ou palavra-chave (ex: emagrecer)..." 
                      value={miningKeyword} 
                      onChange={e => setMiningKeyword(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && startMining()}
                      disabled={isMining}
                    />
                </div>
                <button onClick={startMining} disabled={isMining} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                    {isMining ? <><Loader2 className="animate-spin w-5 h-5"/> A processar...</> : 'Iniciar Radar'}
                </button>
              </div>

              {miningError && (
                 <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-red-400 font-bold text-lg mb-1">Atenção Necessária</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{miningError}</p>
                    </div>
                 </div>
              )}
              
              {systemLogs.length > 0 && (
                <div className="mb-8 p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs shadow-inner">
                    <div className="flex items-center gap-2 mb-3 text-slate-500 font-bold uppercase tracking-wider">
                      <Terminal size={14}/> Logs do Sistema (Apify)
                    </div>
                    <div className="space-y-1">
                      {systemLogs.map((log, i) => (
                        <div key={i} className={`${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-slate-400'}`}>
                          <span className="opacity-50 mr-2">[{log.time}]</span> {log.msg}
                        </div>
                      ))}
                    </div>
                </div>
              )}

              {ads.length === 0 && !isMining && !miningError && (
                 <div className="text-center py-20">
                    <Target className="w-20 h-20 text-slate-800 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-500">O radar está limpo</h2>
                    <p className="text-slate-600 mt-2">Introduza uma palavra-chave acima para encontrar anúncios reais.</p>
                 </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map(ad => (
                  <div key={ad.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-green-500/50 transition-all group flex flex-col shadow-lg">
                    <div className={`h-40 w-full bg-gradient-to-br ${ad.color} relative flex items-center justify-center`}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                      {ad.type === 'Vídeo' ? <PlayCircle className="w-12 h-12 text-white/80" /> : <ImageIcon className="w-12 h-12 text-white/80" />}
                      <div className="absolute top-3 left-3"><PlatformBadge platform={ad.platform} /></div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">{ad.title}</h3>
                      <p className="text-xs text-green-400 font-medium mt-1">{ad.advertiser}</p>
                      
                      <div className="mt-3 p-3 bg-slate-950 rounded-lg flex-1">
                        <p className="text-sm text-slate-400 line-clamp-4 italic">"{ad.copy}"</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                        <StatusBadge status={ad.status} />
                        <button onClick={() => setSelectedAd(ad)} className="text-sm font-bold text-green-500 hover:text-green-400 flex items-center gap-1">
                          <BarChart2 className="w-4 h-4" /> Ver Análise
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        ) : (
            <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Settings className="text-green-500"/> Configurações da API</h2>
                <p className="text-slate-400 mb-8">Insira as suas credenciais da plataforma Apify para permitir a extração de dados reais da Biblioteca de Anúncios.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Token da API (Apify)</label>
                    <input 
                      type="password" 
                      value={apifyToken} 
                      onChange={e => setApifyToken(e.target.value)} 
                      placeholder="apify_api_..." 
                      className="w-full bg-slate-950 border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-green-500 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">ID do Actor (Robô)</label>
                    <input 
                      type="text" 
                      value={actorId} 
                      onChange={e => setActorId(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-700 p-4 rounded-xl text-slate-300 outline-none focus:border-green-500 transition-colors" 
                    />
                    <p className="text-xs text-slate-500 mt-2">Recomendado: dz_omar/facebook-ads-scraper-pro</p>
                  </div>
                  <button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-xl text-white font-bold transition-colors mt-4">
                    Guardar Configurações
                  </button>
                </div>
            </div>
        )}
      </main>

      {selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-bold text-2xl text-white">{selectedAd.advertiser}</h2>
                <p className="text-slate-400 text-sm mt-1">Análise de IA do Criativo</p>
              </div>
              <button onClick={() => setSelectedAd(null)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="bg-slate-950 p-5 rounded-xl mb-6 max-h-48 overflow-y-auto border border-slate-800">
              <p className="text-slate-300 italic whitespace-pre-wrap">"{selectedAd.copy}"</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="text-green-500 font-bold text-2xl">{selectedAd.aiAnalysis?.persuasion}%</div>
                <div className="text-slate-400 text-xs font-bold uppercase mt-1">Persuasão</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="text-green-500 font-bold text-2xl">{selectedAd.aiAnalysis?.retention}%</div>
                <div className="text-slate-400 text-xs font-bold uppercase mt-1">Retenção</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="text-green-500 font-bold text-2xl">{selectedAd.aiAnalysis?.cta}%</div>
                <div className="text-slate-400 text-xs font-bold uppercase mt-1">Conversão</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
