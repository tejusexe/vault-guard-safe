import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useVault } from "@/context/VaultContext";
import LockScreen from "@/components/LockScreen";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, LogOut } from "lucide-react";

const ProtectedLayout: React.FC = () => {
  const { isUnlocked, lock } = useVault();
  const location = useLocation();

  if (!isUnlocked) return <LockScreen />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">Secure Vault</span>
          </Link>
          <Button variant="outline" size="sm" onClick={lock}>
            <LogOut className="h-4 w-4" />
            <span className="ml-2">Lock</span>
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ProtectedLayout;
