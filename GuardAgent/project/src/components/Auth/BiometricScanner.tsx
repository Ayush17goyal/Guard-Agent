import { useEffect, useState } from 'react';
import { Fingerprint, ShieldCheck } from 'lucide-react';

type Phase = 'ready' | 'scanning' | 'verifying' | 'success' | 'error';

export function BiometricScanner({
  phase,
  progress,
}: {
  phase: Phase;
  progress: number;
}) {
  const [particles, setParticles] = useState<{ x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 8 }, (_, i) => ({
        x: Math.cos((i / 8) * Math.PI * 2) * 80,
        y: Math.sin((i / 8) * Math.PI * 2) * 80,
        delay: i * 0.1,
      })),
    );
  }, []);

  const ringColor =
    phase === 'success' ? '#10B981'
      : phase === 'error' ? '#EF4444'
        : phase === 'scanning' || phase === 'verifying' ? '#22D3EE'
          : '#475569';

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer rotating ring */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={ringColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={ringColor} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Background ring */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="#1E293B" strokeWidth="1.5" />

        {/* Rotating arc */}
        {(phase === 'scanning' || phase === 'verifying') && (
          <circle
            cx="100" cy="100" r="90" fill="none" stroke="url(#ringGrad)" strokeWidth="2.5"
            strokeDasharray="120 565" strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className="animate-spin-slow"
            style={{ transformOrigin: 'center' }}
          />
        )}

        {/* Progress ring (success) */}
        {phase === 'success' && (
          <circle
            cx="100" cy="100" r="90" fill="none" stroke={ringColor} strokeWidth="2.5"
            strokeDasharray="565" strokeLinecap="round"
            transform="rotate(-90 100 100)"
            strokeOpacity={0.6}
          />
        )}

        {/* Inner ring */}
        <circle cx="100" cy="100" r="72" fill="none" stroke="#1E293B" strokeWidth="1" />
        {(phase === 'scanning' || phase === 'verifying') && (
          <circle
            cx="100" cy="100" r="72" fill="none" stroke={ringColor} strokeWidth="1.5"
            strokeDasharray="60 452" strokeLinecap="round"
            transform="rotate(90 100 100)"
            className="animate-spin-reverse"
            style={{ transformOrigin: 'center' }}
          />
        )}

        {/* Tick marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const x1 = 100 + Math.cos(angle) * 96;
          const y1 = 100 + Math.sin(angle) * 96;
          const x2 = 100 + Math.cos(angle) * 92;
          const y2 = 100 + Math.sin(angle) * 92;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i % 6 === 0 ? ringColor : '#334155'}
              strokeWidth={i % 6 === 0 ? 1.5 : 0.5}
              strokeOpacity={i % 6 === 0 ? 0.6 : 0.3}
            />
          );
        })}
      </svg>

      {/* Scanning line */}
      {(phase === 'scanning' || phase === 'verifying') && (
        <div className="absolute inset-4 rounded-full overflow-hidden pointer-events-none">
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-cyan to-transparent animate-scan-line" />
        </div>
      )}

      {/* Particles converging */}
      {(phase === 'scanning' || phase === 'verifying') && particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-accent-cyan"
          style={{
            left: '50%', top: '50%',
            transform: `translate(${p.x}px, ${p.y}px)`,
            animation: `pulse-ring 2s ease-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Center icon */}
      <div className="relative z-10 flex items-center justify-center">
        {phase === 'success' ? (
          <ShieldCheck size={56} className="text-ok-bright animate-fade-in" strokeWidth={2} />
        ) : (
          <Fingerprint
            size={56}
            className={
              phase === 'error' ? 'text-threat-bright'
                : (phase === 'scanning' || phase === 'verifying') ? 'text-accent-cyan animate-glow-pulse'
                  : 'text-ink-dim'
            }
            strokeWidth={1.5}
          />
        )}
      </div>

      {/* Pulse rings on success */}
      {phase === 'success' && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-ok/40 animate-pulse-ring" />
          <div className="absolute inset-0 rounded-full border-2 border-ok/30 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
        </>
      )}
    </div>
  );
}
