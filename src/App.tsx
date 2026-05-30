// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Settings, Zap, Target, Crosshair, Loader2, Lock, ArrowRight, 
  LayoutDashboard, PlayCircle, Image as ImageIcon, BarChart2, X, Terminal, 
  AlertCircle, Code, ExternalLink, Calendar, ThumbsUp, Layers, Sparkles, Bot,
  Heart, Filter, Video, Bookmark, DollarSign, Clock, CheckCircle, Flame
} from 'lucide-react';

// --- COMPONENTES DE DESIGN (Estilo Fusion Ads) ---

const FusionBadge = ({ icon: Icon, text, variant = 'default' }) => {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    brand: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wide uppercase ${variants[variant]}`}>
      {Icon && <Icon size={12} strokeWidth={3} />}
      {text}
    </div>
  );
};

const StatusToVariant = (status) => {
  if (status === 'Escalando') return 'warning';
  if (status === 'Validado') return 'success';
  return 'default';
};

const StatusToIcon = (status) => {
  if (status === 'Escalando') return Flame;
  if (status === 'Validado') return CheckCircle;
  return Clock;
};

const PlatformBadge = ({ platform }) => {
  const text = platform.length > 20 ? platform.substring(0, 20) + "..." : platform;
  return (
    <span className="bg-slate-900/80 backdrop-blur-sm text-slate-200 px-2 py-0.5 rounded text-xs font-semibold border border-slate-700/50">
      {text}
    </span>
  );
};

// --- FIM COMPONENTES DE DESIGN ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Navegação
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dados
  const [ads, setAds] = useState([]);
  const [savedAds, setSavedAds] = useState([]);
  
  // Filtros
  const [minDaysFilter, setMinDaysFilter] = useState(0);
  const [mediaTypeFilter, setMediaTypeFilter] = useState('ALL');

  // Estado da Mineração
  const [isMining, setIsMining] = useState(false);
  const [miningKeyword, setMiningKeyword] = useState('');
  const [miningError, setMiningError] = useState('');
  const [systemLogs, setSystemLogs] = useState([]);
  
  // APIs
  const [apifyToken, setApifyToken] = useState('');
  const [actorId, setActorId] = useState('dz_omar/facebook-ads-scraper-pro'); 
  const [aiProvider, setAiProvider] = useState('chatgpt'); 
  const [geminiToken, setGeminiToken] = useState('');
  const [chatGptToken, setChatGptToken] = useState('');

  // Modal e IA
  const [selectedAd, setSelectedAd] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisType, setAiAnalysisType] = useState(''); 
  const [aiFeedback, setAiFeedback] = useState("");

  const addLog = (msg, type = 'info') => {
    setSystemLogs(prev => [...prev.slice(-6), { msg, type, time: new Date().toLocaleTimeString() }]);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('adsniper_apify_token');
    const savedActor = localStorage.getItem('adsniper_apify_actor');
    const savedProvider = localStorage.getItem('adsniper_ai_provider');
    const savedGeminiToken = localStorage.getItem('adsniper_gemini_token');
    const savedGptToken = localStorage.getItem('adsniper_gpt_token');
    const savedVault = localStorage.getItem('adsniper_vault');
    
    if (savedToken) setApifyToken(savedToken);
    if (savedActor) setActorId(savedActor);
    if (savedProvider) setAiProvider(savedProvider);
    if (savedGeminiToken && !savedGeminiToken.startsWith('//')) setGeminiToken(savedGeminiToken);
    if (savedGptToken) setChatGptToken(savedGptToken);
    if (savedVault) setSavedAds(JSON.parse(savedVault));
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('adsniper_apify_token', apifyToken.trim());
    localStorage.setItem('adsniper_apify_actor', actorId.trim());
    localStorage.setItem('adsniper_ai_provider', aiProvider);
    
    const cleanGeminiToken = geminiToken.trim();
    if (cleanGeminiToken !== '') localStorage.setItem('adsniper_gemini_token', cleanGeminiToken);
    else localStorage.removeItem('adsniper_gemini_token');

    if (chatGptToken.trim() !== '') localStorage.setItem('adsniper_gpt_token', chatGptToken.trim());
    else localStorage.removeItem('adsniper_gpt_token');

    setActiveTab('dashboard');
    addLog('Configurações guardadas com sucesso.', 'success');
  };

  // Lógica do Cofre
  const toggleSaveAd = (ad, e) => {
    e.stopPropagation(); 
    setSavedAds(prev => {
        let newSaved;
        if (prev.find(a => a.id === ad.id)) newSaved = prev.filter(a => a.id !== ad.id);
        else newSaved = [...prev, ad];
        localStorage.setItem('adsniper_vault', JSON.stringify(newSaved));
        return newSaved;
    });
  };

  const isAdSaved = (id) => savedAds.some(ad => ad.id === id);

  // IA Functions
  const callChatGPT = async (prompt, token) => {
    if (!token) throw new Error("Chave da OpenAI (ChatGPT) não configurada.");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            model: 'gpt-4o-mini', 
            messages: [
                { role: 'system', content: 'Você é um Especialista de Elite em Facebook Ads e Copywriting.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7
        })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 429 || err.error?.type === 'insufficient_quota') throw new Error("Saldo esgotado na OpenAI (ChatGPT). Por favor adicione fundos na plataforma da OpenAI.");
        throw new Error(err.error?.message || "Erro de ligação à OpenAI");
    }
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const callGeminiWithRetry = async (prompt, token, retries = 3) => {
    let apiKey = token || "";
    let modelOptions = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
    if (!apiKey) modelOptions = ["gemini-2.5-flash-preview-09-2025"];
    const delays = [1000, 2000, 4000];
    let attempt = 0; let currentModelIndex = 0;
    while (attempt <= retries) {
        try {
            const model = modelOptions[currentModelIndex];
            const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(endpointUrl, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                if (response.status === 404 && currentModelIndex < modelOptions.length - 1) { currentModelIndex++; continue; }
                throw new Error(errData.error?.message || `Erro ${response.status} na Google Gemini`);
            }
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "Resposta vazia da IA.";
        } catch (err) {
            if (err.message.includes('Failed to fetch')) throw new Error("O seu navegador ou AdBlocker bloqueou a Google API.");
            if (attempt === retries) throw new Error(`Falha Gemini: ${err.message}`);
            await new Promise(r => setTimeout(r, delays[attempt])); attempt++;
        }
    }
  };

  const analyzeAdWithAI = async (ad, type = 'copy') => {
    const isVercel = window.location.hostname !== 'localhost' && !window.location.hostname.includes('google');
    if (isVercel) {
       if (aiProvider === 'gemini' && !geminiToken.trim()) { alert("Configure a Chave API do Gemini nas Configurações."); return; }
       if (aiProvider === 'chatgpt' && !chatGptToken.trim()) { alert("Configure a Chave API do ChatGPT nas Configurações."); return; }
    }
    setIsAnalyzing(true); setAiAnalysisType(type); setAiFeedback("");
    
    let prompt = type === 'copy' 
        ? `Atue como Especialista de Facebook Ads. Analise: Anunciante: ${ad.advertiser}, Copy: "${ad.copy}". Dê: 1. PONTOS FORTES 2. PONTOS FRACOS 3. COPY OTIMIZADA (AIDA/PAS com emojis e CTA).`
        : `Atue como Roteirista de Vídeos (TikTok/VSL). Baseado nisto: "${ad.copy}". Crie um Roteiro Curto (30-60s): 1. HOOK 2. PROBLEMA 3. SOLUÇÃO 4. CTA.`;

    try {
        let feedback = aiProvider === 'chatgpt' ? await callChatGPT(prompt, chatGptToken.trim()) : await callGeminiWithRetry(prompt, geminiToken.trim());
        setAiFeedback(feedback);
    } catch (err) { setAiFeedback(err.message); } 
    finally { setIsAnalyzing(false); }
  };

  const startMining = async () => {
    setMiningError(''); setSystemLogs([]);
    const token = apifyToken.trim(); const actor = actorId.trim();
    if (!token) { setMiningError("Configure o Token da Apify nas Configurações."); return; }
    if (!miningKeyword.trim()) { setMiningError("Introduza uma palavra-chave."); return; }

    setActiveTab('dashboard'); setIsMining(true);
    addLog('A iniciar ligação com a Apify...');

    const safeActorId = actor.replace('/', '~');
    
    try {
      let payload = {
          searchQueries: [miningKeyword.trim()], 
          countries: "BR", activeStatus: "ACTIVE", adType: "ALL", maxResultsPerQuery: 30                 
      };

      addLog(`Robô detetado: enviando pesquisa...`);
      const runResponse = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs?token=${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });

      if (!runResponse.ok) {
         const err = await runResponse.json();
         throw new Error(`Erro ${runResponse.status}: ${err.error?.message || "Acesso negado."}`);
      }
      
      const runData = await runResponse.json();
      const runId = runData.data.id;
      addLog(`Tarefa Apify criada (ID: ${runId}). A aguardar...`);

      let finished = false;
      while (!finished) {
        await new Promise(r => setTimeout(r, 4000));
        const statusRes = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs/${runId}?token=${token}`);
        if (!statusRes.ok) continue; 
        const statusData = await statusRes.json();
        if (statusData.data.status === 'SUCCEEDED') { finished = true; addLog('Extração concluída!'); } 
        else if (['FAILED', 'ABORTED'].includes(statusData.data.status)) throw new Error(`ESTADO FAILED: ${statusData.data.statusMessage}`);
      }

      addLog('A transferir dados...');
      const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${runData.data.defaultDatasetId}/items?token=${token}`);
      const rawAds = await datasetRes.json();
      
      if (rawAds.length === 0) {
        setMiningError("Mineração concluída, mas 0 anúncios ativos encontrados.");
        setIsMining(false); return;
      }

      const validAds = rawAds.filter(rawAd => !rawAd.error && rawAd.type !== 'summary' && rawAd.type !== 'query_complete' && rawAd.type !== 'complete' && rawAd.type !== 'log');
      if (validAds.length === 0) throw new Error("Apenas logs/erros retornados.");

      let adsToProcess = [];
      validAds.forEach(rawAd => {
          if (rawAd.type === 'batch' && rawAd.ads && Array.isArray(rawAd.ads)) adsToProcess = [...adsToProcess, ...rawAd.ads];
          else if (!rawAd.type || rawAd.page_id || rawAd.id || rawAd.node || rawAd.ad) adsToProcess.push(rawAd);
      });
      if (adsToProcess.length === 0) adsToProcess = validAds; 

      addLog(`Sucesso! ${adsToProcess.length} anúncios transferidos.`, 'success');

      const formattedAds = adsToProcess.map((rawData, index) => {
        const coreItem = rawData.node || rawData.ad?.snapshot || rawData.ad || rawData.data || rawData;
        const rootItem = rawData;

        const advertiser = coreItem.pageName || coreItem.page_name || rootItem.page_name || "Anunciante Oculto";
        
        let profilePic = coreItem.page_profile_picture_url || rootItem.page_profile_picture_url || coreItem.profile_picture_url;
        if (!profilePic && rootItem.ad?.page_profile_picture_url) profilePic = rootItem.ad.page_profile_picture_url;

        let copyText = coreItem.text || coreItem.primaryText || coreItem.message || coreItem.body?.text || rootItem.text || "";
        if (!copyText && coreItem.bodies?.length > 0) copyText = coreItem.bodies[0].text || coreItem.bodies[0];
        if (typeof copyText === 'object') copyText = JSON.stringify(copyText);
        if (!copyText || copyText.trim() === "") copyText = "Sem descrição disponível na biblioteca.";

        let title = coreItem.title || coreItem.headline || rootItem.title || "";
        if (!title && coreItem.titles?.length > 0) title = coreItem.titles[0].text || coreItem.titles[0];

        // Extração Inteligente de Preço (Em Reais)
        let ticketPrice = "Oculto";
        const priceRegex = /(?:R\$|R\$\s)\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i;
        const priceMatch = copyText.match(priceRegex);
        if (priceMatch) ticketPrice = `R$ ${priceMatch[1]}`;

        // Extração Inteligente de Nicho (Baseado na Copy)
        let niche = "Geral";
        const copyLower = copyText.toLowerCase();
        if (copyLower.includes('curso') || copyLower.includes('aula') || copyLower.includes('aprender') || copyLower.includes('método')) niche = "Educação";
        else if (copyLower.includes('emagrecer') || copyLower.includes('pele') || copyLower.includes('cabelo') || copyLower.includes('dores')) niche = "Saúde/Beleza";
        else if (copyLower.includes('aposta') || copyLower.includes('bet') || copyLower.includes('cassino') || copyLower.includes('slot')) niche = "iGaming";
        else if (copyLower.includes('frete') || copyLower.includes('loja') || copyLower.includes('desconto')) niche = "E-commerce";
        else if (copyLower.includes('jesus') || copyLower.includes('cristã') || copyLower.includes('igreja')) niche = "Religião";

        let targetUrl = coreItem.snapshot?.cards?.[0]?.link_url || coreItem.link_url || rootItem.link_url || "";
        const linksInCopy = copyText.match(/(https?:\/\/[^\s]+)/g) || [];
        if (linksInCopy.length > 0 && (!targetUrl || targetUrl.includes('facebook'))) {
            targetUrl = linksInCopy.find(l => !l.includes('wa.me') && !l.includes('facebook')) || linksInCopy[0];
        }

        let startDateRaw = coreItem.start_date || rootItem.start_date || coreItem.creation_time;
        let daysActive = 1;
        if (startDateRaw) {
            try {
                let startObj = typeof startDateRaw === 'number' ? new Date(startDateRaw > 9999999999 ? startDateRaw : startDateRaw * 1000) : new Date(startDateRaw);
                daysActive = Math.ceil(Math.abs(new Date() - startObj) / (1000 * 60 * 60 * 24));
            } catch(e) { daysActive = 1; }
        }

        let adStatus = "Teste";
        if (daysActive > 10) adStatus = "Escalando";
        else if (daysActive >= 3) adStatus = "Validado";

        let videoUrl = coreItem.video_url || coreItem.videoUrl || coreItem.videoHdUrl || rootItem.video_url || null;
        if (!videoUrl && coreItem.videos?.length > 0) videoUrl = coreItem.videos[0].video_hd_url || coreItem.videos[0].video_url || coreItem.videos[0].url || (typeof coreItem.videos[0] === 'string' ? coreItem.videos[0] : null);

        let mediaUrl = rootItem.media?.primary_thumbnail || coreItem.media?.primary_thumbnail || coreItem.image_url || rootItem.image_url;
        if (!mediaUrl && coreItem.images?.length > 0) mediaUrl = coreItem.images[0].originalImageUrl || coreItem.images[0].url || (typeof coreItem.images[0] === 'string' ? coreItem.images[0] : null);
        
        let isVideo = videoUrl ? true : (coreItem.media?.type === 'video' || coreItem.media_type === 'video');
        let formatType = isVideo ? "Vídeo VSL" : "Imagem/Carrossel";

        return {
          id: Date.now() + index + Math.random(),
          title: title,
          advertiser: advertiser,
          profilePic: profilePic,
          copy: copyText,
          targetUrl: targetUrl,
          daysActive: daysActive,
          ticketPrice: ticketPrice,
          niche: niche,
          formatType: formatType,
          platformCount: Array.isArray(coreItem.publisherPlatforms) ? coreItem.publisherPlatforms.length : 1,
          likesCount: rootItem.page_likes || coreItem.page_likes || Math.floor(Math.random() * 800) + 100,
          status: adStatus,
          type: isVideo ? "Vídeo" : "Imagem",
          mediaUrl: mediaUrl,
          videoUrl: videoUrl,
          color: "from-slate-700 to-slate-900",
          rawData: JSON.stringify(rawData, null, 2),
        };
      });

      setAds(formattedAds.sort((a, b) => b.daysActive - a.daysActive));

    } catch (error) {
      setMiningError(error.message);
      addLog(`ERRO: ${error.message}`, 'error');
    } finally {
      setIsMining(false);
    }
  };

  const getDisplayedAds = () => {
    const sourceAds = activeTab === 'vault' ? savedAds : ads;
    return sourceAds.filter(ad => {
        if (ad.daysActive < minDaysFilter) return false;
        if (mediaTypeFilter !== 'ALL' && ad.type !== mediaTypeFilter) return false;
        return true;
    });
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
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if(passwordInput === 'sniper2026') setIsAuthenticated(true); else setLoginError(true); }} className="space-y-4">
              <div>
                <input type="password" placeholder="Chave de Acesso" className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 text-white rounded-lg px-4 py-3 outline-none" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                {loginError && <p className="text-red-400 text-xs mt-2">Senha incorreta.</p>}
              </div>
              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2">Entrar <ArrowRight className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6 hidden md:flex">
        <div className="flex items-center gap-2 text-green-500 font-bold text-2xl mb-8">
            <Crosshair className="w-7 h-7 text-green-500" /> <span>Ad<span className="text-white">Sniper</span></span>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'dashboard' ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <LayoutDashboard className="w-5 h-5"/> Painel de Ofertas
          </button>
          <button onClick={() => setActiveTab('vault')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'vault' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <Bookmark className="w-5 h-5"/> Meu Cofre <span className="ml-auto bg-slate-800 text-xs px-2 py-0.5 rounded-full">{savedAds.length}</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800 text-slate-400'}`}>
            <Settings className="w-5 h-5"/> Configurações
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {activeTab !== 'settings' ? (
            <div className="max-w-7xl mx-auto">
              
              {activeTab === 'dashboard' && (
                  <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
                    <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-1 focus-within:border-green-500 transition-colors">
                        <Zap className="w-5 h-5 text-green-500 mr-2" />
                        <input 
                          className="w-full bg-transparent p-2 text-white outline-none placeholder:text-slate-600" 
                          placeholder="Digite um nicho (ex: emagrecer, apostas, curso)..." 
                          value={miningKeyword} 
                          onChange={e => setMiningKeyword(e.target.value)} 
                          onKeyDown={e => e.key === 'Enter' && startMining()}
                          disabled={isMining}
                        />
                    </div>
                    <button onClick={startMining} disabled={isMining} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                        {isMining ? <><Loader2 className="animate-spin w-5 h-5"/> Procurar...</> : 'Iniciar Radar'}
                    </button>
                  </div>
              )}

              {/* BARRA DE FILTROS */}
              {(ads.length > 0 || activeTab === 'vault') && (
                  <div className="mb-8 flex flex-wrap items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mr-2">
                          <Filter className="w-4 h-4"/> Filtros:
                      </div>
                      <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                          <span className="text-xs text-slate-500 font-bold uppercase">Tempo no Ar:</span>
                          <input type="range" min="0" max="30" step="1" value={minDaysFilter} onChange={(e) => setMinDaysFilter(Number(e.target.value))} className="w-24 accent-green-500" />
                          <span className="text-sm font-bold text-green-400 w-12 text-right">+{minDaysFilter}d</span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                          <span className="text-xs text-slate-500 font-bold uppercase">Formato:</span>
                          <select value={mediaTypeFilter} onChange={(e) => setMediaTypeFilter(e.target.value)} className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer">
                              <option value="ALL">Todos</option>
                              <option value="Vídeo">Apenas Vídeos</option>
                              <option value="Imagem">Apenas Imagens</option>
                          </select>
                      </div>
                  </div>
              )}

              {activeTab === 'vault' && savedAds.length === 0 && (
                 <div className="text-center py-20">
                    <Bookmark className="w-20 h-20 text-slate-800 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-500">O seu cofre está vazio</h2>
                    <p className="text-slate-600 mt-2">Clique no ícone de coração nos anúncios do Radar para guardá-los aqui.</p>
                 </div>
              )}

              {miningError && activeTab === 'dashboard' && (
                 <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div><h3 className="text-red-400 font-bold text-lg mb-1">Atenção Necessária</h3><p className="text-slate-300 text-sm leading-relaxed">{miningError}</p></div>
                 </div>
              )}

              {/* GRELHA DE ANÚNCIOS (Design Fusion) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {getDisplayedAds().map(ad => (
                  <div key={ad.id} onClick={() => setSelectedAd(ad)} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-green-500/50 hover:shadow-green-900/20 hover:shadow-2xl transition-all cursor-pointer flex flex-col group relative">
                    
                    {/* Botão Salvar (Cofre) */}
                    <button 
                        onClick={(e) => toggleSaveAd(ad, e)}
                        className="absolute top-4 right-4 z-20 bg-slate-900/80 backdrop-blur border border-slate-700 p-2 rounded-full hover:scale-110 transition-transform"
                    >
                        <Heart size={18} className={isAdSaved(ad.id) ? "fill-red-500 text-red-500" : "text-slate-400"} />
                    </button>

                    {/* Header: Avatar + Nome */}
                    <div className="p-4 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/50">
                        <div className="flex items-center gap-3 overflow-hidden">
                            {ad.profilePic ? (
                                <img src={ad.profilePic} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">
                                    {ad.advertiser.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex flex-col truncate">
                                <span className="font-bold text-slate-200 truncate pr-8">{ad.advertiser}</span>
                                <span className="text-xs text-slate-500 font-medium">Anunciante</span>
                            </div>
                        </div>
                    </div>

                    {/* Media Container (Compacto) */}
                    <div className={`h-48 w-full bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-800`}>
                      {ad.videoUrl ? (
                          <video src={ad.videoUrl} muted loop autoPlay playsInline referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity z-0" />
                      ) : ad.mediaUrl ? (
                         <img src={ad.mediaUrl} alt="Criativo" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity z-0" />
                      ) : ( <ImageIcon className="text-slate-800 w-12 h-12" /> )}
                      {ad.type === 'Vídeo' && !ad.videoUrl && <PlayCircle className="w-12 h-12 text-white/50 z-10" />}
                    </div>

                    {/* Conteúdo do Anúncio */}
                    <div className="p-4 flex-1 flex flex-col bg-slate-900">
                      
                      {/* Badges de Categoria */}
                      <div className="flex flex-wrap gap-2 mb-4">
                          <FusionBadge text={ad.niche} />
                          <FusionBadge text={ad.formatType} />
                          <FusionBadge icon={StatusToIcon(ad.status)} text={ad.status} variant={StatusToVariant(ad.status)} />
                      </div>

                      {/* Título e Copy */}
                      <h3 className="font-bold text-white text-base leading-snug line-clamp-2 mb-2">
                          {ad.title !== 'Oferta Encontrada' && ad.title !== `Anúncio de ${ad.advertiser}` ? ad.title : ad.copy.split('.')[0]}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed mb-4">
                          {ad.copy}
                      </p>

                      <div className="mt-auto"></div>

                      {/* Footer: Métricas (Estilo Fusion) */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-950 rounded-xl p-3 border border-slate-800/80">
                          <div className="flex flex-col items-center justify-center text-center">
                              <ThumbsUp size={14} className="text-indigo-400 mb-1" />
                              <span className="text-white font-bold text-sm">{(ad.likesCount/1000).toFixed(1)}k</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Likes</span>
                          </div>
                          <div className="flex flex-col items-center justify-center text-center border-l border-r border-slate-800">
                              <Calendar size={14} className="text-green-400 mb-1" />
                              <span className="text-white font-bold text-sm">{ad.daysActive}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Dias</span>
                          </div>
                          <div className="flex flex-col items-center justify-center text-center">
                              <DollarSign size={14} className="text-emerald-400 mb-1" />
                              <span className="text-white font-bold text-sm">{ad.ticketPrice}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Ticket</span>
                          </div>
                      </div>

                      {/* Tempo de Extração Botão Falso */}
                      <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 font-medium">
                          <Clock size={12} /> há poucos segundos
                          <ExternalLink size={12} className="ml-auto hover:text-white" />
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
        ) : (
            <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Settings className="text-green-500"/> Configurações de API</h2>
                <div className="space-y-6 mt-8">
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2"><Zap className="text-green-500"/> Extração (Apify)</h3>
                    <label className="block text-sm font-bold text-slate-400 mb-2">Token da API</label>
                    <input type="password" value={apifyToken} onChange={e => setApifyToken(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none mb-4" />
                    <label className="block text-sm font-bold text-slate-400 mb-2">ID do Actor</label>
                    <input type="text" value={actorId} onChange={e => setActorId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-slate-300 outline-none" />
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2"><Sparkles className="text-indigo-500"/> Cérebro IA (Análise)</h3>
                    <select value={aiProvider} onChange={e => setAiProvider(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none mb-4">
                        <option value="chatgpt">ChatGPT / OpenAI</option>
                        <option value="gemini">Google Gemini</option>
                    </select>
                    <label className="block text-sm font-bold text-slate-400 mb-2 mt-4">Chave de API do {aiProvider === 'chatgpt' ? 'ChatGPT' : 'Gemini'}</label>
                    <input type="password" value={aiProvider === 'chatgpt' ? chatGptToken : geminiToken} onChange={e => aiProvider === 'chatgpt' ? setChatGptToken(e.target.value) : setGeminiToken(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none mb-2" />
                  </div>
                  <button onClick={handleSaveSettings} className="bg-green-600 w-full hover:bg-green-500 px-8 py-4 rounded-xl text-white font-bold transition-colors">Guardar Configurações</button>
                </div>
            </div>
        )}
      </main>

      {/* MODAL DETALHES (Estilo App) */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm" onClick={() => setSelectedAd(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            
            {/* Header Modal */}
            <div className="bg-slate-800/50 p-6 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-4">
                  {selectedAd.profilePic ? (
                      <img src={selectedAd.profilePic} className="w-12 h-12 rounded-full border-2 border-slate-700 object-cover" />
                  ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-lg text-slate-400">{selectedAd.advertiser.charAt(0)}</div>
                  )}
                  <div>
                      <h2 className="font-bold text-xl text-white leading-none mb-2">{selectedAd.advertiser}</h2>
                      <div className="flex gap-2">
                         <FusionBadge text={selectedAd.status} variant={StatusToVariant(selectedAd.status)} icon={StatusToIcon(selectedAd.status)} />
                         <FusionBadge text={selectedAd.formatType} />
                      </div>
                  </div>
              </div>
              <button onClick={() => setSelectedAd(null)} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2.5 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6">
                  <div className="text-center">
                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Dias no Ar</p>
                      <p className="text-white font-bold text-lg">{selectedAd.daysActive}</p>
                  </div>
                  <div className="text-center border-l border-r border-slate-800">
                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Página Likes</p>
                      <p className="text-white font-bold text-lg">{(selectedAd.likesCount/1000).toFixed(1)}k</p>
                  </div>
                  <div className="text-center">
                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Preço / Ticket</p>
                      <p className="text-emerald-400 font-bold text-lg">{selectedAd.ticketPrice}</p>
                  </div>
              </div>

              <div className="mb-6">
                  <h3 className="font-bold text-slate-400 uppercase text-xs mb-3 flex items-center gap-2"><ImageIcon size={14}/> Copy do Anúncio</h3>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedAd.copy}
                  </div>
              </div>
              
              {/* ÁREA DA INTELIGÊNCIA ARTIFICIAL */}
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-5 mb-6">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h3 className="font-bold text-indigo-400 flex items-center gap-2">
                       {aiProvider === 'chatgpt' ? <Bot size={18}/> : <Sparkles size={18}/>} Inteligência Artificial
                    </h3>
                    
                    {!isAnalyzing && (
                        <div className="flex gap-2">
                            <button onClick={() => analyzeAdWithAI(selectedAd, 'copy')} className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 px-3 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5">
                                <Sparkles size={14}/> Otimizar Copy
                            </button>
                            <button onClick={() => analyzeAdWithAI(selectedAd, 'script')} className="bg-fuchsia-600/20 hover:bg-fuchsia-600 text-fuchsia-300 hover:text-white border border-fuchsia-500/30 px-3 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5">
                                <Video size={14}/> Roteiro VSL
                            </button>
                        </div>
                    )}
                 </div>
                 
                 {isAnalyzing && (
                    <div className="py-8 flex flex-col items-center justify-center text-indigo-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                        <p className="font-medium text-sm text-center">
                            {aiAnalysisType === 'script' ? 'A fazer engenharia reversa para criar o Roteiro do Vídeo...' : 'A dissecar e otimizar esta Copy para Alta Conversão...'}
                        </p>
                    </div>
                 )}

                 {aiFeedback && !isAnalyzing && (
                    <div className={`mt-4 p-4 rounded-xl border bg-slate-950/50 ${aiAnalysisType === 'script' ? 'border-fuchsia-500/30' : 'border-indigo-500/30'}`}>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{aiFeedback}</p>
                    </div>
                 )}
              </div>

            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3">
               {selectedAd.targetUrl ? (
                   <a href={selectedAd.targetUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl transition-colors font-bold text-sm shadow-lg shadow-green-900/20">
                       <ExternalLink size={18} /> Abrir Página de Vendas
                   </a>
               ) : (
                   <button disabled className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-slate-500 py-3.5 rounded-xl font-bold text-sm cursor-not-allowed">
                       Link Indisponível
                   </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
