import { rows, useSection } from "@/lib/api";
import { fmtInt } from "@/lib/format";
import { ChartCard, DataTable, Grid2, SectionShell, StatTile } from "@/components/panels";
import { BarMini, PALETTE } from "@/components/charts";
import { col, dateCol } from "./cols";

export function ScoringSection() {
  const q = useSection("/scoring");
  return (
    <SectionShell
      title="Scoring / IA"
      subtitle="Último score por contacto: intención (LLM), riesgo de baja, próxima acción, VIP y alertas del equipo."
      query={q}
    >
      {(data) => {
        const dist = rows(data, "by_kind_label");
        const byKind = (kind: string) => dist.filter((r) => String(r.kind) === kind);
        const vip = rows(data, "vip");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Contactos con score" value={fmtInt(new Set(rows(data, "recent_scores").map((r) => r.contact_id)).size)} />
              <StatTile label="VIP detectados" value={fmtInt(vip.length)} />
              <StatTile label="Tipos de alerta" value={fmtInt(rows(data, "alerts_by_type").length)} />
              <StatTile label="Alertas (rango)" value={fmtInt(rows(data, "alerts_recent").length)} />
            </div>

            <Grid2>
              <ChartCard title="Intención (intent)" csv={{ name: "intent", rows: byKind("intent") }}>
                <BarMini data={byKind("intent")} x="etiqueta" y="n" color={PALETTE[0]} />
              </ChartCard>
              <ChartCard title="Riesgo de baja (churn)" csv={{ name: "churn", rows: byKind("churn") }}>
                <BarMini data={byKind("churn")} x="etiqueta" y="n" color={PALETTE[3]} />
              </ChartCard>
              <ChartCard title="Próxima acción (next_action)" csv={{ name: "next_action", rows: byKind("next_action") }}>
                <BarMini data={byKind("next_action")} x="etiqueta" y="n" color={PALETTE[1]} />
              </ChartCard>
              <ChartCard title="Alertas por tipo" csv={{ name: "alertas_tipo", rows: rows(data, "alerts_by_type") }}>
                <BarMini data={rows(data, "alerts_by_type")} x="type" y="n" color={PALETTE[2]} />
              </ChartCard>
            </Grid2>

            <DataTable
              title="Scores recientes (con señales IA)"
              subtitle="value_numeric, etiqueta, versión del modelo y features (drill-down de la IA)"
              name="scores"
              rows={rows(data, "recent_scores")}
              columns={[
                col("kind", "Tipo"),
                col("value_label", "Etiqueta"),
                col("value_numeric", "Valor"),
                col("model_version", "Modelo"),
                col("features", "Señales (features)"),
                dateCol("computed_at", "Calculado"),
              ]}
            />

            <Grid2>
              <DataTable
                title="VIP (estado o etiqueta vip_oculto)"
                name="vip"
                rows={vip}
                columns={[col("full_name", "Contacto"), col("status", "Estado")]}
              />
              <DataTable
                title="Alertas recientes"
                name="alertas"
                rows={rows(data, "alerts_recent")}
                columns={[
                  col("type", "Tipo"),
                  col("severity", "Severidad"),
                  col("channel", "Canal"),
                  col("payload", "Detalle"),
                  dateCol("created_at", "Fecha"),
                ]}
              />
            </Grid2>
          </div>
        );
      }}
    </SectionShell>
  );
}
