import { Clock, Phone, UserCheck, Users } from "lucide-react";
import { obj, rows, useVoice } from "@/lib/api";
import { fmtInt } from "@/lib/format";
import { ChartCard, DataTable, Grid2, KpiCard, KpiGrid, SectionShell } from "@/components/panels";
import { DonutMini } from "@/components/charts";
import { Badge } from "@/components/ui";
import { dateCol } from "@/sections/cols";
import { AiActNotice } from "@/components/portal";

function mmss(seconds: unknown): string {
  const s = Number(seconds ?? 0);
  if (!s) return "—";
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function VozSection() {
  const q = useVoice();
  return (
    <SectionShell
      title="Agente de voz (Sara)"
      subtitle="Atención telefónica con IA por sede: motivos, resúmenes y seguimiento humano."
      query={q}
    >
      {(data) => {
        const k = obj(data, "kpis");
        return (
          <div className="space-y-4">
            <AiActNotice />
            <KpiGrid>
              <KpiCard label="Llamadas atendidas" value={fmtInt(k.total)} icon={<Phone className="h-4 w-4" />} tone="success" />
              <KpiCard label="Con contacto" value={fmtInt(k.con_contacto)} icon={<Users className="h-4 w-4" />} />
              <KpiCard label="Duración media" value={mmss(k.duracion_media_s)} icon={<Clock className="h-4 w-4" />} />
              <KpiCard label="Requieren seguimiento" value={fmtInt(k.requieren_seguimiento)} icon={<UserCheck className="h-4 w-4" />} tone="danger" hint="con objeciones registradas" />
            </KpiGrid>
            <Grid2>
              <ChartCard title="Motivos de llamada" subtitle="Categorización automática (IA)" csv={{ name: "motivos", rows: rows(data, "by_motivo") }}>
                <DonutMini data={rows(data, "by_motivo")} name="motivo" value="n" />
              </ChartCard>
              <DataTable
                title="Últimas llamadas"
                name="llamadas"
                rows={rows(data, "recent")}
                columns={[
                  dateCol("occurred_at", "Fecha"),
                  { key: "sede", label: "Sede" },
                  { key: "motivo", label: "Motivo" },
                  { key: "resumen", label: "Resumen" },
                  { key: "duration_s", label: "Duración", align: "right", fmt: (v) => mmss(v) },
                  {
                    key: "seguimiento",
                    label: "Seguimiento",
                    fmt: (v) =>
                      v ? <Badge tone="danger">Requiere humano</Badge> : <Badge tone="success">Resuelta</Badge>,
                  },
                ]}
              />
            </Grid2>
          </div>
        );
      }}
    </SectionShell>
  );
}
