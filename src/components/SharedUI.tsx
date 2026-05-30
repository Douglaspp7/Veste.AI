// @ts-nocheck
import React from 'react';
import { Flame, CheckCircle, Clock } from 'lucide-react';

export const FusionBadge = ({ icon: Icon, text, variant = 'default', className = '' }) => {
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

export const StatusToVariant = (score) => {
  if (score >= 80) return 'warning';
  if (score >= 50) return 'success';
  return 'default';
};

export const StatusToText = (score) => {
  if (score >= 80) return '🔥 Super Escala';
  if (score >= 50) return 'Validado';
  return 'Teste';
};

export const StatusToIcon = (score) => {
  if (score >= 80) return Flame;
  if (score >= 50) return CheckCircle;
  return Clock;
};

export const PlatformBadge = ({ platform }) => {
  const text = platform && typeof platform === 'string' && platform.length > 20 ? platform.substring(0, 20) + "..." : platform;
  return (
    <span className="bg-slate-900/80 backdrop-blur-sm text-slate-200 px-2.5 py-1 rounded text-xs font-semibold border border-slate-700/50">
      {text || "FACEBOOK"}
    </span>
  );
};
