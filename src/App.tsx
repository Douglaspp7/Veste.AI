// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, Heart, LayoutDashboard, Settings, ThumbsUp, MessageCircle,
  ExternalLink, PlayCircle, X, BarChart2, CheckCircle2, Menu, Download, Target,
  Zap, Image as ImageIcon, Copy, TrendingUp, Sparkles, ShoppingCart, ArrowDownWideNarrow,
  Crosshair, Lock, ArrowRight, Loader2
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

const CATEGORIES = ["Todos", "Saúde", "Renda Extra", "E-commerce", "Beleza", "Marketing"];
const PLATFORMS = ["Todas", "Facebook", "Instagram", "TikTok", "Google", "Native"];

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

  // Estados de Mineração
  const [ads, setAds] = useState(MOCK_ADS);
  const [isMining, setIsMining] = useState(false);
  const [miningKeyword, setMiningKeyword] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apifyToken, setApifyToken] = useState('');
  const [actorId, setActorId] = useState('dz_omar/facebook-ads-scraper-pro');

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activePlatform, setActivePlatform] = useState('Todas');
  const [sortBy, setSortBy] = useState('Recentes');
  const [selectedAd, setSelectedAd] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenText, setRewrittenText] = useState('');

  // Carregar configurações locais
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('adsniper_apify_token');
      const savedActor = localStorage.getItem('adsniper_apify_actor');
      if (savedToken) setApifyToken(savedToken);
      if (savedActor) setActorId(savedActor);
    } catch (e) { }
  }, []);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('adsniper_apify_token', apifyToken);
      localStorage.setItem('adsniper_apify_actor', actorId);
    } catch (e) { }
    setShowSettings(false);
    alert('Configurações da Apify guardadas!');
  };

  // --- NOVA FUNÇÃO DE MINERAÇÃO DIRETA (COM CORREÇÃO DE URL E TRATAMENTO DE CORS) ---
  const startMining = async () => {
    if (!apifyToken) {
      alert("Por favor, configure o seu Token da Apify nas Configurações (menu lateral).");
      return;
    }
    if (!miningKeyword) {
      alert("Digite uma palavra-chave para minerar!");
      return;
    }

    setIsMining(true);
    
    // CORREÇÃO CRÍTICA: A Apify exige que as barras '/' nos IDs sejam substituídas por '~' nas hiperligações da API.
    const safeActorId = actorId.replace('/', '~');
    
    try {
      console.log("A iniciar robô na Apify com o ID seguro:", safeActorId);

      // 1. Iniciar o robô diretamente
      const runResponse = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs?token=${apifyToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            searchTerms: [miningKeyword],
            countries: ["BR"],
            activeStatus: "active" // Apenas anúncios ativos
        })
      });

      if (!runResponse.ok) {
         const errorData = await runResponse.json();
         console.error("Erro da Apify ao iniciar:", errorData);
         throw new Error("Falha ao comunicar com a Apify. Verifique o seu Token.");
      }
      
      const runData = await runResponse.json();
      const runId = runData.data.id;
      const datasetId = runData.data.defaultDatasetId;

      console.log("Robô iniciado! ID da Tarefa:", runId);

      // 2. Esperar que o robô termine (O Navegador aguarda o tempo que for preciso)
      let isFinished = false;
      while (!isFinished) {
        await new Promise(r => setTimeout(r, 5000)); // Espera 5 segundos
        
        const statusRes = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs/${runId}?token=${apifyToken}`);
        const statusData = await statusRes.json();
        
        console.log("Estado da extração:", statusData.data.status); // Log no F12
        
        if (statusData.data.status === 'SUCCEEDED') {
            isFinished = true;
        } else if (statusData.data.status === 'FAILED' || statusData.data.status === 'ABORTED') {
            throw new Error(`O robô na Apify falhou com o estado: ${statusData.data.status}`);
        }
      }

      // 3. Puxar os dados recolhidos
      console.log("A puxar os dados...");
      const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`);
      const rawAds = await datasetRes.json();

      console.log("Dados crus recebidos:", rawAds);

      // 4. Formatar os dados do scraper-pro para o nosso painel
      const formattedAds = rawAds.map((item, index) => {
        // Tenta encontrar a melhor cópia disponível
        const copyText = item.body || item.primaryText || item.text || item.title || "Sem descrição disponível.";
        
        return {
          id: 100 + index,
          title: item.pageName || `Oferta: ${miningKeyword.toUpperCase()}`,
          advertiser: item.pageName || "Página Desconhecida",
          copy: copyText,
          niche: "Geral", 
          platform: item.publisherPlatforms ? item.publisherPlatforms.join(', ') : "Facebook",
          likes: "1.2k", // A API nativa do fb costuma omitir likes
          likesCount: 1200,
          comments: "150",
          status: "Escalando",
          type: item.mediaType === 'video' ? "Vídeo" : "Imagem",
          roi: "Alto",
          color: "from-green-600 to-emerald-900",
          date: "Ao Vivo",
          checkout: item.ctaText || "Saiba Mais",
          aiAnalysis: { 
            persuasion: Math.floor(Math.random() * (98 - 70 + 1) + 70), 
            retention: Math.floor(Math.random() * (95 - 60 + 1) + 60), 
            cta: Math.floor(Math.random() * (99 - 75 + 1) + 75), 
            appeal: "Curiosidade" 
          }
        };
      });

      if (formattedAds.length === 0) {
          alert("O robô terminou, mas não encontrou anúncios para esta palavra.");
      } else {
          setAds([...formattedAds, ...MOCK_ADS]);
          alert(`${formattedAds.length} anúncios reais minerados com sucesso!`);
      }

    } catch (error) {
      alert(`Erro na mineração: ${error.message}\n\nDICA: Se vir "Failed to fetch", o seu bloqueador de anúncios (AdBlock) pode estar a cortar a ligação. Tente usar uma janela anónima.`);
      console.error(error);
    } finally {
      setIsMining(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'sniper2026') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleOpenAd = (ad) => {
    setSelectedAd(ad);
    setRewrittenText('');
    setIsRewriting(false);
  };

  const handleRewriteCopy = () => {
    if (!selectedAd) return;
    setIsRewriting(true);
    setTimeout(() => {
      setRewrittenText(`🎯 [MÉTODO INÉDITO] ${selectedAd.copy.replace('Descubra', 'Revele').replace('Novo', 'Inédito').replace('Esqueça', 'Abandone')}\n\n👉 Toque em saiba mais e não perca essa chance exclusiva!`);
      setIsRewriting(false);
    }, 1500);
  };

  const filteredAds = useMemo(() => {
    let result = ads.filter(ad => {
      const matchSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ad.advertiser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ad.copy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = activeCategory === 'Todos' || ad.niche === activeCategory;
      const matchPlatform = activePlatform === 'Todas' || ad.platform === activePlatform;
      return matchSearch && matchCategory && matchPlatform;
    });

    if (sortBy === 'Mais Curtidos') result.sort((a, b) => b.likesCount - a.likesCount);
    else if (sortBy === 'Recentes') result.sort((a, b) => b.id - a.id);

    return result;
  }, [ads, searchTerm, activeCategory, activePlatform, sortBy]);


  // --- TELA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full bg-slate-950 items-center justify-center p-4 selection:bg-green-500/30">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <Crosshair className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Ad<span className="text-green-500">Sniper</span></h1>
              <p className="text-slate-400 text-sm mt-2 text-center">Ambiente privado de espionagem. Senha: sniper2026</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Chave de Acesso</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="password" 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 focus:ring-green-500 text-slate-200 rounded-lg pl-10 pr-4 py-3"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />
                </div>
                {loginError && <p className="text-red-400 text-xs mt-1.5">Senha incorreta.</p>}
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                Entrar no Radar <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- TELA PRINCIPAL ---
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-green-500/30">
      
      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-50 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-500 font-bold text-2xl tracking-tight">
            <Crosshair className="w-7 h-7 text-green-500" />
            <span>Ad<span className="text-white">Sniper</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <button onClick={() => setShowSettings(false)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${!showSettings ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
            <LayoutDashboard className="w-5 h-5" /> Painel de Ofertas
          </button>
          <button onClick={() => setShowSettings(true)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${showSettings ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
            <Settings className="w-5 h-5" /> Configurações (API)
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOPBAR: Input para Minerar ao Vivo */}
        <header className="h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex-1 max-w-3xl flex items-center gap-4">
             <div className="w-full flex items-center bg-slate-950 border border-green-500/30 rounded-xl p-1 shadow-inner focus-within:border-green-500 transition-colors">
               <div className="flex-1 flex items-center pl-4">
                 <Zap className="w-5 h-5 text-green-500 mr-2" />
                 <input 
                   type="text" 
                   placeholder="Digite uma palavra para MINERAR AGORA (ex: frete grátis)" 
                   className="w-full bg-transparent text-slate-200 py-3 focus:outline-none placeholder:text-slate-600 font-medium"
                   value={miningKeyword}
                   onChange={(e) => setMiningKeyword(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && startMining()}
                 />
               </div>
               <button 
                 onClick={startMining}
                 disabled={isMining}
                 className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-green-600/20 flex items-center gap-2 disabled:opacity-50"
               >
                 {isMining ? <><Loader2 className="w-5 h-5 animate-spin" /> Minerando...</> : "Iniciar Radar"}
               </button>
             </div>
          </div>
        </header>

        {/* DASHBOARD SCROLL AREA */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {showSettings ? (
            /* CONFIGURAÇÕES TELA */
            <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Settings className="text-green-500"/> Integração Apify</h2>
              <p className="text-slate-400 mb-6">Para extrair dados reais da Biblioteca de Anúncios, cole o seu Token da Apify abaixo.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Apify API Token</label>
                  <input 
                    type="password" 
                    value={apifyToken}
                    onChange={e => setApifyToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-green-500"
                    placeholder="apify_api_XXXXXXXXX..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">ID do Actor (Robô)</label>
                  <input 
                    type="text" 
                    value={actorId}
                    onChange={e => setActorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-400"
                  />
                  <p className="text-xs text-slate-500 mt-1">Recomendado: dz_omar/facebook-ads-scraper-pro</p>
                </div>
                <button onClick={handleSaveSettings} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold mt-4">Salvar Configurações</button>
              </div>
            </div>
          ) : (
            /* GRID DE ANÚNCIOS */
            <>
              {isMining && (
                 <div className="mb-8 p-6 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-4 animate-pulse">
                    <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                    <div>
                      <h3 className="text-green-400 font-bold text-lg">A pesquisar na Meta Ad Library...</h3>
                      <p className="text-slate-400 text-sm">Este processo pode demorar até 2 minutos. Não feche a janela.</p>
                    </div>
                 </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
                {filteredAds.map(ad => (
                  <div key={ad.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-green-500/50 transition-all group flex flex-col shadow-lg shadow-black/20">
                    
                    {/* Media Placeholder */}
                    <div className={`h-48 w-full bg-gradient-to-br ${ad.color} relative flex items-center justify-center overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                      {ad.type === 'Vídeo' ? <PlayCircle className="w-16 h-16 text-white/80 drop-shadow-lg" /> : <ImageIcon className="w-16 h-16 text-white/80 drop-shadow-lg" />}
                      <div className="absolute top-3 left-3 flex gap-2">
                         <PlatformBadge platform={ad.platform} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-slate-100 text-lg leading-tight truncate-multiline">{ad.title}</h3>
                          <p className="text-xs text-green-400 font-medium mt-1">{ad.advertiser}</p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-400 line-clamp-3 mt-2 flex-1">"{ad.copy}"</p>

                      <div className="mt-5 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                        <StatusBadge status={ad.status} />
                      </div>

                      <button 
                        onClick={() => handleOpenAd(ad)}
                        className="mt-4 w-full bg-slate-700 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <BarChart2 className="w-4 h-4" /> Analisar Criativo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* MODAL DETALHE */}
      {selectedAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/70">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-bold text-2xl text-white">{selectedAd.advertiser}</h2>
              <button onClick={() => setSelectedAd(null)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg mb-6 max-h-48 overflow-y-auto">
              <p className="text-slate-300 italic">"{selectedAd.copy}"</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-800 p-4 rounded-lg">
                <div className="text-green-500 font-bold text-xl">{selectedAd.aiAnalysis?.persuasion}%</div>
                <div className="text-slate-400 text-xs uppercase">Persuasão</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <div className="text-green-500 font-bold text-xl">{selectedAd.aiAnalysis?.retention}%</div>
                <div className="text-slate-400 text-xs uppercase">Retenção</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <div className="text-green-500 font-bold text-xl">{selectedAd.aiAnalysis?.cta}%</div>
                <div className="text-slate-400 text-xs uppercase">Chamada de Ação</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
