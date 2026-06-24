import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/auth/LoginPage";
import { RequireAuth } from "@/auth/RequireAuth";
// Secciones del portal (5.1–5.7)
import { ResultadosSection } from "@/sections/portal/Resultados";
import { MultiSedeSection } from "@/sections/portal/MultiSede";
import { VozSection } from "@/sections/portal/Voz";
import { DocumentosSection } from "@/sections/portal/Documentos";
import { OnboardingSection } from "@/sections/portal/Onboarding";
import { SoporteSection } from "@/sections/portal/Soporte";
import { FacturacionSection } from "@/sections/portal/Facturacion";
// Marketing reutilizado (5.8) — mismas secciones/datos del dashboard existente
import { OverviewSection } from "@/sections/Overview";
import { CaptureSection } from "@/sections/Capture";
import { ProfilingSection } from "@/sections/Profiling";
import { ScoringSection } from "@/sections/Scoring";
import { EmailSection } from "@/sections/Email";
import { WhatsappSection } from "@/sections/Whatsapp";
import { InstagramSection } from "@/sections/Instagram";
import { CompetitiveSection } from "@/sections/Competitive";
import { CampaignsSection } from "@/sections/Campaigns";
import { DeliverabilitySection } from "@/sections/Deliverability";
import { OperationsSection } from "@/sections/Operations";
import { GlobalSection } from "@/sections/Global";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 15_000 } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* basename toma el base del build (BASE_URL = "/portal/" en prod). Así
          todas las rutas viven bajo /portal sin tocar los <Route> individuales. */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            {/* Portal */}
            <Route path="/" element={<ResultadosSection />} />
            <Route path="/sedes" element={<MultiSedeSection />} />
            <Route path="/voz" element={<VozSection />} />
            <Route path="/documentos" element={<DocumentosSection />} />
            <Route path="/onboarding" element={<OnboardingSection />} />
            <Route path="/soporte" element={<SoporteSection />} />
            <Route path="/facturacion" element={<FacturacionSection />} />
            {/* Marketing (5.8) — reutilización del dashboard existente */}
            <Route path="/marketing" element={<OverviewSection />} />
            <Route path="/marketing/captura" element={<CaptureSection />} />
            <Route path="/marketing/perfilado" element={<ProfilingSection />} />
            <Route path="/marketing/scoring" element={<ScoringSection />} />
            <Route path="/marketing/email" element={<EmailSection />} />
            <Route path="/marketing/whatsapp" element={<WhatsappSection />} />
            <Route path="/marketing/instagram" element={<InstagramSection />} />
            <Route path="/marketing/competencia" element={<CompetitiveSection />} />
            <Route path="/marketing/campanas" element={<CampaignsSection />} />
            <Route path="/marketing/entregabilidad" element={<DeliverabilitySection />} />
            <Route path="/marketing/operacion" element={<OperationsSection />} />
            <Route path="/marketing/global" element={<GlobalSection />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
