import React from 'react';
import { Copy, Loader2 } from 'lucide-react';

export default function ClonerPage() {
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
}
