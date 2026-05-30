import React from 'react';
import { PenTool, Loader2 } from 'lucide-react';

export default function GeneratorPage() {
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
}
