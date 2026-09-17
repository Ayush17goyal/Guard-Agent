"use client";

import { useState, useEffect, useRef, useContext } from "react";
import ParticleSphereAnimation from "@/components/ui/input-otp-10-utils/particalsphear";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { OTPInput, OTPInputContext } from "input-otp";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, AlertCircle } from "lucide-react";

const TARGET_CODE = "180726";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 450,
  damping: 28,
} as const;

const CustomOTPSlot = ({
  index,
  isSuccess,
  isError,
}: {
  index: number;
  isSuccess: boolean;
  isError?: boolean;
}) => {
  const inputOTPContext = useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  const [pulseKey, setPulseKey] = useState(0);
  const prevCharRef = useRef(char);

  useEffect(() => {
    if (char && char !== prevCharRef.current) {
      setPulseKey((prev) => prev + 1);
    }
    prevCharRef.current = char;
  }, [char]);

  return (
    <div
      className={cn(
        "relative flex h-14 w-11 sm:w-12 items-center justify-center rounded-xl border transition-all duration-300 font-mono text-xl font-bold select-none",
        isSuccess
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
          : isError
            ? "border-red-500 bg-red-500/10 text-red-400"
            : isActive
              ? "border-primary bg-primary/5 text-foreground"
              : "border-border/60 bg-muted/10 text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/20",
      )}
    >
      <AnimatePresence mode="popLayout">
        {char ? (
          <motion.span
            key={`slot-${index}-${pulseKey}`}
            initial={{ opacity: 0, scale: 0.5, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -4 }}
            transition={SPRING_TRANSITION}
            className={cn(
              "absolute font-mono text-2xl font-extrabold flex items-center justify-center select-none pt-1",
              isSuccess ? "text-emerald-400" : isError ? "text-red-400" : "text-foreground",
            )}
          >
            *
          </motion.span>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {pulseKey > 0 && (
          <motion.div
            key={pulseKey}
            className="absolute inset-0 rounded-xl border border-primary pointer-events-none"
            initial={{ opacity: 0.8, scale: 0.9, filter: "blur(0px)" }}
            animate={{ opacity: 0, scale: 1.5, filter: "blur(2px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
      {hasFakeCaret && !isSuccess && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            className="bg-primary h-6 w-0.5"
            animate={{ opacity: [1, 0, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: "easeInOut",
            }}
          />
        </div>
      )}
    </div>
  );
};

export interface InputOtp10Props {
  expectedCode?: string;
  onSuccess?: () => void;
  className?: string;
}

export default function InputOtp10({
  expectedCode = TARGET_CODE,
  onSuccess,
  className,
}: InputOtp10Props = {}) {
  const [value, setValue] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (value.length === 6) {
      if (value === expectedCode) {
        setIsSuccess(true);
        setIsError(false);
        setErrorMsg(null);
        if (onSuccess) {
          const timeout = setTimeout(() => {
            onSuccess();
          }, 1200);
          return () => clearTimeout(timeout);
        }
      } else {
        setIsSuccess(false);
        setIsError(true);
        setErrorMsg("Invalid verification code. Access denied.");
        const timeout = setTimeout(() => {
          setValue("");
          setIsError(false);
          setErrorMsg(null);
        }, 1800);
        return () => clearTimeout(timeout);
      }
    } else {
      setIsSuccess(false);
      setIsError(false);
      setErrorMsg(null);
    }
  }, [value, expectedCode, onSuccess]);

  return (
    <div
      className={cn(
        "relative w-full max-w-sm sm:max-w-md mx-auto rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-6 sm:p-8 backdrop-blur-xl overflow-hidden group select-none shadow-2xl",
        className,
      )}
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/15 transition-colors duration-500" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
      <div className="flex flex-col items-center gap-6 sm:gap-7">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border border-dashed border-primary/30 animate-spin pointer-events-none"
            style={{ animationDuration: "60s" }}
          />
          <div
            className="absolute inset-2 rounded-full border border-primary/15 animate-spin pointer-events-none"
            style={{ animationDuration: "30s", animationDirection: "reverse" }}
          />
          <div className="absolute inset-4 rounded-full border border-dashed border-primary/5 pointer-events-none" />
          <div
            className={cn(
              "absolute -inset-1.5 rounded-full transition-all duration-500",
              isSuccess
                ? "bg-gradient-to-t from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 animate-pulse"
                : isError
                  ? "bg-gradient-to-t from-red-500/0 via-red-500/10 to-red-500/0 animate-pulse"
                  : "bg-gradient-to-t from-primary/0 via-primary/5 to-primary/0 animate-pulse",
            )}
            style={!isSuccess && !isError ? { animationDuration: "3s" } : undefined}
          />
          <div
            className={cn(
              "w-32 h-32 rounded-full overflow-hidden flex items-center justify-center transition-all duration-500",
              isSuccess ? "scale-105" : "scale-95 group-hover:scale-100",
            )}
          >
            <ParticleSphereAnimation className="w-full h-full scale-135 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-xs rounded-full"
              >
                <div className="p-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              </motion.div>
            )}
            {isError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-xs rounded-full"
              >
                <div className="p-3 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                  <AlertCircle className="w-8 h-8" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="text-center flex flex-col gap-1.5">
          <h3 className="text-sm font-bold tracking-tight text-foreground uppercase">
            {isSuccess
              ? "System Key Decrypted"
              : isError
                ? "Key Signature Denied"
                : "Enter Credentials"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-2xs leading-relaxed">
            {isSuccess
              ? "Session authorization successfully validated by Security Hub."
              : isError
                ? errorMsg
                : "Please input the 6-digit verification code sent to your dynamic authenticator node."}
          </p>
        </div>
        <div className="w-full flex justify-center">
          <OTPInput
            maxLength={6}
            value={value}
            onChange={setValue}
            pattern={REGEXP_ONLY_DIGITS}
            containerClassName="group flex items-center justify-center gap-2 sm:gap-2.5"
            disabled={isSuccess}
            autoFocus
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <CustomOTPSlot
                  key={idx}
                  index={idx}
                  isSuccess={isSuccess}
                  isError={isError}
                />
              ))}
            </div>
          </OTPInput>
        </div>
        <div className="h-4 flex items-center justify-center">
          <span
            className={cn(
              "text-xs font-mono uppercase tracking-widest transition-colors",
              isSuccess
                ? "text-emerald-400 font-semibold"
                : isError
                  ? "text-red-400 font-semibold"
                  : "text-muted-foreground/70",
            )}
          >
            {isSuccess
              ? "Access Granted · Initializing Hub"
              : isError
                ? "Signature Mismatch"
                : value.length === 0
                  ? "Awaiting key signature..."
                  : value.length < 6
                    ? `Entering signature: ${value.length} / 6`
                    : "Signature matching complete"}
          </span>
        </div>

      </div>
    </div>
  );
}
