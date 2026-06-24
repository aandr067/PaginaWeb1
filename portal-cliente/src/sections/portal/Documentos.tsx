import { Download, FileText } from "lucide-react";
import { useDocuments, type DocumentItem } from "@/lib/api";
import { fmtDay } from "@/lib/format";
import { SectionShell } from "@/components/panels";
import { Badge, Button, Card } from "@/components/ui";

const KIND_LABEL: Record<string, string> = {
  nda: "NDA",
  piloto: "Piloto",
  saas: "SaaS",
  dpa: "DPA",
  dossier: "Dossier",
  otro: "Otro",
};
const KIND_TONE: Record<string, "brand" | "info" | "neutral" | "success"> = {
  saas: "brand",
  dpa: "info",
  nda: "neutral",
  dossier: "success",
};

export function DocumentosSection() {
  const q = useDocuments();
  return (
    <SectionShell
      title="Documentación y contratos"
      subtitle="Tus contratos, DPA de RGPD y dossier de bienvenida. Descarga segura por permisos."
      query={q}
    >
      {(data) => {
        const docs: DocumentItem[] = data.documents ?? [];
        if (docs.length === 0) {
          return (
            <Card className="p-6 text-center text-sm text-muted">
              Aún no hay documentos disponibles para tu cuenta.
            </Card>
          );
        }
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {docs.map((d) => (
              <Card key={d.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-brand" />
                  <div>
                    <p className="text-sm font-medium">{d.title}</p>
                    <p className="text-xs text-muted">{d.uploaded_at ? fmtDay(d.uploaded_at) : "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={KIND_TONE[d.kind] ?? "neutral"}>{KIND_LABEL[d.kind] ?? d.kind}</Badge>
                  <Button variant="outline" title="Descargar">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        );
      }}
    </SectionShell>
  );
}
