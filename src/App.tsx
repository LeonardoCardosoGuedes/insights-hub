import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Gerenciamento from "./pages/Gerenciamento";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
                  {/* Página principal */}
                  <Route path="/" element={<Index />} />

                  {/* Página de gerenciamento */}
                  <Route path="/gerenciamento" element={<Gerenciamento />} />

                  {/* Rota padrão para páginas não encontradas */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
