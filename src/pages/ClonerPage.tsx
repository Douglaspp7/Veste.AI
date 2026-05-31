// @ts-nocheck
import React, { useState } from 'react';
import { 
  Copy, Loader2, Sparkles, Search, RefreshCw, 
  LayoutTemplate, ArrowRightLeft, AlertCircle, CheckCircle2 
} from 'lucide-react';

export default function ClonerPage() {
  const [competitorCopy, setCompetitorCopy] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showProductInput, setShowProductInput] = useState(false);

  // Função interna para chamar a IA (mantém o componente 100% isolado do App.tsx)
  const callAI = async (prompt) => {
    const provider = localStorage.getItem('adsniper_ai_provider') || 'chatgpt';
    const geminiToken = localStorage.getItem('adsniper_gemini_token');
    const chatGptToken = localStorage.getItem('adsniper_gpt_token');

    if (provider === 'gemini' && !geminiToken) {
      throw new Error("Chave da API do Google Gemini não encontrada. Vá à aba Configurações.");
    }
    if (provider === 'chatgpt' && !chatGptToken) {
      throw new Error("Chave da API da OpenAI (ChatGPT) não encontrada. Vá à aba Configurações.");
    }

    if (provider === 'chatgpt') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${chatGptToken}` },
          body: JSON.stringify({
              model: 'gpt-4o-mini', 
              messages: [
                  { role: 'system', content: 'Você é um Engenheiro de Funis e Copywriter de Elite. Seja direto, agressivo em vendas e extremamente focado em conversão.' },
                  { role: 'user', content: prompt }
              ],
              temperature: 0.7
          })
      });
      if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          if (response.status === 429 || err.error?.type === 'insufficient_quota') throw new Error("Saldo esgotado na OpenAI (ChatGPT).");
          throw new Error(err.error?.message || "Erro de ligação à OpenAI");
      }
      const data = await response.json();
      return data.choices[0].message.content;
    } 
    
    // Se for Gemini
    if (provider === 'gemini') {
      const model = "gemini-1.5-flash";
      const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiToken}`;
      const response = await fetch(endpointUrl, {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Erro na Google Gemini`);
      }
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Resposta vazia da IA.";
    }
  };

  const handleAction = async (actionType) => {
    if (!competitorCopy.trim()) {
      setErrorMsg("Por favor, cole a copy da página do seu concorrente primeiro.");
      return;
    }

    if (actionType === 'adapt' && !newProductName.trim()) {
      setShowProductInput(true);
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);
    setActiveAction(actionType);
    setAiResult('');

    let prompt = '';

    switch (actionType) {
      case 'analyze':
        prompt = `Atue como um Especialista em CRO (Otimização de Conversão) e Copywriting. Analise a copy desta página de vendas concorrente. 
        Destaque de forma clara: 
        1. O que está forte nesta copy (Gatilhos bem usados). 
        2. Falhas e oportunidades de melhoria. 
        3. Sugestões de novos gatilhos mentais para EU usar e ganhar deles. 
        Copy do Concorrente: "${competitorCopy}"`;
        break;
      
      case 'spin':
        prompt = `Atue como um Copywriter de Elite. Reescreva a seguinte copy de vendas para ser 100% original (anti-plágio) aos olhos do Google e Facebook, mas mantenha a mesma força persuasiva, estrutura de promessa e gatilhos mentais. Faça um 'Spin' inteligente. 
        Copy Original: "${competitorCopy}"`;
        break;

      case 'wireframe':
        prompt = `Atue como um Web Designer de Alta Conversão. Leia esta copy e crie um 'Esqueleto' (Wireframe) detalhado de como a página deve ser montada no WordPress/Elementor. 
        Liste os blocos em ordem lógica de vendas. (ex: Bloco 1: Headline e Vídeo com Fundo escuro. Bloco 2: Benefícios em 3 colunas...). 
        Copy base: "${competitorCopy}"`;
        break;

      case 'adapt':
        prompt = `Atue como um Copywriter Mestre. Eu quero "roubar" a estrutura de persuasão desta página de vendas concorrente, mas adaptar para o meu NOVO produto chamado '${newProductName}'. 
        Reescreva a copy inteira focando nos benefícios do meu produto, mas mantendo o tom agressivo de vendas e a arquitetura da página original. 
        Copy do Concorrente: "${competitorCopy}"`;
        break;

      default:
        break;
    }

    try {
      const result = await callAI(prompt);
      setAiResult(result);
      if (actionType === 'adapt') setShowProductInput(false);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsProcessing(false);
      setActiveAction('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 h-full flex flex-col">
      
      {/* Header do Módulo */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.15)]">
          <Copy className="w-7 h-7 text-fuchsia-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Engenheiro de Funis <span className="text-fuchsia-500">IA</span></h2>
          <p className="text-slate-400 mt-1">Esmague a concorrência modelando as páginas de maior conversão do mercado.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <p className="text-slate-300 text-sm leading-relaxed">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-[600px]">
        
        {/* COLUNA ESQUERDA: INPUT E AÇÕES */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex-1 flex flex-col">
            <label className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Code size={16} /> 1. Cole a Copy do Concorrente
            </label>
            <textarea 
              className="w-full flex-1 bg-slate-950 border border-slate-800 focus:border-fuchsia-500/50 rounded-xl p-4 text-slate-300 text-sm outline-none resize-none transition-colors shadow-inner"
              placeholder="Vá à página de vendas que está a escalar, pressione Ctrl+A, Ctrl+C e cole todo o texto aqui..."
              value={competitorCopy}
              onChange={(e) => setCompetitorCopy(e.target.value)}
            ></textarea>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-fuchsia-400" /> 2. Escolha o que a IA deve fazer
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => handleAction('analyze')}
                disabled={isProcessing}
                className="bg-slate-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 hover:border-indigo-500/50 border border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 group"
              >
                {isProcessing && activeAction === 'analyze' ? <Loader2 className="w-6 h-6 animate-spin text-indigo-400" /> : <Search className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 transition-colors" />}
                <span className="font-bold text-sm">Analisar & Melhorar</span>
              </button>

              <button 
                onClick={() => handleAction('spin')}
                disabled={isProcessing}
                className="bg-slate-800 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/50 border border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 group"
              >
                {isProcessing && activeAction === 'spin' ? <Loader2 className="w-6 h-6 animate-spin text-emerald-400" /> : <RefreshCw className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-colors" />}
                <span className="font-bold text-sm">Spin Anti-Plágio</span>
              </button>

              <button 
                onClick={() => handleAction('wireframe')}
                disabled={isProcessing}
                className="bg-slate-800 hover:bg-amber-600/20 text-slate-300 hover:text-amber-300 hover:border-amber-500/50 border border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 group"
              >
                {isProcessing && activeAction === 'wireframe' ? <Loader2 className="w-6 h-6 animate-spin text-amber-400" /> : <LayoutTemplate className="w-6 h-6 text-slate-500 group-hover:text-amber-400 transition-colors" />}
                <span className="font-bold text-sm text-center">Extrair Wireframe</span>
              </button>

              <button 
                onClick={() => handleAction('adapt')}
                disabled={isProcessing}
                className="bg-slate-800 hover:bg-fuchsia-600/20 text-slate-300 hover:text-fuchsia-300 hover:border-fuchsia-500/50 border border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 group"
              >
                {isProcessing && activeAction === 'adapt' ? <Loader2 className="w-6 h-6 animate-spin text-fuchsia-400" /> : <ArrowRightLeft className="w-6 h-6 text-slate-500 group-hover:text-fuchsia-400 transition-colors" />}
                <span className="font-bold text-sm text-center">Adaptar Produto</span>
              </button>
            </div>

            {/* Input Extra que aparece se o utilizador clicar em Adaptar Produto */}
            {showProductInput && !isProcessing && (
              <div className="mt-4 p-4 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl animate-in fade-in zoom-in duration-200">
                <label className="block text-xs font-bold text-fuchsia-300 mb-2 uppercase tracking-wider">Nome do Seu Produto</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ex: Sérum Capilar X..." 
                    className="flex-1 bg-slate-950 border border-fuchsia-500/30 rounded-lg px-3 py-2 text-white outline-none focus:border-fuchsia-500"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                  />
                  <button 
                    onClick={() => handleAction('adapt')}
                    className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    Gerar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: RESULTADO DA IA */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
               <Bot className="text-fuchsia-500" /> Resultado da Engenharia
             </h3>
             {aiResult && (
               <button 
                 onClick={() => { navigator.clipboard.writeText(aiResult); }}
                 className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
               >
                 <Copy size={14} /> Copiar Resultado
               </button>
             )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isProcessing ? (
               <div className="h-full flex flex-col items-center justify-center text-fuchsia-400/80 animate-pulse">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p className="font-bold text-lg">A IA está a processar os dados...</p>
                  <p className="text-sm text-fuchsia-400/50 mt-2">Isto pode demorar cerca de 10 a 20 segundos.</p>
               </div>
            ) : aiResult ? (
               <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {/* Este truque básico do React renderiza asteriscos como Bold para não quebrar o texto cru da IA */}
                  {aiResult.split('**').map((chunk, index) => 
                     index % 2 === 1 ? <strong key={index} className="text-fuchsia-300">{chunk}</strong> : chunk
                  )}
               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <LayoutTemplate className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-center max-w-sm">
                    Cole a copy do concorrente à esquerda e clique numa das ferramentas para a IA gerar a sua nova estrutura milionária.
                  </p>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
