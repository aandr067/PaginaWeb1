import { Info } from "lucide-react";
import { Card } from "@/components/ui";

/** Aviso de transparencia EU AI Act para la zona del agente de voz (5.3). */
export function AiActNotice() {
  return (
    <Card className="flex items-start gap-2 border-info/30 bg-info/5 p-3 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
      <p className="text-muted">
        <span className="font-medium text-fg">Atención mediante IA.</span> Las llamadas las
        atiende <strong>Sara</strong>, un sistema de inteligencia artificial. Se informa al
        interlocutor conforme al Reglamento Europeo de IA (EU AI Act). Las grabaciones y
        transcripciones se tratan según el RGPD.
      </p>
    </Card>
  );
}
