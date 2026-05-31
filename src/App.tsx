// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings, Zap, Target, Crosshair, Loader2, Lock, ArrowRight, 
  LayoutDashboard, PlayCircle, Image as ImageIcon, BarChart2, X, Terminal, 
  AlertCircle, Code, ExternalLink, Calendar, ThumbsUp, Layers, Sparkles, Bot,
  Heart, Filter, Video, Bookmark, DollarSign, Clock, CheckCircle, Flame, Library, 
  ArrowUpDown, ShieldAlert, SplitSquareHorizontal, Rocket, Trophy, PenTool, Copy
} from 'lucide-react';

// ============================================================================
// COMPONENTES DE DESIGN BASE
// ============================================================================

const FusionBadge = ({ icon: Icon, text, variant = 'default', className = '' }) => {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    brand: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    gold: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold tracking-wide uppercase ${variants[variant]} ${className}`}>
      {Icon && <Icon size={12} strokeWidth={3} />}
      {text}
    </div>
  );
};

const StatusToVariant = (score) => {
  if (score >= 80) return 'warning';
  if (score >= 50) return 'success';
  return 'default';
};

const StatusToText = (score) => {
  if (score >= 80) return '🔥 Super Escala';
  if (score >= 50) return 'Validado';
  return 'Teste';
};

const StatusToIcon = (score) => {
  if (score >= 80) return Flame;
  if (score >= 50) return CheckCircle;
  return Clock;
};

const PlatformBadge = ({ platform }) => {
  const text = platform && typeof platform === 'string' && platform.length > 20 ? platform.substring(0, 20) + "..." : platform;
  return (
    <span className="bg-slate-900/80 backdrop-blur-sm text-slate-200 px-2.5 py-1 rounded text-xs font-semibold border border-slate-700/50">
      {text || "FACEBOOK"}
    </span>
  );
};

// ============================================================================
// COMPONENTES DAS PÁGINAS (ABAS)
// ============================================================================

const GeneratorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center h-full">
      <div className="w-24 h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
        <PenTool className="w-10 h-10 text-indigo-400" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Gerador de Criativos IA</h2>
      <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed mb-8">
        O seu laboratório de alta conversão. Em breve, a IA irá pegar nas copys que você encontrou no Radar e transformá-las em roteiros de vídeo virais (VSL/TikTok), criar imagens dinâmicas e desenhar carrosséis persuasivos.
      </p>
      <button disabled className="bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 px-8 py-3 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed">
        <Loader2 className="w-5 h-5 animate-spin" /> Em Desenvolvimento...
      </button>
    </div>
  );
};

const ClonerPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center h-full">
      <div className="w-24 h-24 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(217,70,239,0.2)]">
        <Copy className="w-10 h-10 text-fuchsia-400" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Clonador de Páginas</h2>
      <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed mb-8">
        Copie os funis milionários em 3 cliques. Em breve, poderá introduzir o link da página de vendas do seu concorrente e a nossa ferramenta irá extrair, limpar o código e preparar a estrutura para você hospedar no seu domínio.
      </p>
      <button disabled className="bg-fuchsia-600/50 text-fuchsia-200 border border-fuchsia-500/30 px-8 py-3 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed">
        <Loader2 className="w-5 h-5 animate-spin" /> Em Desenvolvimento...
      </button>
    </div>
  );
};

const SettingsPage = ({ 
  apifyToken, setApifyToken, actorId, setActorId, 
  aiProvider, setAiProvider, geminiToken, setGeminiToken, 
  chatGptToken, setChatGptToken, handleSaveSettings 
}) => {
  return (
    <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl mx-auto mt-8">
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
  );
};


// ============================================================================
// NÚCLEO DA APLICAÇÃO (APP PRINCIPAL)
// ============================================================================

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Navegação
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dados Core
  const [ads, setAds] = useState([]);
  const [savedAds, setSavedAds] = useState([]);
  const [visibleAdsCount, setVisibleAdsCount] = useState(24);

  // Filtros e Ordenação
  const [minDaysFilter, setMinDaysFilter] = useState(0);
  const [mediaTypeFilter, setMediaTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('score');

  // Estado da Mineração
  const [isMining, setIsMining] = useState(false);
  const [miningKeyword, setMiningKeyword] = useState('');
  const [miningError, setMiningError] = useState('');
  const [systemLogs, setSystemLogs] = useState([]);
  const [miningProgress, setMiningProgress] = useState(0);
  const [miningStatusMsg, setMiningStatusMsg] = useState('');

  // APIs Tokens
  const [apifyToken, setApifyToken] = useState('');
  const [actorId, setActorId] = useState('dz_omar/facebook-ads-scraper-pro'); 
  const [aiProvider, setAiProvider] = useState('chatgpt'); 
  const [geminiToken, setGeminiToken] = useState('');
  const [chatGptToken, setChatGptToken] = useState('');

  // Modal IA
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
    if (savedVault) {
        try { setSavedAds(JSON.parse(savedVault)); } catch(e) { setSavedAds([]); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('adsniper_vault', JSON.stringify(savedAds));
  }, [savedAds]);

  useEffect(() => {
    setVisibleAdsCount(24);
  }, [minDaysFilter, mediaTypeFilter, sortBy, activeTab, miningKeyword]);

  const handleSaveSettings = () => {
    localStorage.setItem('adsniper_apify_token', apifyToken.trim());
    localStorage.setItem('adsniper_apify_actor', actorId.trim());
    localStorage.setItem('adsniper_ai_provider', aiProvider);
    if (geminiToken.trim() !== '') localStorage.setItem('adsniper_gemini_token', geminiToken.trim());
    else localStorage.removeItem('adsniper_gemini_token');
    if (chatGptToken.trim() !== '') localStorage.setItem('adsniper_gpt_token', chatGptToken.trim());
    else localStorage.removeItem('adsniper_gpt_token');
    setActiveTab('dashboard');
    addLog('Configurações guardadas com sucesso.', 'success');
  };

  const toggleSaveAd = (ad, e) => {
    if (e) e.stopPropagation(); 
    setSavedAds(prev => {
        if (prev.find(a => a.id === ad.id)) return prev.filter(a => a.id !== ad.id);
        else return [...prev, ad];
    });
  };

  const isAdSaved = (id) => savedAds.some(ad => ad.id === id);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 600; 
    if (bottom) setVisibleAdsCount(prev => prev + 24);
  };

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
        if (response.status === 429 || err.error?.type === 'insufficient_quota') throw new Error("Saldo esgotado na OpenAI (ChatGPT). Por favor adicione fundos.");
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
            if (err.message.includes('Failed to fetch')) throw new Error("O navegador bloqueou a Google API.");
            if (attempt === retries) throw new Error(`Falha Gemini: ${err.message}`);
            await new Promise(r => setTimeout(r, delays[attempt])); attempt++;
        }
    }
  };

  const analyzeAdWithAI = async (ad, type = 'copy') => {
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

  // =======================================================
  // MOTOR DE MINERAÇÃO V4 - SCORING AVANÇADO
  // =======================================================
  const startMining = async () => {
    setMiningError(''); setSystemLogs([]); setMinDaysFilter(0); setVisibleAdsCount(24);
    const token = apifyToken.trim(); const actor = actorId.trim();
    
    if (!token) { setMiningError("Configure o Token da Apify nas Configurações."); return; }
    if (!miningKeyword.trim()) { setMiningError("Introduza uma palavra-chave."); return; }

    setActiveTab('dashboard'); setIsMining(true);
    setMiningProgress(10); setMiningStatusMsg('A ligar aos servidores da Apify...');
    addLog('A iniciar ligação com a Apify...');

    const safeActorId = actor.replace('/', '~');
    
    try {
      let payload = { searchQueries: [miningKeyword.trim()], countries: "BR", activeStatus: "ACTIVE", adType: "ALL", maxResultsPerQuery: 500 };

      if (safeActorId.includes('3853UUZQG6pjjdw11') || safeActorId.includes('memo23')) {
          payload = { startUrls: [{ url: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(miningKeyword.trim())}` }], proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ["RESIDENTIAL"] }, maxItems: 500 };
      } else if (!safeActorId.includes('dz_omar')) {
          payload = { startUrls: [{ url: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(miningKeyword.trim())}` }], resultsLimit: 500 };
      }

      setMiningProgress(20); setMiningStatusMsg('A iniciar missão de espionagem no Meta...');
      
      const runResponse = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs?token=${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });

      if (!runResponse.ok) {
         const err = await runResponse.json().catch(() => ({}));
         throw new Error(`Erro ${runResponse.status}: ${err.error?.message || "Acesso negado."}`);
      }
      
      const runData = await runResponse.json();
      const runId = runData.data.id;
      
      setMiningProgress(30); setMiningStatusMsg(`A extrair anúncios em massa da Biblioteca...`);

      let finished = false; let timeoutCounter = 0; 

      while (!finished && timeoutCounter < 60) {
        await new Promise(r => setTimeout(r, 4000));
        timeoutCounter++;
        setMiningProgress(prev => Math.min(prev + Math.floor(Math.random() * 5) + 1, 85));
        
        const statusRes = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs/${runId}?token=${token}`);
        if (!statusRes.ok) continue; 
        const statusData = await statusRes.json();
        if (statusData.data.status === 'SUCCEEDED') finished = true; 
        else if (['FAILED', 'ABORTED'].includes(statusData.data.status)) throw new Error(`O Robô falhou no servidor: ${statusData.data.statusMessage || 'Erro desconhecido na Apify.'}`);
      }

      setMiningProgress(90); setMiningStatusMsg('A transferir os dados pesados...');
      const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${runData.data.defaultDatasetId}/items?token=${token}`);
      const rawAds = await datasetRes.json();
      
      if (!Array.isArray(rawAds) || rawAds.length === 0) {
        setMiningError("Mineração concluída, mas 0 anúncios ativos encontrados.");
        setIsMining(false); setMiningProgress(0); return;
      }
      if (rawAds[0]?.error) throw new Error(`A Apify falhou ao ler a página: ${rawAds[0].errorDescription || ""}`);

      const validAds = rawAds.filter(rawAd => rawAd && !rawAd.error && rawAd.type !== 'summary' && rawAd.type !== 'query_complete' && rawAd.type !== 'complete' && rawAd.type !== 'log');
      if (validAds.length === 0) throw new Error("Apenas logs/erros retornados ou a pesquisa não encontrou resultados.");

      let adsToProcess = [];
      validAds.forEach(rawAd => {
          if (rawAd.type === 'batch' && Array.isArray(rawAd.ads)) adsToProcess = [...adsToProcess, ...rawAd.ads];
          else if (!rawAd.type || rawAd.page_id || rawAd.id || rawAd.node || rawAd.ad) adsToProcess.push(rawAd);
      });
      if (adsToProcess.length === 0) adsToProcess = validAds; 

      setMiningProgress(95); setMiningStatusMsg('Motor V4: A aplicar Rankeamento Avançado...');

      const getBaseDomain = (url) => {
          if (!url || url.includes('facebook.com') || url.includes('fb.me') || url.includes('instagram.com')) return 'no-link';
          try { return new URL(url).hostname.replace('www.', ''); } catch(e) { return 'no-link'; }
      };

      const advertiserMap = new Map();

      adsToProcess.forEach((rawData, index) => {
        try {
            const coreItem = rawData.node || rawData.ad?.snapshot || rawData.ad || rawData.data || rawData || {};
            const rootItem = rawData || {};

            const adId = String(coreItem.id || coreItem.ad_archive_id || rootItem.id || `fallback_${Date.now()}_${index}`);
            let advertiser = coreItem.pageName || coreItem.page_name || rootItem.page_name || rootItem.pageName || coreItem.publisherPlatform || coreItem.profileName || coreItem.advertiser_name || "Anunciante Oculto";
            if (typeof advertiser !== 'string') advertiser = "Anunciante Oculto";
            
            const pageId = String(coreItem.page_id || rootItem.page_id || "");
            let profilePic = coreItem.page_profile_picture_url || rootItem.page_profile_picture_url || coreItem.profile_picture_url || rootItem.ad?.page_profile_picture_url || "";
            if (typeof profilePic !== 'string') profilePic = "";

            let copyText = coreItem.text || coreItem.primaryText || coreItem.message || coreItem.body?.text || rootItem.text || "";
            if (!copyText && coreItem.bodies?.length > 0) copyText = coreItem.bodies[0].text || coreItem.bodies[0];
            if (typeof copyText === 'object') { try { copyText = JSON.stringify(copyText); } catch(e) { copyText = ""; } }
            if (!copyText || typeof copyText !== 'string' || copyText.trim() === "") copyText = "Sem descrição disponível na biblioteca.";

            let title = coreItem.title || coreItem.headline || rootItem.title || "";
            if (!title && coreItem.titles?.length > 0) title = coreItem.titles[0].text || coreItem.titles[0];
            if (typeof title !== 'string') title = "Oferta Encontrada";

            let ticketPrice = "Oculto";
            const priceMatch = copyText.match(/(?:R\$|R\$\s)\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i);
            if (priceMatch) ticketPrice = `R$ ${priceMatch[1]}`;

            let countForThisArchive = parseInt(coreItem.collation_count || rootItem.collation_count || coreItem.collationCount, 10);
            if (isNaN(countForThisArchive) || countForThisArchive < 1) countForThisArchive = 1;

            let niche = "Geral";
            const copyLower = copyText.toLowerCase();
            if (copyLower.includes('curso') || copyLower.includes('aula') || copyLower.includes('aprender') || copyLower.includes('método') || copyLower.includes('concurso')) niche = "Educação";
            else if (copyLower.includes('emagrecer') || copyLower.includes('pele') || copyLower.includes('cabelo') || copyLower.includes('dores') || copyLower.includes('dieta')) niche = "Saúde/Beleza";
            else if (copyLower.includes('aposta') || copyLower.includes('bet') || copyLower.includes('cassino') || copyLower.includes('slot') || copyLower.includes('tigre')) niche = "iGaming";
            else if (copyLower.includes('frete') || copyLower.includes('loja') || copyLower.includes('desconto')) niche = "E-commerce";
            else if (copyLower.includes('jesus') || copyLower.includes('cristã') || copyLower.includes('igreja') || copyLower.includes('deus')) niche = "Religião";

            let targetUrl = coreItem.snapshot?.cards?.[0]?.link_url || coreItem.cards?.[0]?.link_url || coreItem.link_url || rootItem.link_url || "";
            if (typeof targetUrl !== 'string') targetUrl = "";
            const linksInCopy = copyText.match(/(https?:\/\/[^\s]+)/g) || [];
            if (linksInCopy.length > 0 && (!targetUrl || targetUrl.includes('facebook'))) {
                targetUrl = linksInCopy.find(l => !l.includes('wa.me') && !l.includes('facebook')) || linksInCopy[0];
            }
            
            const libraryUrl = pageId ? `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&view_all_page_id=${pageId}` : (coreItem.ad_url || rootItem.ad_url || "");

            let daysActive = 1;
            const startDateRaw = coreItem.start_date || rootItem.start_date || coreItem.creation_time;
            if (startDateRaw) {
                try {
                    let startObj = typeof startDateRaw === 'number' ? new Date(startDateRaw > 9999999999 ? startDateRaw : startDateRaw * 1000) : new Date(startDateRaw);
                    daysActive = Math.ceil(Math.abs(new Date() - startObj) / (1000 * 60 * 60 * 24));
                    if(isNaN(daysActive)) daysActive = 1;
                } catch(e) { daysActive = 1; }
            }

            let videoUrl = coreItem.video_url || coreItem.videoUrl || coreItem.videoHdUrl || rootItem.video_url || null;
            if (!videoUrl && coreItem.videos?.length > 0) videoUrl = coreItem.videos[0].video_hd_url || coreItem.videos[0].video_url || coreItem.videos[0].url || (typeof coreItem.videos[0] === 'string' ? coreItem.videos[0] : null);
            if (typeof videoUrl !== 'string') videoUrl = null;

            let mediaUrl = rootItem.media?.primary_thumbnail || coreItem.media?.primary_thumbnail || coreItem.image_url || rootItem.image_url;
            if (!mediaUrl && coreItem.images?.length > 0) mediaUrl = coreItem.images[0].originalImageUrl || coreItem.images[0].url || (typeof coreItem.images[0] === 'string' ? coreItem.images[0] : null);
            if (!mediaUrl && coreItem.snapshot && coreItem.snapshot.images?.length > 0) mediaUrl = coreItem.snapshot.images[0].url; 
            if (typeof mediaUrl !== 'string') mediaUrl = null;
            
            let isVideo = videoUrl ? true : (coreItem.media?.type === 'video' || coreItem.media_type === 'video');
            let formatType = isVideo ? "Vídeo" : "Imagem";

            let platformsRaw = Array.isArray(rootItem.platforms) ? rootItem.platforms : Array.isArray(coreItem.publisherPlatforms) ? coreItem.publisherPlatforms : Array.isArray(coreItem.platforms) ? coreItem.platforms : ["FACEBOOK"];

            const signature = pageId ? `page_${pageId}` : `adv_${advertiser.trim().toLowerCase()}`;
            let safeRawData = "";
            try { safeRawData = JSON.stringify(rawData, null, 2); } catch(e) { safeRawData = "Omitido por segurança."; }

            if (advertiserMap.has(signature)) {
                const existingAd = advertiserMap.get(signature);
                if (!existingAd.archiveIds) existingAd.archiveIds = {};
                if (!existingAd.archiveIds[adId] || countForThisArchive > existingAd.archiveIds[adId]) {
                    existingAd.archiveIds[adId] = countForThisArchive;
                }
                existingAd.adCount = Object.values(existingAd.archiveIds).reduce((a, b) => a + b, 0);
                if (daysActive > existingAd.daysActive) existingAd.daysActive = daysActive;
                existingAd.allDates.push(daysActive);
                existingAd.allCopies.add(copyText.substring(0, 30).replace(/\s+/g, ' ').trim());
                
                let shouldSwapCreative = false;
                if (!existingAd.isVideo && isVideo) shouldSwapCreative = true;
                else if (existingAd.isVideo === isVideo && countForThisArchive > existingAd.bestIndividualAdCount) shouldSwapCreative = true;

                if (shouldSwapCreative) {
                    existingAd.videoUrl = videoUrl; existingAd.mediaUrl = mediaUrl; existingAd.type = isVideo ? "Vídeo" : "Imagem";
                    existingAd.formatType = formatType; existingAd.isVideo = isVideo; existingAd.copy = copyText; 
                    existingAd.title = title; existingAd.bestIndividualAdCount = countForThisArchive;
                    if (targetUrl) existingAd.targetUrl = targetUrl;
                    if (ticketPrice !== "Oculto") existingAd.ticketPrice = ticketPrice;
                }
            } else {
                const initialArchiveIds = {}; initialArchiveIds[adId] = countForThisArchive;
                advertiserMap.set(signature, {
                  id: adId, title: title, advertiser: advertiser, profilePic: profilePic, copy: copyText, targetUrl: targetUrl, libraryUrl: libraryUrl,
                  daysActive: daysActive, ticketPrice: ticketPrice, adCount: countForThisArchive, bestIndividualAdCount: countForThisArchive,
                  archiveIds: initialArchiveIds, allDates: [daysActive], allCopies: new Set([copyText.substring(0, 30).replace(/\s+/g, ' ').trim()]), 
                  niche: niche, formatType: formatType, platformCount: platformsRaw.length, platform: platformsRaw.join(', '), likesCount: Math.floor(Math.random() * 800) + 100,
                  type: isVideo ? "Vídeo" : "Imagem", isVideo: isVideo, mediaUrl: mediaUrl, videoUrl: videoUrl, color: "from-slate-700 to-slate-900", rawData: safeRawData,
                });
            }
        } catch (itemError) { console.error("Erro num anúncio ignorado:", itemError); }
      });

      const formattedAds = Array.from(advertiserMap.values()).map(ad => {
          
          // Inteligência de Deteção de Padrões
          const recentAdsCount = ad.allDates ? ad.allDates.filter(d => d <= 7).length : 0;
          ad.isAggressiveScale = recentAdsCount >= 3 && ad.adCount >= 5;
          ad.isABTesting = ad.allCopies && ad.allCopies.size > 1 && ad.adCount >= 2;
          ad.isCreativeKing = ad.daysActive > 30 && ad.adCount >= 10;
          ad.isBlackHat = ['linktr.ee', 'bit.ly', 'shorturl', 'hotm.art', 'go.hotmart', 'monetizze', 'kiwify.com', 'perfectpay'].some(d => ad.targetUrl.toLowerCase().includes(d)) || (getBaseDomain(ad.targetUrl).length > 25);

          // MOTOR V4: Scoring Focado em Dinheiro Gasto (Volume x Tempo)
          
          // 1. Escala (Volume de Anúncios) - Teto reduzido para 15 anúncios (atingir 15 já dá nota máxima de escala)
          const adScoreCalc = Math.min((ad.adCount / 15) * 55, 55); 

          // 2. Consistência (Tempo no Ar) - Teto reduzido para 25 dias
          const daysScoreCalc = Math.min((ad.daysActive / 25) * 35, 35);

          // 3. Distribuição (Plataformas)
          const platformScoreCalc = Math.min((ad.platformCount / 4) * 10, 10);
          
          let totalScore = Math.round(adScoreCalc + daysScoreCalc + platformScoreCalc);
          
          // BOOSTS (O Ouro)
          if (ad.adCount >= 4 && ad.daysActive >= 7) {
              totalScore += 20; // Bónus de "Ouro Confirmado" (Investimento alto e constante)
          }

          if (ad.isAggressiveScale) totalScore += 15;
          if (ad.isCreativeKing) totalScore += 15;

          // Limita o teto máximo a 99 (gatilho mental de quase perfeição)
          ad.score = Math.min(totalScore, 99); 
          
          // Atualiza o Status baseado na nova pontuação forte
          if (ad.score >= 75) ad.status = "Escalando";
          else if (ad.score >= 45) ad.status = "Validado";
          else ad.status = "Teste";

          return ad;
      });

      setAds(formattedAds.sort((a, b) => (b.score || 0) - (a.score || 0)));
      setMiningProgress(100); setMiningStatusMsg('Radar Concluído com Sucesso!');

    } catch (error) {
      console.error("Erro detetado:", error);
      let displayError = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      if (displayError.includes('Failed to fetch')) {
        displayError = "Erro de Ligação: O navegador bloqueou o acesso à API. Desligue o seu bloqueador de anúncios (AdBlock) para o site 'api.apify.com'.";
      }
      setMiningError(displayError);
      addLog(`ERRO: ${displayError}`, 'error');
    } finally {
      setTimeout(() => { setIsMining(false); setMiningProgress(0); }, 800);
    }
  };

  const getDisplayedAds = () => {
    const sourceAds = activeTab === 'vault' ? savedAds : ads;
    let filtered = sourceAds.filter(ad => {
        if ((ad.daysActive || 0) < minDaysFilter) return false;
        if (mediaTypeFilter !== 'ALL' && ad.type !== mediaTypeFilter) return false;
        return true;
    });
    return filtered.sort((a, b) => {
        if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
        if (sortBy === 'recentes') return (a.daysActive || 0) - (b.daysActive || 0);
        if (sortBy === 'antigos') return (b.daysActive || 0) - (a.daysActive || 0);
        return 0;
    });
  };

  let calcMaxDays = 30;
  const allAvailableDays = (activeTab === 'vault' ? savedAds : ads).map(a => a.daysActive || 0).filter(d => !isNaN(d));
  if (allAvailableDays.length > 0) calcMaxDays = Math.max(...allAvailableDays, 30);
  
  const allDisplayedAds = getDisplayedAds();
  const adsToRender = allDisplayedAds.slice(0, visibleAdsCount);

  // =======================================================
  // UI PRINCIPAL
  // =======================================================
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
              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors">Entrar <ArrowRight className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6 hidden md:flex shrink-0">
        <div className="flex items-center gap-2 text-green-500 font-bold text-2xl mb-8">
            <Crosshair className="w-7 h-7 text-green-500" /> <span>Ad<span className="text-white">Sniper</span></span>
        </div>
        <nav className="space-y-2 flex-1 flex flex-col">
          <p className="text-xs font-bold text-slate-500 mb-2 mt-4 px-3 uppercase tracking-wider">Descoberta</p>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'dashboard' ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <LayoutDashboard className="w-5 h-5"/> Radar de Ofertas
          </button>
          <button onClick={() => setActiveTab('vault')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'vault' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <Bookmark className="w-5 h-5"/> Meu Cofre <span className="ml-auto bg-slate-800 text-xs px-2 py-0.5 rounded-full">{savedAds.length}</span>
          </button>

          <p className="text-xs font-bold text-slate-500 mb-2 mt-6 px-3 uppercase tracking-wider">Criação</p>
          <button onClick={() => setActiveTab('generator')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'generator' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <PenTool className="w-5 h-5"/> Gerador de Criativos
          </button>
          <button onClick={() => setActiveTab('cloner')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'cloner' ? 'bg-fuchsia-600/10 text-fuchsia-400 border border-fuchsia-500/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <Copy className="w-5 h-5"/> Clonador de Páginas
          </button>

          <div className="mt-auto pt-6">
              <button onClick={() => setActiveTab('settings')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800 text-slate-400'}`}>
                <Settings className="w-5 h-5"/> Configurações
              </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto relative" onScroll={handleScroll}>
        
        {/* ROTEAMENTO DE ABAS MODULARES */}
        {activeTab === 'generator' && <GeneratorPage />}
        {activeTab === 'cloner' && <ClonerPage />}
        {activeTab === 'settings' && (
           <SettingsPage 
              apifyToken={apifyToken} setApifyToken={setApifyToken}
              actorId={actorId} setActorId={setActorId}
              aiProvider={aiProvider} setAiProvider={setAiProvider}
              geminiToken={geminiToken} setGeminiToken={setGeminiToken}
              chatGptToken={chatGptToken} setChatGptToken={setChatGptToken}
              handleSaveSettings={handleSaveSettings}
           />
        )}

        {/* NÚCLEO DO RADAR (Dashboard / Cofre) */}
        {(activeTab === 'dashboard' || activeTab === 'vault') && (
            <div className="max-w-7xl mx-auto p-4 md:p-8">
              
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

              {isMining && (
                  <div className="mb-6 p-5 bg-slate-900/80 border border-green-500/20 rounded-xl shadow-lg">
                      <div className="flex justify-between items-center text-sm mb-3 font-bold">
                          <span className="text-green-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> {miningStatusMsg}</span>
                          <span className="text-slate-400">{miningProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden relative">
                          <div className="absolute top-0 left-0 bg-gradient-to-r from-green-600 to-emerald-400 h-3 rounded-full transition-all duration-[800ms] ease-out shadow-[0_0_10px_rgba(74,222,128,0.5)]" style={{ width: `${miningProgress}%` }}></div>
                      </div>
                  </div>
              )}

              {(ads.length > 0 || activeTab === 'vault') && !isMining && (
                  <div className="mb-8 flex flex-wrap items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mr-2">
                          <Filter className="w-4 h-4"/> Filtros:
                      </div>
                      <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                          <span className="text-xs text-slate-500 font-bold uppercase">Tempo no Ar:</span>
                          <input type="range" min="0" max={calcMaxDays} step="1" value={minDaysFilter} onChange={(e) => setMinDaysFilter(Number(e.target.value))} className="w-32 accent-green-500 cursor-pointer" />
                          <span className="text-sm font-bold text-green-400 w-16 text-right">+{minDaysFilter} dias</span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                          <span className="text-xs text-slate-500 font-bold uppercase">Formato:</span>
                          <select value={mediaTypeFilter} onChange={(e) => setMediaTypeFilter(e.target.value)} className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer">
                              <option value="ALL">Todos</option>
                              <option value="Vídeo">Apenas Vídeos</option>
                              <option value="Imagem">Apenas Imagens</option>
                          </select>
                      </div>

                      <div className="flex-1"></div>

                      <div className="flex items-center gap-3 bg-indigo-950/30 px-4 py-2 rounded-lg border border-indigo-500/30">
                          <ArrowUpDown className="w-4 h-4 text-indigo-400"/>
                          <span className="text-xs text-indigo-300 font-bold uppercase">Ordenar:</span>
                          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-sm font-bold text-indigo-100 outline-none cursor-pointer">
                              <option value="score">Pontuação de Escala (Score)</option>
                              <option value="antigos">Mais Antigos</option>
                              <option value="recentes">Mais Recentes</option>
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

              {miningError && activeTab === 'dashboard' && !isMining && (
                 <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div><h3 className="text-red-400 font-bold text-lg mb-1">Atenção Necessária</h3><p className="text-slate-300 text-sm leading-relaxed">{miningError}</p></div>
                 </div>
              )}

              {/* GRELHA DE ANÚNCIOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {adsToRender.map(ad => (
                  <div key={ad.id} onClick={() => setSelectedAd(ad)} className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden hover:border-green-500/50 hover:shadow-green-900/20 hover:shadow-2xl transition-all cursor-pointer flex flex-col group relative">
                    
                    <div className="p-4 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/50">
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                            {ad.profilePic ? (
                                <img src={ad.profilePic} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">
                                    {ad.advertiser?.charAt(0).toUpperCase() || "A"}
                                </div>
                            )}
                            <div className="flex flex-col truncate pr-2">
                                <span className="font-bold text-slate-200 truncate">{ad.advertiser}</span>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Anunciante</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col items-center justify-center bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl shrink-0">
                                <span className={`text-sm font-bold ${ad.score >= 80 ? 'text-green-400' : ad.score >= 50 ? 'text-yellow-400' : 'text-slate-400'}`}>
                                    {ad.score || 0}
                                </span>
                                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Score</span>
                            </div>
                            <button onClick={(e) => toggleSaveAd(ad, e)} className="bg-slate-800/80 hover:bg-slate-700 p-2.5 rounded-full transition-transform hover:scale-105 shrink-0">
                                <Heart size={16} className={isAdSaved(ad.id) ? "fill-red-500 text-red-500" : "text-slate-400"} />
                            </button>
                        </div>
                    </div>

                    <div className={`h-48 w-full bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-800`}>
                      {ad.videoUrl ? (
                          <video src={ad.videoUrl} poster={ad.mediaUrl || ''} muted loop playsInline onMouseEnter={(e) => e.target.play()} onMouseLeave={(e) => e.target.pause()} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity z-0" />
                      ) : ad.mediaUrl ? (
                         <img src={ad.mediaUrl} alt="Criativo" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity z-0" />
                      ) : ( <ImageIcon className="text-slate-800 w-12 h-12" /> )}
                      
                      {ad.type === 'Vídeo' && <PlayCircle className="w-12 h-12 text-white/50 z-10 pointer-events-none group-hover:opacity-0 transition-opacity" />}
                      <div className="absolute top-2 left-2 z-10 pointer-events-none flex flex-col gap-1.5">
                          <PlatformBadge platform={ad.platform} />
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col bg-slate-900">
                      <h3 className="font-bold text-white text-[15px] leading-tight line-clamp-2 mb-3">
                          {ad.title !== 'Oferta Encontrada' && ad.title !== `Anúncio de ${ad.advertiser}` ? ad.title : (ad.copy || "").split('\n')[0]}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-3">
                          <FusionBadge text={ad.niche} />
                          <FusionBadge icon={StatusToIcon(ad.score || 0)} text={ad.status || "Teste"} variant={StatusToVariant(ad.score || 0)} />
                          {ad.isAggressiveScale && <FusionBadge icon={Rocket} text="Acelerador" variant="danger" />}
                          {ad.isABTesting && <FusionBadge icon={SplitSquareHorizontal} text="A/B Testing" variant="brand" />}
                          {ad.isCreativeKing && <FusionBadge icon={Trophy} text="Criativo Rei" variant="gold" />}
                          {ad.isBlackHat && <FusionBadge icon={ShieldAlert} text="Agressivo" variant="danger" />}
                      </div>

                      <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed mb-4 flex-1">
                          {ad.copy}
                      </p>

                      <div className="grid grid-cols-3 gap-2 bg-slate-950 rounded-xl p-3 border border-slate-800/80 mb-4">
                          <div className="flex flex-col items-center justify-center text-center">
                              <Layers size={14} className="text-indigo-400 mb-1" />
                              <span className="text-white font-bold text-sm">{ad.adCount}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Ads da Página</span>
                          </div>
                          <div className="flex flex-col items-center justify-center text-center border-l border-r border-slate-800">
                              <Calendar size={14} className="text-green-400 mb-1" />
                              <span className="text-white font-bold text-sm">{ad.daysActive}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Max Dias</span>
                          </div>
                          <div className="flex flex-col items-center justify-center text-center">
                              <DollarSign size={14} className="text-emerald-400 mb-1" />
                              <span className="text-white font-bold text-sm">{ad.ticketPrice}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Ticket</span>
                          </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-800/50">
                          <div className="flex items-center gap-1.5"><Clock size={12}/> há poucos segundos</div>
                          {ad.libraryUrl && (
                              <button onClick={(e) => { e.stopPropagation(); window.open(ad.libraryUrl, '_blank'); }} className="hover:text-white flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded">
                                  <Library size={12}/> <span className="hidden sm:inline">Biblioteca</span>
                              </button>
                          )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
              
              {/* Spinner Loading do Scroll Infinito */}
              {visibleAdsCount < allDisplayedAds.length && (
                  <div className="w-full flex justify-center items-center py-10 opacity-50">
                      <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                  </div>
              )}
            </div>
        )}

      </main>

      {/* MODAL DETALHES (Renderizado quando SelectedAd existe) */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm" onClick={() => setSelectedAd(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-800/50 p-6 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-4">
                  {selectedAd.profilePic ? (
                      <img src={selectedAd.profilePic} className="w-12 h-12 rounded-full border-2 border-slate-700 object-cover" />
                  ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-lg text-slate-400">{selectedAd.advertiser?.charAt(0) || "A"}</div>
                  )}
                  <div>
                      <h2 className="font-bold text-xl text-white leading-none mb-2">{selectedAd.advertiser}</h2>
                      <div className="flex flex-wrap gap-2">
                         <FusionBadge text={selectedAd.status} variant={StatusToVariant(selectedAd.score || 0)} icon={StatusToIcon(selectedAd.score || 0)} />
                         {selectedAd.isAggressiveScale && <FusionBadge icon={Rocket} text="Acelerador" variant="danger" />}
                         {selectedAd.isABTesting && <FusionBadge icon={SplitSquareHorizontal} text="A/B Testing" variant="brand" />}
                         {selectedAd.isCreativeKing && <FusionBadge icon={Trophy} text="Criativo Rei" variant="gold" />}
                      </div>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-center justify-center bg-slate-950 border border-slate-700 px-4 py-1.5 rounded-xl shrink-0">
                      <span className={`text-xl font-black ${selectedAd.score >= 80 ? 'text-green-400' : selectedAd.score >= 50 ? 'text-yellow-400' : 'text-slate-400'}`}>{selectedAd.score || 0}</span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Score</span>
                  </div>
                  <button onClick={() => setSelectedAd(null)} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2.5 rounded-full transition-colors"><X size={20} /></button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6">
                  <div className="text-center">
                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Dias no Ar</p>
                      <p className="text-white font-bold text-lg">{selectedAd.daysActive}</p>
                  </div>
                  <div className="text-center border-l border-r border-slate-800">
                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Anúncios Ativos</p>
                      <p className="text-indigo-400 font-bold text-lg">{selectedAd.adCount}</p>
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

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
               {selectedAd.libraryUrl && (
                   <a href={selectedAd.libraryUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl transition-colors font-bold text-sm">
                       <Library size={18} /> Ver na Biblioteca (Meta)
                   </a>
               )}
               {selectedAd.targetUrl && !selectedAd.isBlackHat ? (
                   <a href={selectedAd.targetUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl transition-colors font-bold text-sm shadow-lg shadow-green-900/20">
                       <ExternalLink size={18} /> Abrir Página de Vendas
                   </a>
               ) : selectedAd.targetUrl && selectedAd.isBlackHat ? (
                   <a href={selectedAd.targetUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white py-3.5 rounded-xl transition-colors font-bold text-sm shadow-lg shadow-rose-900/20">
                       <ShieldAlert size={18} /> Vendas (Risco BlackHat)
                   </a>
               ) : (
                   <button disabled className="flex-1 flex items-center justify-center gap-2 bg-slate-800/50 text-slate-500 py-3.5 rounded-xl font-bold text-sm cursor-not-allowed border border-slate-800">
                       Vendas Indisponível
                   </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
