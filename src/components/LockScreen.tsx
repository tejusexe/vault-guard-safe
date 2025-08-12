import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useVault } from "@/context/VaultContext";
import { motion } from "framer-motion";
import { toast } from "sonner";

const digitOptions = [4, 5, 6];

export const LockScreen: React.FC = () => {
  const { isSetup, pinLength, setupPin, unlock } = useVault();
  const [digits, setDigits] = useState<number>(pinLength || 6);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    if (!isSetup) return pin.length === digits && pinConfirm.length === digits && pin === pinConfirm;
    return pin.length === (pinLength || 6);
  }, [isSetup, digits, pin, pinConfirm, pinLength]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setLoading(true);
      if (!isSetup) {
        await setupPin(pin, digits);
        toast.success("PIN set. Vault created.");
      } else {
        const ok = await unlock(pin);
        if (!ok) {
          toast.error("Incorrect PIN");
          return;
        }
        toast.success("Unlocked");
      }
      setPin("");
      setPinConfirm("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/20 p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-md">
        <Card className="backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{isSetup ? "Enter PIN" : "Create your PIN"}</CardTitle>
            <CardDescription>
              {isSetup ? "Unlock your encrypted vault" : "Choose a 4–6 digit PIN to encrypt your vault"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isSetup && (
              <div className="flex items-center gap-2">
                <span className="text-sm">Digits:</span>
                <div className="flex gap-2">
                  {digitOptions.map((d) => (
                    <Button key={d} variant={digits === d ? "default" : "outline"} size="sm" onClick={() => setDigits(d)}>
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm">{isSetup ? `PIN (${pinLength} digits)` : `Enter PIN (${digits} digits)`}</label>
              <InputOTP maxLength={isSetup ? pinLength : digits} value={pin} onChange={setPin} disabled={loading}>
                <InputOTPGroup>
                  {Array.from({ length: isSetup ? pinLength : digits }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {!isSetup && (
              <div className="space-y-2">
                <label className="text-sm">Confirm PIN</label>
                <InputOTP maxLength={digits} value={pinConfirm} onChange={setPinConfirm} disabled={loading}>
                  <InputOTPGroup>
                    {Array.from({ length: digits }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            )}

            <Button className="w-full" onClick={handleSubmit} disabled={!canSubmit || loading}>
              {isSetup ? "Unlock" : "Create PIN"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LockScreen;
