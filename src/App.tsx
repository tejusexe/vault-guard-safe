import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VaultProvider } from "@/context/VaultContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import Accounts from "./pages/Accounts";
import AccountCategory from "./pages/AccountCategory";
import Links from "./pages/Links";
import LinkCategory from "./pages/LinkCategory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <VaultProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<ProtectedLayout />}> 
              <Route path="/" element={<Index />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/accounts/:id" element={<AccountCategory />} />
              <Route path="/links" element={<Links />} />
              <Route path="/links/:id" element={<LinkCategory />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </VaultProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
