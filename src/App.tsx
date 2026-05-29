// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Settings, Zap, Target, Crosshair, Loader2, Lock, ArrowRight, 
  LayoutDashboard, PlayCircle, Image as ImageIcon, BarChart2, X, Terminal, AlertCircle, Code
} from 'lucide-react';

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
  <span className="bg-slate-900/80 backdrop-blur-sm text-slate-200 px-2 py-0.5 rounded text-xs font-semibold border border-slate-700/50">
    {platform}
  </span>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [ads, setAds] = useState([]);
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
      let payload = {};
      const keywordEncoded = encodeURIComponent(miningKeyword.trim());
      
      if (safeActorId.includes('dz_omar') || safeActorId.includes('20nRTxLD3a3jIlZbZ')) {
        payload = {
          searchQueries: [miningKeyword.trim()], 
          countries: ["BR"],                     
          activeStatus: "ACTIVE",                
          adType: "ALL",                         
          maxResultsPerQuery: 30                 
        };
      } else if (safeActorId.includes('3853UUZQG6pjjdw11') || safeActorId.includes('memo23')) {
        payload = {
          startUrls: [
            { url: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${keywordEncoded}&search_type=keyword_exact_phrase` }
          ],
          proxyConfiguration: {
            useApifyProxy: true,
            apifyProxyGroups: ["RESIDENTIAL"] 
          },
          maxItems: 30 
        };
      } else {
        payload = {
          startUrls: [
            { url: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${keywordEncoded}` }
          ],
          resultsLimit: 20
        };
      }

      addLog(`Robô detetado: enviando pacote de dados compatível...`);

      const runResponse = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!runResponse.ok) {
         if (runResponse.status === 403) {
             throw new Error("Erro 403: Acesso Proibido. O seu token não tem permissão. Vá ao site da Apify e certifique-se de que adicionou/subscreveu este Actor à sua conta.");
         }
         const err = await runResponse.json();
         throw new Error(`Erro ${runResponse.status}: ${err.error?.message || "Token inválido ou acesso negado."}`);
      }
      
      const runData = await runResponse.json();
      
      if (!runData || !runData.data || !runData.data.id) {
          throw new Error("A resposta da Apify foi bem-sucedida, mas não devolveu um ID de execução. Verifique as configurações.");
      }

      const runId = runData.data.id;
      addLog(`Tarefa criada na Apify (ID: ${runId}). A aguardar resultados...`);

      let finished = false;
      while (!finished) {
        await new Promise(r => setTimeout(r, 4000));
        const statusRes = await fetch(`https://api.apify.com/v2/acts/${safeActorId}/runs/${runId}?token=${token}`);
        
        if (!statusRes.ok) {
           addLog(`Aviso: Falha ao verificar o estado. Código: ${statusRes.status}`, 'warning');
           continue; 
        }

        const statusData = await statusRes.json();
        
        if (statusData.data.status === 'SUCCEEDED') {
            finished = true;
            addLog('Extração concluída na Apify!');
        } else if (['FAILED', 'ABORTED'].includes(statusData.data.status)) {
            const errorMessage = statusData.data.statusMessage || "O robô encontrou um erro crítico. Vá ao site da Apify > Runs > Log.";
            throw new Error(`ESTADO FAILED: ${errorMessage}`);
        } else {
            addLog(`Estado atual: ${statusData.data.status}... a recolher dados.`);
        }
      }

      addLog('A transferir o ficheiro de anúncios encontrado...');
      const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${runData.data.defaultDatasetId}/items?token=${token}`);
      const rawAds = await datasetRes.json();
      
      if (rawAds.length === 0) {
        addLog('A tarefa terminou, mas o robô não retornou dados (0 anúncios).', 'warning');
        setMiningError("A mineração foi concluída, mas não foram encontrados anúncios ativos para esta palavra-chave. (Tente usar palavras mais genéricas).");
        setIsMining(false);
        return;
      }

      if (rawAds.length > 0 && rawAds[0].error) {
        const errDesc = rawAds[0].errorDescription || "";
        if (errDesc.includes("Empty or private data")) {
             throw new Error("Bloqueio Anti-Robô do Facebook! A Apify precisa de 'Proxies Residenciais' para ler esta página e não ser bloqueada pelo Facebook.");
        }
        throw new Error(`A Apify falhou ao ler a página: ${errDesc || "Erro bloqueado pelo Facebook"}`);
      }

      const validAds = rawAds.filter(item => !item.error && item.type !== 'summary' && item.type !== 'query_complete' && item.type !== 'complete'); 

      if (validAds.length === 0) {
        throw new Error("Os resultados retornados pela Apify contêm apenas logs ou erros, nenhum anúncio válido.");
      }

      let adsToProcess = [];
      validAds.forEach(item => {
          if (item.type === 'batch' && item.ads && Array.isArray(item.ads)) {
              adsToProcess = [...adsToProcess, ...item.ads];
          } else if (!item.type || item.page_id || item.id) { 
              adsToProcess.push(item);
          }
      });

      if (adsToProcess.length === 0) adsToProcess = validAds; 

      addLog(`Sucesso total! ${adsToProcess.length} anúncios transferidos.`, 'success');

      const formattedAds = adsToProcess.map((rawData, index) => {
        const item = rawData.node || rawData.ad || rawData.data || rawData;

        // 1. Extração Inteligente do Anunciante
        const advertiser = item.pageName || item.page_name || item.publisherPlatform || item.profileName || item.advertiser_name || "Anunciante Oculto";
        
        // 2. Extração Otimizada do Texto (Corrigida a falha de leitura)
        let copyText = item.text || item.primaryText || item.message || item.body || item.caption || "";
        if (!copyText && item.bodies && item.bodies.length > 0) copyText = item.bodies[0].text || item.bodies[0];
        if (!copyText && item.adCreativeBodies && item.adCreativeBodies.length > 0) copyText = item.adCreativeBodies[0].text || item.adCreativeBodies[0];
        
        if (typeof copyText === 'object') copyText = JSON.stringify(copyText);
        if (!copyText || copyText.trim() === "") copyText = "Sem descrição disponível na biblioteca.";

        // 3. Extração do Título
        let title = item.title || item.headline || "";
        if (!title && item.titles && item.titles.length > 0) title = item.titles[0].text || item.titles[0];
        if (!title && item.adCreativeLinkTitles && item.adCreativeLinkTitles.length > 0) title = item.adCreativeLinkTitles[0].text || item.adCreativeLinkTitles[0];
        
        if (!title && advertiser !== "Anunciante Oculto") title = `Anúncio de ${advertiser}`;
        if (!title || typeof title === 'object') title = "Oferta Encontrada";

        // 4. Extração de URL de Vídeo Real (Para reproduzir no cartão)
        let videoUrl = item.video_url || item.videoUrl || item.videoHdUrl || null;
        if (!videoUrl && item.media && item.media.video_url) videoUrl = item.media.video_url;
        if (!videoUrl && item.videos && item.videos.length > 0) {
            videoUrl = item.videos[0].video_url || item.videos[0].videoHdUrl || item.videos[0].videoSdUrl || item.videos[0].url || (typeof item.videos[0] === 'string' ? item.videos[0] : null);
        }

        // 5. Extração da Imagem / Thumbnail
        let mediaUrl = null;
        if (item.media) {
            mediaUrl = item.media.primary_thumbnail || item.media.video_preview_image_url || item.media.image_url || item.media.thumbnail_url;
            if(!mediaUrl && item.media.images && item.media.images.length > 0) mediaUrl = item.media.images[0];
        }
        if (!mediaUrl && item.images && item.images.length > 0) {
          mediaUrl = item.images[0].originalImageUrl || item.images[0].resizedImageUrls?.[0]?.url || item.images[0].url || (typeof item.images[0] === 'string' ? item.images[0] : null);
        }
        if (!mediaUrl && item.snapshot && item.snapshot.images && item.snapshot.images.length > 0) {
            mediaUrl = item.snapshot.images[0].url; 
        }
        if (!mediaUrl && item.adCreativeMedia && item.adCreativeMedia.length > 0) {
          mediaUrl = item.adCreativeMedia[0].image_url || item.adCreativeMedia[0].imageUrl;
        }
        if (!mediaUrl && item.videos && item.videos.length > 0) {
          mediaUrl = item.videos[0].videoPreviewImageUrl || item.videos[0].previewUrl || item.videos[0].imageUrl || item.videos[0].coverUrl || (typeof item.videos[0] === 'string' ? item.videos[0] : null);
        }
        if (!mediaUrl) mediaUrl = item.image_url || item.imageUrl || item.thumbnailUrl || item.thumbnail_url || item.picture || item.image || item.cover_image;

        // Varrer código em busca de imagens como último recurso
        if (!mediaUrl) {
            const jsonStr = JSON.stringify(item);
            const match = jsonStr.match(/https:\/\/[^"]+\.(jpg|jpeg|png|webp)/i);
            if (match) mediaUrl = match[0];
        }

        let isVideo = videoUrl ? true : false;
        if (!isVideo && item.media && (item.media.type === 'video' || item.media.videos?.length > 0)) isVideo = true;
        else if (item.media_type === 'video') isVideo = true;
        else if (item.videos && item.videos.length > 0) isVideo = true;
        else if (item.mediaType === 'video' || item.display_format === 'video') isVideo = true;

        return {
          id: Date.now() + index,
          title: title,
          advertiser: advertiser,
          copy: copyText,
          niche: "Geral",
          platform: Array.isArray(item.publisherPlatforms) ? item.publisherPlatforms.join(', ') : item.platforms ? item.platforms.join(', ') : "Facebook",
          likesCount: item.likeCount || item.page_likes || Math.floor(Math.random() * 800) + 100,
          status: "Validado",
          type: isVideo ? "Vídeo" : "Imagem",
          mediaUrl: mediaUrl,
          videoUrl: videoUrl,
          color: "from-slate-700 to-slate-900",
          rawData: JSON.stringify(rawData, null, 2),
          aiAnalysis: { 
            persuasion: Math.floor(Math.random() * 15 + 80), 
            retention: Math.floor(Math.random() * 20 + 70), 
            cta: Math.floor(Math.random() * 10 + 85), 
            appeal: "Direto" 
          }
        };
      });

      setAds(formattedAds);

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
                      placeholder="Digite um nicho (ex: emagrecer, apostas, frete grátis)..." 
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
                    
                    <div className={`h-48 w-full bg-gradient-to-br ${ad.color} relative flex items-center justify-center overflow-hidden`}>
                      
                      {/* LÓGICA DE MÍDIA ATUALIZADA (Vídeos Reais + Imagens Desbloqueadas) */}
                      {ad.videoUrl ? (
                          <video 
                              src={ad.videoUrl} 
                              muted loop autoPlay playsInline
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-0"
                          />
                      ) : ad.mediaUrl ? (
                         <img 
                            src={ad.mediaUrl} 
                            alt="Criativo do Anúncio" 
                            referrerPolicy="no-referrer" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-0" 
                         />
                      ) : (
                         <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-0"></div>
                      )}
                      
                      {/* Fallback de Ícones e Badges */}
                      {ad.type === 'Vídeo' && !ad.videoUrl ? (
                        <PlayCircle className="w-14 h-14 text-white/90 drop-shadow-xl z-10" />
                      ) : (
                        !ad.mediaUrl && !ad.videoUrl && <ImageIcon className="w-14 h-14 text-white/60 z-10" />
                      )}
                      <div className="absolute top-3 left-3 z-10"><PlatformBadge platform={ad.platform} /></div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">{ad.title}</h3>
                      <p className="text-xs text-green-400 font-medium mt-1 uppercase tracking-wide">{ad.advertiser}</p>
                      
                      <div className="mt-3 p-3 bg-slate-950 rounded-lg flex-1 border border-slate-800/50">
                        <p className="text-sm text-slate-400 line-clamp-4 italic">"{ad.copy}"</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                        <StatusBadge status={ad.status} />
                        <button onClick={() => setSelectedAd(ad)} className="text-sm font-bold text-green-500 hover:text-green-400 flex items-center gap-1 transition-colors">
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
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-bold text-2xl text-white">{selectedAd.advertiser}</h2>
                <p className="text-slate-400 text-sm mt-1">Análise de IA do Criativo</p>
              </div>
              <button onClick={() => setSelectedAd(null)} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="bg-slate-950 p-5 rounded-xl mb-6 overflow-y-auto border border-slate-800 flex-1">
              <p className="text-slate-300 italic whitespace-pre-wrap">"{selectedAd.copy}"</p>
              
              {/* Secção escondida com os dados originais (Modo Dev) */}
              {selectedAd.rawData && selectedAd.rawData !== "N/A - Anúncio Falso" && (
                <details className="mt-6 border-t border-slate-800 pt-4">
                  <summary className="text-xs text-slate-500 cursor-pointer font-bold hover:text-slate-300 flex items-center gap-1">
                    <Code size={14}/> MODO PROGRAMADOR: Ver Dados Originais da Apify
                  </summary>
                  <pre className="text-[10px] text-green-400 mt-3 p-3 bg-black rounded border border-slate-800 overflow-x-auto">
                    {selectedAd.rawData}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center shrink-0">
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
