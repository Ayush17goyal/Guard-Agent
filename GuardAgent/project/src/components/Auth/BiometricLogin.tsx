import { Logo } from '@/components/shared/Logo';
import InputOtp10 from '@/components/ui/input-otp-10';
import { setAuth } from '@/lib/store';
import type { AuthState } from '@/lib/types';

export function BiometricLogin() {
  const handleSuccess = () => {
    const auth: AuthState = {
      authenticated: true,
      method: 'otp',
      credentialId: 'auth_key_180726',
      username: 'security-operator@guardagent',
    };
    setAuth(auth);
  };

  return (
    <div className="min-h-screen bg-bg-primary grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 radial-glow pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-cyan/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg animate-fade-in flex flex-col items-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        {/* Input OTP 10 Component with Security Code 180726 */}
        <InputOtp10 expectedCode="180726" onSuccess={handleSuccess} />

        {/* Footer info */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-ink-muted font-mono">
          <span>SECURITY NODE ACTIVE</span>
          <span className="text-line">|</span>
          <span>RUNTIME AIR-GAPPED</span>
          <span className="text-line">|</span>
          <span>DEMO ENVIRONMENT</span>
        </div>
      </div>
    </div>
  );
}
