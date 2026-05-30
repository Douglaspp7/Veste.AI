import React from 'react';
import { Settings, Zap, Sparkles } from 'lucide-react';

export default function SettingsPage({ 
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
}
