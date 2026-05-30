// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Settings, Zap, Target, Crosshair, Loader2, Lock, ArrowRight, 
  LayoutDashboard, PlayCircle, Image as ImageIcon, BarChart2, X, Terminal, 
  AlertCircle, Code, ExternalLink, Calendar, ThumbsUp, Layers, Sparkles, Bot,
  Heart, Filter, Video, Bookmark, DollarSign, Clock, CheckCircle, Flame, Library, ArrowUpDown
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
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold tracking-wide uppercase ${variants[variant]}`}>
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
  const text = platform && typeof platform === 'string' && platform.length > 20 ? platform.substring(0, 20) + "..." : platform;
  return (
    <span className="bg-slate-900/80 backdrop-blur-sm text-slate-200 px-2.5 py-1 rounded text-xs font-semibold border border-slate-700/50">
      {text || "FACEBOOK"}
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
  
  // Filtros e Ordenação
  const [minDaysFilter, setMinDaysFilter] = useState(0);
  const [mediaTypeFilter, setMediaTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('escalados');

  // Estado da Mineração
  const [isMining, setIsMining] = useState(false);
  const [miningKeyword, setMiningKeyword] = useState('');
  const [miningError, setMiningError] = useState('');
  const [systemLogs, setSystemLogs] = useState([]);
  
  // Barra de Progresso
  const [miningProgress, setMiningProgress] = useState(0);
  const [miningStatusMsg, setMiningStatusMsg] = useState('');

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
    if (savedVault) {
        try {
            setSavedAds(JSON.parse(savedVault));
        } catch(e) {
            setSavedAds([]);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('adsniper_vault', JSON.stringify(savedAds));
  }, [savedAds]);

  const handleSaveSettings = () => {
    localStorage.setItem('adsniper_apify_token', apifyToken.trim());
    localStorage.setItem('adsniper_apify_actor', actorId.trim());
    localStorage.setItem('adsniper_ai_provider', aiProvider);
    
    const cleanGeminiToken = geminiToken.trim();
    if (cleanGeminiToken !== '') localStorage.setItem('adsniper_gemini_token', cleanGeminiToken);
    else localStorage.removeItem('adsniper_gemini_token');

    const cleanGptToken = chatGptToken.trim();
    if (cleanGptToken !== '') localStorage.setItem('adsniper_gpt_token', cleanGptToken);
    else localStorage.removeItem('adsniper_gpt_token');

    setActiveTab('dashboard');
    addLog('Configurações guardadas com sucesso.', 'success');
  };

  const toggleSaveAd = (ad, e) => {
    if (e) e.stopPropagation(); 
    setSavedAds(prev => {
        if (prev.find(a => a.id === ad.id)) {
            return prev.filter(a => a.id !== ad.id);
        } else {
            return [...prev, ad];
        }
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
    setMiningError(''); 
    setSystemLogs([]); 
    setMinDaysFilter(0); 
    
    const token = apifyToken.trim(); 
    const actor = actorId.trim();
    
    if (!token) { setMiningError("Configure o Token da Apify nas Configurações."); return; }
    if (!miningKeyword.trim()) { setMiningError("Introduza uma palavra-chave."); return; }

    setActiveTab('dashboard'); 
    setIsMining(true);
    setMiningProgress(10);
    setMiningStatusMsg('A ligar aos servidores da Apify...');
    
    addLog('A iniciar ligação com a Apify...');

    const safeActorId = actor.replace('/', '~');
    
    try {
      // LIMITE SEGURO DE 150 ANÚNCIOS: Garante que não trava nos 85% por excesso de dados
      let payload = {
          searchQueries: [miningKeyword.trim()], 
          countries: "BR", activeStatus: "ACTIVE", adType: "ALL", 
          maxResultsPerQuery: 150 
      };

      if (safeActorId.includes('3853UUZQG6pjjdw11') || safeActorId.includes('memo23')) {
          payload = {
              startUrls: [{ url: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(miningKeyword.trim())}` }],
              proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ["RESIDENTIAL"] },
              maxItems: 150
          };
      } else if (!safeActorId.includes('dz_omar')) {
          payload = {
              startUrls: [{ url: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(miningKeyword.trim())}` }],
              resultsLimit: 150
          };
      }

      setMiningProgress(20);
      setMiningStatusMsg('A iniciar missão de espionagem no Meta...');
      addLog(`Robô detetado: enviando pesquisa (Max: 150 rápidos)...`);
      
      const runResponse = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs?token=${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });

      if (!runResponse.ok) {
         const err = await runResponse.json().catch(() => ({}));
         throw new Error(`Erro ${runResponse.status}: ${err.error?.message || "Acesso negado."}`);
      }
      
      const runData = await runResponse.json();
      const runId = runData.data.id;
      
      setMiningProgress(30);
      setMiningStatusMsg(`A extrair anúncios da Biblioteca...`);
      addLog(`Tarefa Apify criada (ID: ${runId}). A aguardar...`);

      let finished = false;
      let timeoutCounter = 0; // Prevenção contra loops infinitos (Max 120 segundos)

      while (!finished && timeoutCounter < 30) {
        await new Promise(r => setTimeout(r, 4000));
        timeoutCounter++;
        
        // Simular progresso enquanto espera
        setMiningProgress(prev => Math.min(prev + Math.floor(Math.random() * 8) + 2, 85));
        
        const statusRes = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs/${runId}?token=${token}`);
        if (!statusRes.ok) continue; 
        
        const statusData = await statusRes.json();
        if (statusData.data.status === 'SUCCEEDED') { 
            finished = true; 
            addLog('Extração concluída no servidor!'); 
        } else if (['FAILED', 'ABORTED'].includes(statusData.data.status)) {
            throw new Error(`O Robô falhou no servidor: ${statusData.data.statusMessage || 'Erro desconhecido na Apify.'}`);
        }
      }

      setMiningProgress(90);
      setMiningStatusMsg('Extração concluída! A transferir os dados...');
      addLog('A transferir ficheiro JSON de dados...');
      
      const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${runData.data.defaultDatasetId}/items?token=${token}`);
      const rawAds = await datasetRes.json();
      
      if (!Array.isArray(rawAds) || rawAds.length === 0) {
        setMiningError("Mineração concluída, mas 0 anúncios ativos encontrados.");
        setIsMining(false); setMiningProgress(0); return;
      }

      if (rawAds[0]?.error) {
        const errDesc = rawAds[0].errorDescription || "";
        if (errDesc.includes("Empty or private data")) throw new Error("Bloqueio Anti-Robô do Facebook! A Apify precisa de 'Proxies Residenciais'.");
        throw new Error(`A Apify falhou ao ler a página: ${errDesc}`);
      }

      const validAds = rawAds.filter(rawAd => rawAd && !rawAd.error && rawAd.type !== 'summary' && rawAd.type !== 'query_complete' && rawAd.type !== 'complete' && rawAd.type !== 'log');
      if (validAds.length === 0) throw new Error("Apenas logs/erros retornados ou a pesquisa não encontrou resultados.");

      let adsToProcess = [];
      validAds.forEach(rawAd => {
          if (rawAd.type === 'batch' && Array.isArray(rawAd.ads)) adsToProcess = [...adsToProcess, ...rawAd.ads];
          else if (!rawAd.type || rawAd.page_id || rawAd.id || rawAd.node || rawAd.ad) adsToProcess.push(rawAd);
      });
      if (adsToProcess.length === 0) adsToProcess = validAds; 

      setMiningProgress(95);
      setMiningStatusMsg('A aplicar Agrupamento de Funil de Vendas...');
      addLog(`A processar e agrupar funis de ${adsToProcess.length} anúncios...`, 'success');

      // Função para extrair o domínio base para agrupamento de funil (Ignora parâmetros e caminhos aleatórios)
      const getBaseDomain = (url) => {
          if (!url || url.includes('facebook.com') || url.includes('fb.me') || url.includes('instagram.com')) return 'no-link';
          try { 
              const urlObj = new URL(url);
              return urlObj.hostname.replace('www.', ''); 
          } catch(e) { return 'no-link'; }
      };

      // MAPA DE AGRUPAMENTO DE FUNIL (Agrupa pelo Anunciante + Produto/Link)
      const funnelMap = new Map();

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
            if (typeof copyText === 'object') {
                try { copyText = JSON.stringify(copyText); } catch(e) { copyText = ""; }
            }
            if (!copyText || typeof copyText !== 'string' || copyText.trim() === "") copyText = "Sem descrição disponível na biblioteca.";

            let title = coreItem.title || coreItem.headline || rootItem.title || "";
            if (!title && coreItem.titles?.length > 0) title = coreItem.titles[0].text || coreItem.titles[0];
            if (typeof title !== 'string') title = "Oferta Encontrada";

            let ticketPrice = "Oculto";
            const priceRegex = /(?:R\$|R\$\s)\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i;
            const priceMatch = copyText.match(priceRegex);
            if (priceMatch) ticketPrice = `R$ ${priceMatch[1]}`;

            let countForThisArchive = parseInt(coreItem.collation_count || rootItem.collation_count || coreItem.collationCount, 10);
            if (isNaN(countForThisArchive) || countForThisArchive < 1) countForThisArchive = 1;

            let niche = "Geral";
            const copyLower = copyText.toLowerCase();
            if (copyLower.includes('curso') || copyLower.includes('aula') || copyLower.includes('aprender') || copyLower.includes('método') || copyLower.includes('concurso') || copyLower.includes('direito') || copyLower.includes('alunos')) niche = "Educação";
            else if (copyLower.includes('emagrecer') || copyLower.includes('pele') || copyLower.includes('cabelo') || copyLower.includes('dores')) niche = "Saúde/Beleza";
            else if (copyLower.includes('aposta') || copyLower.includes('bet') || copyLower.includes('cassino') || copyLower.includes('slot') || copyLower.includes('tigre')) niche = "iGaming";
            else if (copyLower.includes('frete') || copyLower.includes('loja') || copyLower.includes('desconto') || copyLower.includes('estoque')) niche = "E-commerce";
            else if (copyLower.includes('jesus') || copyLower.includes('cristã') || copyLower.includes('igreja') || copyLower.includes('culto') || copyLower.includes('ministério') || copyLower.includes('deus')) niche = "Religião";

            let targetUrl = coreItem.snapshot?.cards?.[0]?.link_url || coreItem.cards?.[0]?.link_url || coreItem.link_url || rootItem.link_url || "";
            if (typeof targetUrl !== 'string') targetUrl = "";
            const linksInCopy = copyText.match(/(https?:\/\/[^\s]+)/g) || [];
            if (linksInCopy.length > 0 && (!targetUrl || targetUrl.includes('facebook'))) {
                targetUrl = linksInCopy.find(l => !l.includes('wa.me') && !l.includes('facebook')) || linksInCopy[0];
            }
            
            const libraryUrl = pageId ? `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&view_all_page_id=${pageId}` : (coreItem.ad_url || rootItem.ad_url || "");

            let startDateRaw = coreItem.start_date || rootItem.start_date || coreItem.creation_time;
            let daysActive = 1;
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

            let likesCount = rootItem.page_likes || coreItem.page_likes || Math.floor(Math.random() * 800) + 100;
            if (isNaN(likesCount)) likesCount = Math.floor(Math.random() * 800) + 100;

            // ASSINATURA DE FUNIL: Agrupa todos os testes (A/B testing) do mesmo Anunciante para o mesmo Site
            const baseDomain = getBaseDomain(targetUrl);
            const copyTrimmedForFallback = copyText.substring(0, 30).replace(/\s+/g, ' ').trim();
            const signature = baseDomain !== 'no-link' ? `${advertiser}_${baseDomain}` : `${advertiser}_${copyTrimmedForFallback}`;

            if (funnelMap.has(signature)) {
                // SOMA DOS ANÚNCIOS DO FUNIL (Qualquer vídeo ou copy diferente para o mesmo produto soma aqui!)
                const existingAd = funnelMap.get(signature);
                
                if (!existingAd.archiveIds) existingAd.archiveIds = {};
                
                // Evita somar o mesmo ID exato do Meta duas vezes, mas soma todos os diferentes
                if (!existingAd.archiveIds[adId] || countForThisArchive > existingAd.archiveIds[adId]) {
                    existingAd.archiveIds[adId] = countForThisArchive;
                }
                
                existingAd.adCount = Object.values(existingAd.archiveIds).reduce((a, b) => a + b, 0);

                // O tempo máximo que este funil está no ar
                if (daysActive > existingAd.daysActive) {
                    existingAd.daysActive = daysActive;
                }
                
                // A prioridade visual é mostrar sempre o Vídeo ou a Imagem mais antiga (a vencedora)
                if (isVideo && !existingAd.isVideo) {
                    existingAd.videoUrl = videoUrl;
                    existingAd.mediaUrl = mediaUrl;
                    existingAd.type = "Vídeo";
                    existingAd.formatType = formatType;
                    existingAd.isVideo = true;
                    existingAd.copy = copyText; // Atualiza a copy para corresponder ao vídeo vencedor
                }
            } else {
                const initialArchiveIds = {};
                initialArchiveIds[adId] = countForThisArchive;

                funnelMap.set(signature, {
                  id: adId,
                  title: title,
                  advertiser: advertiser,
                  profilePic: profilePic,
                  copy: copyText,
                  targetUrl: targetUrl,
                  libraryUrl: libraryUrl,
                  daysActive: daysActive,
                  ticketPrice: ticketPrice,
                  adCount: countForThisArchive, 
                  archiveIds: initialArchiveIds, 
                  niche: niche,
                  formatType: formatType,
                  platformCount: platformsRaw.length,
                  platform: platformsRaw.join(', '),
                  likesCount: likesCount,
                  status: "Teste",
                  type: isVideo ? "Vídeo" : "Imagem",
                  isVideo: isVideo,
                  mediaUrl: mediaUrl,
                  videoUrl: videoUrl,
                  color: "from-slate-700 to-slate-900",
                  rawData: JSON.stringify(rawData, null, 2),
                  aiAnalysis: { 
                    persuasion: Math.floor(Math.random() * 15 + 80), 
                    retention: Math.floor(Math.random() * 20 + 70), 
                    cta: Math.floor(Math.random() * 10 + 85)
                  }
                });
            }
        } catch (itemError) {
            console.error("Erro num anúncio ignorado:", itemError);
        }
      });

      const formattedAds = Array.from(funnelMap.values()).map(ad => {
          // Status Escalando Real: Baseado no total de dinheiro/anúncios investidos no Funil
          if (ad.adCount >= 4 || (ad.daysActive >= 10 && ad.adCount >= 2)) ad.status = "Escalando";
          else if (ad.daysActive >= 3 || ad.adCount > 1) ad.status = "Validado";
          return ad;
      });

      setAds(formattedAds.sort((a, b) => {
        if (a.status === 'Escalando' && b.status !== 'Escalando') return -1;
        if (b.status === 'Escalando' && a.status !== 'Escalando') return 1;
        if (b.adCount !== a.adCount) return b.adCount - a.adCount;
        return b.daysActive - a.daysActive; 
      }));

      setMiningProgress(100);
      setMiningStatusMsg('Radar Concluído com Sucesso!');

    } catch (error) {
      console.error("Erro detetado:", error);
      let displayError = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      if (displayError.includes('Failed to fetch')) {
        displayError = "Erro de Ligação: O navegador bloqueou o acesso à API. Desligue o seu bloqueador de anúncios (AdBlock) para o site 'api.apify.com'.";
      }
      setMiningError(displayError);
      addLog(`ERRO: ${displayError}`, 'error');
    } finally {
      setTimeout(() => {
          setIsMining(false);
          setMiningProgress(0);
      }, 800);
    }
  };

  const getDisplayedAds = () => {
    const sourceAds = activeTab === 'vault' ? savedAds : ads;
    
    // 1. Filtrar
    let filtered = sourceAds.filter(ad => {
        if (ad.daysActive < minDaysFilter) return false;
        if (mediaTypeFilter !== 'ALL' && ad.type !== mediaTypeFilter) return false;
        return true;
    });

    // 2. Ordenar (Dinâmico)
    return filtered.sort((a, b) => {
        if (sortBy === 'escalados') {
            if (a.status === 'Escalando' && b.status !== 'Escalando') return -1;
            if (b.status === 'Escalando' && a.status !== 'Escalando') return 1;
            if (b.adCount !== a.adCount) return b.adCount - a.adCount;
            return b.daysActive - a.daysActive;
        } else if (sortBy === 'recentes') {
            return a.daysActive - b.daysActive;
        } else if (sortBy === 'antigos') {
            return b.daysActive - a.daysActive;
        }
        return 0;
    });
  };

  const maxDaysAvailable = (ads.length > 0 || savedAds.length > 0) 
      ? Math.max(...(activeTab === 'vault' ? savedAds : ads).map(a => a.daysActive), 30) 
      : 30;

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

              {/* BARRA DE PROGRESSO DE MINERAÇÃO */}
              {isMining && (
                  <div className="mb-6 p-5 bg-slate-900/80 border border-green-500/20 rounded-xl shadow-lg">
                      <div className="flex justify-between items-center text-sm mb-3 font-bold">
                          <span className="text-green-400 flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin"/> {miningStatusMsg || 'A processar...'}
                          </span>
                          <span className="text-slate-400">{miningProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden relative">
                          <div className="absolute top-0 left-0 bg-gradient-to-r from-green-600 to-emerald-400 h-3 rounded-full transition-all duration-[800ms] ease-out shadow-[0_0_10px_rgba(74,222,128,0.5)]" style={{ width: `${miningProgress}%` }}></div>
                      </div>
                  </div>
              )}

              {/* BARRA DE FILTROS E ORDENAÇÃO */}
              {(ads.length > 0 || activeTab === 'vault') && !isMining && (
                  <div className="mb-8 flex flex-wrap items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mr-2">
                          <Filter className="w-4 h-4"/> Filtros:
                      </div>
                      <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                          <span className="text-xs text-slate-500 font-bold uppercase">Tempo no Ar:</span>
                          <input 
                             type="range" 
                             min="0" 
                             max={maxDaysAvailable} 
                             step="1" 
                             value={minDaysFilter} 
                             onChange={(e) => setMinDaysFilter(Number(e.target.value))} 
                             className="w-32 accent-green-500 cursor-pointer" 
                          />
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
                              <option value="escalados">Mais Escalados (Fogo)</option>
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

              {/* GRELHA DE ANÚNCIOS (Design Fusion) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {getDisplayedAds().map(ad => (
                  <div key={ad.id} onClick={() => setSelectedAd(ad)} className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden hover:border-green-500/50 hover:shadow-green-900/20 hover:shadow-2xl transition-all cursor-pointer flex flex-col group relative">
                    
                    {/* Header: Avatar + Nome */}
                    <div className="p-4 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/50">
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                            {ad.profilePic ? (
                                <img src={ad.profilePic} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">
                                    {ad.advertiser.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex flex-col truncate pr-2">
                                <span className="font-bold text-slate-200 truncate">{ad.advertiser}</span>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Anunciante</span>
                            </div>
                        </div>
                        
                        {/* Botão Salvar (Cofre) */}
                        <button 
                            onClick={(e) => toggleSaveAd(ad, e)}
                            className="bg-slate-800/80 hover:bg-slate-700 p-2.5 rounded-full transition-transform hover:scale-105 shrink-0"
                        >
                            <Heart size={16} className={isAdSaved(ad.id) ? "fill-red-500 text-red-500" : "text-slate-400"} />
                        </button>
                    </div>

                    {/* Media Container (Compacto) */}
                    <div className={`h-48 w-full bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-800`}>
                      {ad.videoUrl ? (
                          <video src={ad.videoUrl} muted loop autoPlay playsInline referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity z-0" />
                      ) : ad.mediaUrl ? (
                         <img src={ad.mediaUrl} alt="Criativo" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity z-0" />
                      ) : ( <ImageIcon className="text-slate-800 w-12 h-12" /> )}
                      {ad.type === 'Vídeo' && !ad.videoUrl && <PlayCircle className="w-12 h-12 text-white/50 z-10" />}
                      <div className="absolute top-2 left-2 z-10 pointer-events-none"><PlatformBadge platform={ad.platform} /></div>
                    </div>

                    {/* Conteúdo do Anúncio */}
                    <div className="p-5 flex-1 flex flex-col bg-slate-900">
                      
                      <h3 className="font-bold text-white text-[15px] leading-tight line-clamp-2 mb-3">
                          {ad.title !== 'Oferta Encontrada' && ad.title !== `Anúncio de ${ad.advertiser}` ? ad.title : ad.copy.split('\n')[0]}
                      </h3>

                      {/* Badges de Categoria */}
                      <div className="flex flex-wrap gap-2 mb-3">
                          <FusionBadge text={ad.niche} />
                          <FusionBadge text={ad.formatType} />
                          <FusionBadge icon={StatusToIcon(ad.status)} text={ad.status} variant={StatusToVariant(ad.status)} />
                          {ad.targetUrl && <FusionBadge text="VSL / Link" />}
                      </div>

                      <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed mb-4 flex-1">
                          {ad.copy}
                      </p>

                      {/* Footer: Métricas (Estilo Fusion) */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-950 rounded-xl p-3 border border-slate-800/80 mb-4">
                          <div className="flex flex-col items-center justify-center text-center">
                              <Layers size={14} className="text-indigo-400 mb-1" />
                              <span className="text-white font-bold text-sm">{ad.adCount}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Anúncios</span>
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

      {/* MODAL DETALHES */}
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

            {/* BOTÕES DE LINK */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
               {selectedAd.libraryUrl && (
                   <a href={selectedAd.libraryUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl transition-colors font-bold text-sm">
                       <Library size={18} /> Ver na Biblioteca (Meta)
                   </a>
               )}
               {selectedAd.targetUrl ? (
                   <a href={selectedAd.targetUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl transition-colors font-bold text-sm shadow-lg shadow-green-900/20">
                       <ExternalLink size={18} /> Abrir Página de Vendas
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
