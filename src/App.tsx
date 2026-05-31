// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  Settings, Zap, Target, Crosshair, Loader2, Lock, ArrowRight,
  LayoutDashboard, PlayCircle, Image as ImageIcon, BarChart2, X, Terminal,
  AlertCircle, Code, ExternalLink, Calendar, ThumbsUp, Layers, Sparkles, Bot,
  Heart, Filter, Video, Bookmark, DollarSign, Clock, CheckCircle, Flame, Library,
  ArrowUpDown, ShieldAlert, SplitSquareHorizontal, Rocket, Trophy, PenTool, Copy,
  Search, RefreshCw, LayoutTemplate, ArrowRightLeft, MonitorPlay, Check, HelpCircle, Upload,
  Mic, Play, Pause, VolumeX, Volume2, Type, FileAudio, Download, Wand2, FileText
} from 'lucide-react';

// ============================================================================
// UTILITÁRIOS PARA ÁUDIO E IA
// ============================================================================

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function pcmToWav(pcm16, sampleRate) {
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const buffer = new ArrayBuffer(44 + pcm16.byteLength);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcm16.byteLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, pcm16.byteLength, true);

  let offset = 44;
  for (let i = 0; i < pcm16.length; i++, offset += 2) {
    view.setInt16(offset, pcm16[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

// ============================================================================
// COMPONENTES DAS PÁGINAS
// ============================================================================

function SettingsPage({ 
  apifyToken, setApifyToken, actorId, setActorId, 
  aiProvider, setAiProvider, geminiToken, setGeminiToken, 
  chatGptToken, setChatGptToken, handleSaveSettings 
}) {
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
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2"><Sparkles className="text-indigo-500"/> Cérebro IA (Análise e Geração)</h3>
            <select value={aiProvider} onChange={e => setAiProvider(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none mb-4">
                <option value="chatgpt">ChatGPT / OpenAI (GPT-4o Vision)</option>
                <option value="gemini">Google Gemini (Gemini 1.5 Pro)</option>
            </select>
            <label className="block text-sm font-bold text-slate-400 mb-2 mt-4">Chave de API do ChatGPT (Recomendada para Transcrição Whisper)</label>
            <input type="password" value={chatGptToken} onChange={e => setChatGptToken(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none mb-2" />
            <label className="block text-sm font-bold text-slate-400 mb-2 mt-4">Chave de API do Google Gemini (Obrigatória para Vozes e Dublagem)</label>
            <input type="password" value={geminiToken} onChange={e => setGeminiToken(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none mb-2" />
          </div>

          <button onClick={handleSaveSettings} className="bg-green-600 w-full hover:bg-green-500 px-8 py-4 rounded-xl text-white font-bold transition-colors">Guardar Configurações</button>
        </div>
    </div>
  );
}

// ============================================================================
// GERADOR DE CRIATIVOS E ESTÚDIO DE VÍDEO IA
// ============================================================================
function GeneratorPage() {
  const [step, setStep] = useState(1);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoBase64, setVideoBase64] = useState('');
  const [videoMime, setVideoMime] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [originalScript, setOriginalScript] = useState('');
  const [strategy, setStrategy] = useState('rewrite_same');
  const [newScript, setNewScript] = useState('');

  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState('');
  
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // NOVO: Estados para Legendas Dinâmicas (TikTok Style)
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [subtitlePos, setSubtitlePosition] = useState('bottom'); // top, middle, bottom
  const subtitleChunksRef = useRef([]);

  // Vozes disponíveis no Gemini TTS
  const voices = [
    { id: 'Puck', name: 'Puck (Animado/Upbeat)', icon: '🎉' },
    { id: 'Zephyr', name: 'Zephyr (Brilhante)', icon: '✨' },
    { id: 'Charon', name: 'Charon (Informativo)', icon: '📊' },
    { id: 'Kore', name: 'Kore (Firme/Confiante)', icon: '🎯' },
    { id: 'Fenrir', name: 'Fenrir (Empolgado)', icon: '🔥' },
    { id: 'Aoede', name: 'Aoede (Tranquilo/Suave)', icon: '🍃' }
  ];

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg("Para o processamento no navegador, o vídeo deve ter menos de 25MB.");
        return;
      }
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setVideoMime(file.type);
      setErrorMsg('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoBase64(reader.result.split(',')[1]);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const transcribeVideo = async () => {
    const geminiToken = localStorage.getItem('adsniper_gemini_token');
    const gptToken = localStorage.getItem('adsniper_gpt_token');

    if (!geminiToken && !gptToken) {
      setErrorMsg("É obrigatório configurar a Chave de API da OpenAI (recomendado) ou da Google Gemini nas Configurações para realizar a transcrição.");
      return;
    }

    setIsProcessing(true);
    setStatusMsg("A extrair áudio e a transcrever...");
    setErrorMsg('');

    try {
      // PREFERÊNCIA 1: Usar OpenAI Whisper se a chave estiver disponível
      // Motivo: Suporta upload de arquivo nativo (FormData), aceita até 25MB fácil, não dá erro de payload.
      if (gptToken) {
        setStatusMsg("A transcrever usando Inteligência Artificial Whisper (OpenAI)...");
        const formData = new FormData();
        formData.append("file", videoFile);
        formData.append("model", "whisper-1");
        formData.append("response_format", "text"); // Retorna apenas o texto puro

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${gptToken}` },
          body: formData
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(`Erro OpenAI Whisper: ${err.error?.message || response.statusText}`);
        }
        
        const text = await response.text();
        setOriginalScript(text.trim());
        setNewScript(text.trim());
        setIsProcessing(false);
        return;
      }

      // PREFERÊNCIA 2: Fallback para Google Gemini (via Base64 - Limite de tamanho crítico)
      if (geminiToken) {
        if (videoFile.size > 6 * 1024 * 1024) {
           throw new Error("O seu vídeo é muito pesado para ser transcrito pela Gemini no navegador (Limitação de Base64). Por favor, adicione a chave da OpenAI (ChatGPT) nas Configurações para usar o Whisper, que suporta vídeos até 25MB.");
        }

        setStatusMsg("A transcrever usando Inteligência Artificial Google Gemini...");
        const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiToken}`;
        
        const parts = [
          { text: "Transcreva o áudio deste vídeo com precisão. Retorne APENAS o texto falado, sem marcações ou comentários adicionais." },
          { inlineData: { mimeType: videoMime, data: videoBase64 } }
        ];

        const response = await fetch(endpointUrl, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: parts }] })
        });
        
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("Gemini Error:", errData);
            throw new Error(`Falha Gemini: ${errData.error?.message || "O ficheiro é demasiado grande ou o formato não é suportado."}`);
        }
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Nenhuma fala detectada.";
        
        setOriginalScript(text.trim());
        setNewScript(text.trim());
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateNewCopy = async () => {
    const provider = localStorage.getItem('adsniper_ai_provider') || 'chatgpt';
    const geminiToken = localStorage.getItem('adsniper_gemini_token');
    const chatGptToken = localStorage.getItem('adsniper_gpt_token');

    setIsProcessing(true);
    setStatusMsg("Reescrevendo o script com técnicas de alta conversão...");
    setErrorMsg('');

    let prompt = "";
    if (strategy === 'rewrite_same') {
      prompt = `Atue como um Copywriter de Elite. Vou te enviar a transcrição de um vídeo de vendas/anúncio. Sua tarefa é reescrever o texto mantendo EXATAMENTE a mesma ideia, promessa e duração aproximada, mas tornando o texto mais persuasivo, natural e com melhor retenção (Hook melhorado). Retorne APENAS o novo texto corrido. Transcrição: "${originalScript}"`;
    } else {
      prompt = `Atue como um Copywriter de Elite. Vou te enviar a transcrição de um anúncio. Quero que você crie um ÂNGULO TOTALMENTE NOVO para vender o mesmo produto. Mude o "Hook" (gancho inicial) para algo mais agressivo ou curioso. Foque na dor do cliente. Retorne APENAS o novo script corrido, pronto para ser falado no vídeo. Transcrição original: "${originalScript}"`;
    }

    try {
      let resultText = "";
      if (provider === 'chatgpt') {
        if (!chatGptToken) throw new Error("Token ChatGPT ausente. Vá às configurações.");
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${chatGptToken}` },
            body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        resultText = data.choices[0].message.content;
      } else {
        if (!geminiToken) throw new Error("Token Gemini ausente. Vá às configurações.");
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiToken}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      }
      setNewScript(resultText.trim().replace(/\*/g, ''));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateTTSAudio = async () => {
    if (!newScript.trim()) {
      setErrorMsg("O script não pode estar vazio.");
      return;
    }

    const geminiToken = localStorage.getItem('adsniper_gemini_token');
    if (!geminiToken) {
      setErrorMsg("A chave da API do Google Gemini é OBRIGATÓRIA nas Configurações para gerar as vozes ultrarrealistas.");
      return;
    }

    setIsProcessing(true);
    setStatusMsg("Gerando narração humana ultrarrealista...");
    setErrorMsg('');
    setGeneratedAudioUrl('');
    setIsPlaying(false);

    try {
      const payload = {
        contents: [{ parts: [{ text: newScript }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } }
            }
        },
        model: "gemini-2.5-flash-preview-tts"
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${geminiToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(()=>({}));
        throw new Error(`Falha na geração de áudio: ${errData.error?.message || response.statusText}`);
      }
      
      const result = await response.json();
      const part = result?.candidates?.[0]?.content?.parts?.[0];
      const audioData = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType;

      if (audioData && mimeType && mimeType.startsWith("audio/")) {
          const sampleRateMatch = mimeType.match(/rate=(\d+)/);
          const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
          
          const pcmData = base64ToArrayBuffer(audioData);
          const pcm16 = new Int16Array(pcmData);
          const wavBlob = pcmToWav(pcm16, sampleRate);
          const audioUrl = URL.createObjectURL(wavBlob);
          
          const words = newScript.split(/\s+/);
          const chunks = [];
          for (let i = 0; i < words.length; i += 3) {
             chunks.push(words.slice(i, i + 3).join(' '));
          }
          subtitleChunksRef.current = chunks;
          
          setGeneratedAudioUrl(audioUrl);
          setStep(3); // Avança para o Preview
      } else {
          throw new Error("A IA não retornou um formato de áudio válido.");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      videoRef.current?.pause();
      audioRef.current?.pause();
    } else {
      // Reinicia do zero se tiver acabado
      if (audioRef.current?.ended) {
        if(videoRef.current) videoRef.current.currentTime = 0;
        if(audioRef.current) audioRef.current.currentTime = 0;
      }
      videoRef.current?.play();
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Sincroniza estado de play/pause se o áudio acabar
  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      const handleEnded = () => { setIsPlaying(false); videoRef.current?.pause(); };
      audioEl.addEventListener('ended', handleEnded);
      return () => audioEl.removeEventListener('ended', handleEnded);
    }
  }, [generatedAudioUrl]);

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current || isNaN(audioRef.current.duration)) return;
    const progress = audioRef.current.currentTime / audioRef.current.duration;
    const total = subtitleChunksRef.current.length;
    if (total === 0) return;
    
    let idx = Math.floor(progress * total);
    if (idx >= total) idx = total - 1; // Proteção de limite
    setCurrentSubtitle(subtitleChunksRef.current[idx]);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 h-full flex flex-col overflow-y-auto">
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          <Wand2 className="w-7 h-7 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Estúdio de <span className="text-indigo-500">Criativos IA</span></h2>
          <p className="text-slate-400 mt-1">Reescreva, reduble e crie novos anúncios a partir dos seus vídeos vencedores.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-4 shrink-0">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <p className="text-slate-300 text-sm leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Importar Anúncio Base</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Faça o upload do vídeo que você deseja modelar. A IA vai transcrever o roteiro original automaticamente.
            </p>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-2xl p-10 transition-all bg-slate-950 cursor-pointer group">
              <input type="file" accept="video/mp4,video/webm,video/mov" onChange={handleVideoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <Upload className="w-10 h-10 text-slate-600 group-hover:text-indigo-400 mx-auto mb-3 transition-colors" />
              <span className="font-bold text-slate-300 group-hover:text-white transition-colors">Selecionar Vídeo</span>
              <p className="text-xs text-slate-500 mt-2">MP4 ou WebM</p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 & 3: TRANSCRIÇÃO, COPY E PREVIEW */}
      {step >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          
          {/* PAINEL ESQUERDO: LÓGICA E TEXTOS */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Bloco de Transcrição */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-300 flex items-center gap-2">
                  <FileText size={18} className="text-emerald-500" /> Script Original (Transcrição)
                </h3>
                {!originalScript && (
                  <button onClick={transcribeVideo} disabled={isProcessing} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
                    {isProcessing && !originalScript ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />} Extrair Script
                  </button>
                )}
              </div>
              
              <textarea 
                className="w-full h-32 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-4 text-slate-400 text-sm outline-none resize-none transition-colors"
                placeholder={isProcessing && !originalScript ? "Ouvindo o vídeo e escrevendo..." : "O script original do vídeo aparecerá aqui..."}
                value={originalScript}
                onChange={(e) => setOriginalScript(e.target.value)}
                readOnly={isProcessing && !originalScript}
              ></textarea>
            </div>

            {/* Bloco de Copywriting */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-300 flex items-center gap-2">
                  <Wand2 size={18} className="text-indigo-500" /> Nova Copy Estratégica
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <select value={strategy} onChange={e => setStrategy(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-medium text-slate-300 outline-none">
                  <option value="rewrite_same">Melhorar persuasão (Manter ideia principal)</option>
                  <option value="new_angles">Criar novos ângulos (Nova dor/Hook)</option>
                </select>
                <button onClick={generateNewCopy} disabled={isProcessing || !originalScript} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  {isProcessing && statusMsg.includes("Reescrevendo") ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} 
                  Reescrever IA
                </button>
              </div>

              <textarea 
                className="w-full h-40 bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl p-4 text-white font-medium text-sm outline-none resize-none transition-colors leading-relaxed"
                placeholder="A nova variação do roteiro aparecerá aqui. Você pode editar manualmente."
                value={newScript}
                onChange={(e) => setNewScript(e.target.value)}
              ></textarea>
            </div>

            {/* Bloco de Voz e Áudio */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-slate-300 flex items-center gap-2 mb-4">
                <FileAudio size={18} className="text-fuchsia-500" /> Voz e Redublagem
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {voices.map(v => (
                  <div key={v.id} onClick={() => setSelectedVoice(v.id)} className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${selectedVoice === v.id ? 'bg-fuchsia-500/10 border-fuchsia-500/50 text-fuchsia-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                    <span className="text-xl mb-1">{v.icon}</span>
                    <span className="text-xs font-bold text-center">{v.name}</span>
                  </div>
                ))}
              </div>
              <button onClick={generateTTSAudio} disabled={isProcessing || !newScript} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                {isProcessing && statusMsg.includes("Gerando") ? <><Loader2 className="w-5 h-5 animate-spin" /> Processando Áudio...</> : <><Mic className="w-5 h-5" /> Gerar Narração do Vídeo</>}
              </button>
            </div>

          </div>

          {/* PAINEL DIREITO: PREVIEW DO VÍDEO (ESTÚDIO) */}
          <div className="lg:col-span-5 flex flex-col">
             <div className="sticky top-8 bg-slate-900 border border-slate-800 rounded-3xl p-2 shadow-2xl flex flex-col overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/50">
                  <span className="font-bold text-white text-sm flex items-center gap-2"><PlayCircle size={16} className="text-indigo-400"/> Player de Preview</span>
                  {step === 3 && (
                    <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shadow-inner">
                      {['top', 'middle', 'bottom'].map(pos => (
                         <button 
                           key={pos} 
                           onClick={() => setSubtitlePosition(pos)} 
                           title={`Mover legenda para ${pos === 'top' ? 'o topo' : pos === 'middle' ? 'o meio' : 'o fundo'}`}
                           className={`px-2.5 py-1 rounded text-[9px] uppercase font-bold transition-colors ${subtitlePos === pos ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                         >
                           {pos === 'top' ? 'Topo' : pos === 'middle' ? 'Meio' : 'Fundo'}
                         </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden mx-auto w-full max-w-[320px] shadow-inner mt-4 group">
                  {/* VÍDEO ORIGINAL MUTADO */}
                  <video 
                    ref={videoRef} 
                    src={videoUrl} 
                    muted 
                    playsInline 
                    loop
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* ÁUDIO GERADO PELA IA */}
                  {generatedAudioUrl && <audio ref={audioRef} src={generatedAudioUrl} onTimeUpdate={handleAudioTimeUpdate} />}

                  {/* OVERLAY DE LEGENDAS DINÂMICAS TIKTOK STYLE */}
                  {step === 3 && isPlaying && currentSubtitle && (
                    <div className={`absolute inset-x-0 p-4 flex justify-center pointer-events-none transition-all duration-75 z-20 ${
                       subtitlePos === 'top' ? 'top-16' : 
                       subtitlePos === 'middle' ? 'top-1/2 -translate-y-1/2' : 
                       'bottom-24'
                    }`}>
                       {/* O backdrop-blur esconde a legenda antiga, o texto saltado atrai atenção */}
                       <div className="bg-black/40 backdrop-blur-[6px] px-5 py-2.5 rounded-2xl border border-white/10 text-center shadow-[0_0_20px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform max-w-[95%]">
                          <p className="text-yellow-400 font-black text-2xl md:text-3xl uppercase tracking-wider leading-tight" 
                             style={{ 
                               textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 5px 15px rgba(0,0,0,0.8)', 
                               fontFamily: 'Impact, system-ui, sans-serif' 
                             }}>
                            {currentSubtitle}
                          </p>
                       </div>
                    </div>
                  )}

                  {/* OVERLAY DE ESTADO INICIAL/PAUSADO */}
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                      {step < 3 ? (
                        <div className="text-center p-6">
                           <LayoutTemplate className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                           <p className="text-sm font-bold text-slate-400">Preview Indisponível</p>
                           <p className="text-xs text-slate-500 mt-1">Gere a narração para ativar.</p>
                        </div>
                      ) : (
                        <button onClick={togglePlayback} className="w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-transform hover:scale-110 border border-white/30">
                          <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* CONTROLES DO PLAYER (Aparecem no hover se estiver tocando) */}
                  {step === 3 && isPlaying && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={togglePlayback} className="text-white hover:text-indigo-400 transition-colors">
                          <Pause size={20} fill="currentColor" />
                       </button>
                       <div className="w-px h-4 bg-white/20"></div>
                       <Volume2 size={18} className="text-white/70" />
                    </div>
                  )}
                </div>

                {/* BOTÕES DE EXPORTAÇÃO */}
                {step === 3 && (
                  <div className="mt-6 p-4">
                    <p className="text-[10px] text-slate-500 text-center mb-3">O preview sincroniza o áudio gerado com o vídeo no navegador. Para exportar, baixe o áudio e junte no seu editor (ex: CapCut).</p>
                    <a href={generatedAudioUrl} download="AdSniper_Voz_IA.wav" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700">
                      <Download size={16} /> Baixar Áudio (.wav)
                    </a>
                    <button onClick={() => { setStep(1); setVideoFile(null); setGeneratedAudioUrl(''); setOriginalScript(''); setNewScript(''); }} className="w-full mt-2 text-slate-500 hover:text-white text-xs font-bold py-2 transition-colors">
                      Criar Novo Vídeo
                    </button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTES DE DESIGN ---
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
      {Icon && <Icon size={12} />}
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
    <span className="bg-slate-800/80 text-white text-xs px-2 py-1 rounded border border-slate-700/50 backdrop-blur-sm shadow-lg font-bold">
      {text || "FACEBOOK"}
    </span>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
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
      try { setSavedAds(JSON.parse(savedVault)); } catch (e) { setSavedAds([]); }
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

      setMiningProgress(95); setMiningStatusMsg('Motor V3: A aplicar Rankeamento por Anunciante...');

      const getBaseDomain = (url) => {
        if (!url || url.includes('facebook.com') || url.includes('fb.me') || url.includes('instagram.com')) return 'no-link';
        try { return new URL(url).hostname.replace('www.', ''); } catch (e) { return 'no-link'; }
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
          if (typeof copyText === 'object') { try { copyText = JSON.stringify(copyText); } catch (e) { copyText = ""; } }
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
          if (copyLower.includes('curso') || copyLower.includes('aula') || copyLower.includes('aprender') || copyLower.includes('método') || copyLower.includes('concurso')) niche = "Educação";
          else if (copyLower.includes('emagrecer') || copyLower.includes('pele') || copyLower.includes('cabelo') || copyLower.includes('dores')) niche = "Saúde/Beleza";
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
              if (isNaN(daysActive)) daysActive = 1;
            } catch (e) { daysActive = 1; }
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
          try { safeRawData = JSON.stringify(rawData, null, 2); } catch (e) { safeRawData = "Omitido por segurança."; }

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
        const recentAdsCount = ad.allDates ? ad.allDates.filter(d => d <= 7).length : 0;
        ad.isAggressiveScale = recentAdsCount >= 3 && ad.adCount >= 5;
        ad.isABTesting = ad.allCopies && ad.allCopies.size > 1 && ad.adCount >= 2;
        ad.isCreativeKing = ad.daysActive > 30 && ad.adCount >= 10;
        ad.isBlackHat = ['linktr.ee', 'bit.ly', 'shorturl', 'hotm.art', 'go.hotmart', 'monetizze', 'kiwify.com', 'perfectpay'].some(d => ad.targetUrl.toLowerCase().includes(d)) || (getBaseDomain(ad.targetUrl).length > 25);

        const adScoreCalc = Math.min((ad.adCount / 30) * 50, 50);
        const daysScoreCalc = Math.min((ad.daysActive / 60) * 30, 30);
        const platformScoreCalc = Math.min((ad.platformCount / 4) * 20, 20);

        let totalScore = Math.round(adScoreCalc + daysScoreCalc + platformScoreCalc);
        if (ad.isAggressiveScale) totalScore = Math.min(totalScore + 10, 100);
        if (ad.isCreativeKing) totalScore = Math.min(totalScore + 15, 100);

        ad.score = totalScore || 0;
        ad.status = StatusToText(totalScore || 0);
        return ad;
      });

      setAds(formattedAds.sort((a, b) => (b.score || 0) - (a.score || 0)));
      setMiningProgress(100); setMiningStatusMsg('Radar Concluído com Sucesso!');
    } catch (error) {
      let displayError = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      setMiningError(displayError); addLog(`ERRO: ${displayError}`, 'error');
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <h1 className="text-3xl font-black text-white text-center mb-8 tracking-tight">Ad<span className="text-green-500">Sniper</span></h1>
          <form onSubmit={(e) => { e.preventDefault(); if (passwordInput === 'sniper2026') setIsAuthenticated(true); else setLoginError(true); }} className="space-y-4">
            <input type="password" placeholder="Chave de Acesso" className="w-full bg-slate-950 border border-slate-800 focus:border-green-500 text-white rounded-lg px-4 py-3 outline-none" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
            {loginError && <p className="text-red-500 text-sm font-bold">Senha incorreta.</p>}
            <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Target className="text-green-500" /> Ad<span className="text-slate-400">Sniper</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          <p className="text-xs font-bold text-slate-500 mb-2 px-3 uppercase tracking-wider">Descoberta</p>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'dashboard' ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <LayoutDashboard className="w-5 h-5" /> Radar de Ofertas
          </button>

          <button onClick={() => setActiveTab('vault')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'vault' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <Bookmark className="w-5 h-5" /> Meu Cofre <span className="ml-auto bg-indigo-500/20 text-indigo-300 text-xs py-0.5 px-2 rounded-full">{savedAds.length}</span>
          </button>

          <p className="text-xs font-bold text-slate-500 mb-2 mt-6 px-3 uppercase tracking-wider">Criação</p>
          
          <button onClick={() => setActiveTab('generator')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'generator' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-800 text-slate-400'}`}>
            <PenTool className="w-5 h-5" /> Estúdio de Criativos
          </button>

          <div className="mt-auto pt-6">
            <button onClick={() => setActiveTab('settings')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-slate-800 text-white border border-slate-700' : 'hover:bg-slate-800 text-slate-400'}`}>
              <Settings className="w-5 h-5" /> Configurações
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto relative" onScroll={handleScroll}>

        {activeTab === 'generator' && <GeneratorPage />}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto p-4 md:p-8 w-full">
            <SettingsPage 
              apifyToken={apifyToken} 
              setApifyToken={setApifyToken}
              actorId={actorId} 
              setActorId={setActorId}
              aiProvider={aiProvider} 
              setAiProvider={setAiProvider}
              geminiToken={geminiToken} 
              setGeminiToken={setGeminiToken}
              chatGptToken={chatGptToken} 
              setChatGptToken={setChatGptToken}
              handleSaveSettings={handleSaveSettings}
            />
          </div>
        )}

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
                  {isMining ? <><Loader2 className="animate-spin w-5 h-5" /> Procurar...</> : 'Iniciar Radar'}
                </button>
              </div>
            )}

            {isMining && (
              <div className="mb-6 p-5 bg-slate-900/80 border border-green-500/20 rounded-xl shadow-lg">
                <div className="flex justify-between items-center text-sm mb-3 font-bold">
                  <span className="text-green-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {miningStatusMsg}</span>
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
                  <Filter className="w-4 h-4" /> Filtros:
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
                  <ArrowUpDown className="w-4 h-4 text-indigo-400" />
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
                    ) : (<ImageIcon className="text-slate-800 w-12 h-12" />)}

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
                      <div className="flex items-center gap-1.5"><Clock size={12} /> há poucos segundos</div>
                      {ad.libraryUrl && (
                        <button onClick={(e) => { e.stopPropagation(); window.open(ad.libraryUrl, '_blank'); }} className="hover:text-white flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded">
                          <Library size={12} /> <span className="hidden sm:inline">Biblioteca</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleAdsCount < allDisplayedAds.length && (
              <div className="w-full flex justify-center items-center py-10 opacity-50">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              </div>
            )}
          </div>
        )}

      </main>

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
                <h3 className="font-bold text-slate-400 uppercase text-xs mb-3 flex items-center gap-2"><ImageIcon size={14} /> Copy do Anúncio</h3>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedAd.copy}
                </div>
              </div>

              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-5 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="font-bold text-indigo-400 flex items-center gap-2">
                    {aiProvider === 'chatgpt' ? <Bot size={18} /> : <Sparkles size={18} />} Inteligência Artificial
                  </h3>
                  {!isAnalyzing && (
                    <div className="flex gap-2">
                      <button onClick={() => analyzeAdWithAI(selectedAd, 'copy')} className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 px-3 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5">
                        <Sparkles size={14} /> Otimizar Copy
                      </button>
                      <button onClick={() => analyzeAdWithAI(selectedAd, 'script')} className="bg-fuchsia-600/20 hover:bg-fuchsia-600 text-fuchsia-300 hover:text-white border border-fuchsia-500/30 px-3 py-1.5 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5">
                        <Video size={14} /> Guião VSL
                      </button>
                    </div>
                  )}
                </div>

                {isAnalyzing && (
                  <div className="py-8 flex flex-col items-center justify-center text-indigo-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-3" />
                    <p className="font-medium text-sm text-center">
                      {aiAnalysisType === 'script' ? 'A fazer engenharia reversa para criar o Guião do Vídeo...' : 'A dissecar e otimizar esta Copy para Alta Conversão...'}
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
