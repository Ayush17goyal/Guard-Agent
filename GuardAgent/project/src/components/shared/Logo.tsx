import { Shield } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 20, text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 28, text: 'text-xl', sub: 'text-xs' },
    lg: { icon: 40, text: 'text-3xl', sub: 'text-sm' },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative">
        <div className="absolute inset-0 bg-accent-cyan/20 blur-xl rounded-full" />
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-blue/10 border border-accent-cyan/30">
          <Shield size={s.icon} className="text-accent-cyan" strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <div className={`font-bold tracking-tight ${s.text} text-ink-white leading-none`}>
          Guard<span className="text-accent-cyan">Agent</span>
        </div>
        <div className={`font-mono ${s.sub} text-ink-muted tracking-wider uppercase mt-0.5`}>
          Runtime Firewall
        </div>
      </div>
    </div>
  );
}
