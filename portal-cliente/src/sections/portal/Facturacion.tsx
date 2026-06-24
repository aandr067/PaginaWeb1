import { Download } from "lucide-react";
import { useInvoices, type InvoiceItem, type Row } from "@/lib/api";
import { fmtMoney } from "@/lib/format";
import { DataTable, SectionShell } from "@/components/panels";
import { Badge, Button, Card } from "@/components/ui";

const STATUS: Record<string, { label: string; tone: "success" | "warning" | "danger" }> = {
  pagada: { label: "Pagada", tone: "success" },
  pendiente: { label: "Pendiente", tone: "warning" },
  vencida: { label: "Vencida", tone: "danger" },
};

export function FacturacionSection() {
  const q = useInvoices();
  return (
    <SectionShell
      title="Facturación"
      subtitle="Tus facturas, estado de pago y plan contratado."
      query={q}
    >
      {(data) => {
        const invoices: InvoiceItem[] = data.invoices ?? [];
        const plan = invoices.find((i) => i.plan)?.plan ?? "—";
        return (
          <div className="space-y-4">
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Plan contratado</p>
                <p className="text-lg font-semibold">{plan}</p>
              </div>
              <Badge tone="success">Activo</Badge>
            </Card>
            <DataTable
              title="Facturas"
              name="facturas"
              rows={invoices as unknown as Row[]}
              columns={[
                { key: "period", label: "Periodo" },
                { key: "amount", label: "Importe", align: "right", fmt: (v) => fmtMoney(Number(v ?? 0)) },
                {
                  key: "status",
                  label: "Estado",
                  fmt: (v) => {
                    const s = STATUS[String(v)] ?? { label: String(v), tone: "warning" as const };
                    return <Badge tone={s.tone}>{s.label}</Badge>;
                  },
                },
                {
                  key: "download_available",
                  label: "",
                  align: "right",
                  fmt: (v) =>
                    v ? (
                      <Button variant="outline" title="Descargar factura">
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    ),
                },
              ]}
            />
          </div>
        );
      }}
    </SectionShell>
  );
}
