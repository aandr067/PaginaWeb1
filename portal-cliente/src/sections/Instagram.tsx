import { rows, useSection } from "@/lib/api";
import { ChartCard, DataTable, SectionShell } from "@/components/panels";
import { BarMini, PALETTE } from "@/components/charts";
import { MessagingPanels } from "./messaging";
import { col, dateCol } from "./cols";

export function InstagramSection() {
  const q = useSection("/instagram");
  return (
    <SectionShell
      title="Instagram"
      subtitle="Respuestas automáticas de DM y comentarios (auto vs. escalado) por plantilla, e interacciones."
      query={q}
    >
      {(data) => (
        <div className="space-y-4">
          <MessagingPanels data={data} color={PALETTE[8]} />

          <ChartCard
            title="Interacciones por tipo y dirección"
            subtitle="DM / comentario · entrante / saliente"
            csv={{ name: "ig_interacciones", rows: rows(data, "interactions_by_kind") }}
          >
            <BarMini data={rows(data, "interactions_by_kind")} x="kind" y="n" color={PALETTE[5]} />
          </ChartCard>

          <DataTable
            title="Interacciones recientes"
            name="ig_interacciones_detalle"
            rows={rows(data, "interactions_recent")}
            columns={[
              col("kind", "Tipo"),
              col("direction", "Dirección"),
              col("content", "Contenido"),
              dateCol("occurred_at", "Fecha"),
            ]}
          />
        </div>
      )}
    </SectionShell>
  );
}
