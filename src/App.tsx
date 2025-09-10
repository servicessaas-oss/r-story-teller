import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminSetup } from "@/components/AdminSetup";
import { LegalEntityPlatform } from "@/components/LegalEntityPlatform";
import { EnvelopeAssignmentTest } from "@/components/EnvelopeAssignmentTest";
import { PaymentSuccess } from "@/components/PaymentSuccess";

const queryClient = new QueryClient();

const App = () => {
  console.log('🔄 App component rendering...');
  console.log('📊 Query client initialized:', !!queryClient);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/legal-entity" element={<LegalEntityPlatform />} />
              <Route path="/admin-setup" element={<AdminSetup />} />
              <Route path="/test-assignments" element={<EnvelopeAssignmentTest />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
