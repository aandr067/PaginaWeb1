import { rows, useSection } from "@/lib/api";
import { fmtInt } from "@/lib/format";
import { ChartCard, DataTable, Grid2, SectionShell, StatTile } from "@/components/panels";
import { BarMini, DonutMini, LineMini, PALETTE } from "@/components/charts";
import { col, dateCol, numCol } from "./cols";

function sum(data: Array<Record<string, unknown>>, key: string): number {
  return data.reduce((acc, r) => acc + Number(r[key] ?? 0), 0);
}

export function CaptureSection() {
  const q = useSection("/capture");
  return (
    <SectionShell
      title="Captura / Leads"
      subtitle="Origen de los leads, identidades, llamadas de voz, interacciones y cola de deduplicación."
      query={q}
    >
      {(data) => {
        const bySource = rows(data, "by_source");
        const voice = rows(data, "voice_calls");
        const inter = rows(data, "interactions_recent");
        const merge = rows(data, "merge_candidates");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Leads (rango)" value={fmtInt(sum(bySource, "n"))} />
              <StatTile label="Llamadas de voz" value={fmtInt(voice.length)} />
              <StatTile label="Interacciones" value={fmtInt(sum(rows(data, "interactions_by_channel"), "n"))} />
              <StatTile label="Pend. fusión" value={fmtInt(merge.length)} />
            </div>

            <Grid2>
              <ChartCard title="Leads por fuente" csv={{ name: "leads_por_fuente", rows: bySource }}>
                <BarMini data={bySource} x="source" y="n" />
              </ChartCard>
              <ChartCard title="Altas por día" csv={{ name: "altas_por_dia", rows: rows(data, "timeseries") }}>
                <LineMini data={rows(data, "timeseries")} x="dia" y="n" />
              </ChartCard>
              <ChartCard title="Distribución por estado" csv={{ name: "por_estado", rows: rows(data, "by_status") }}>
                <DonutMini data={rows(data, "by_status")} name="status" value="n" />
              </ChartCard>
              <ChartCard title="Interacciones por canal" csv={{ name: "interacciones_canal", rows: rows(data, "interactions_by_channel") }}>
                <BarMini data={rows(data, "interactions_by_channel")} x="channel" y="n" color={PALETTE[5]} />
              </ChartCard>
            </Grid2>

            <ChartCard title="Identidades por tipo" subtitle="email / teléfono / handle IG / número WA / id externo" csv={{ name: "identidades", rows: rows(data, "identities_by_type") }}>
              <BarMini data={rows(data, "identities_by_type")} x="type" y="n" color={PALETTE[2]} />
            </ChartCard>

            <DataTable
              title="Contactos recientes"
              name="contactos"
              rows={rows(data, "detail")}
              columns={[
                col("full_name", "Contacto"),
                col("source", "Fuente"),
                col("status", "Estado"),
                col("consent_email", "Consent. email"),
                col("consent_whatsapp", "Consent. WA"),
                col("needs_merge", "Pend. fusión"),
                dateCol("last_seen_at", "Última actividad"),
                dateCol("created_at", "Alta"),
              ]}
            />

            <Grid2>
              <DataTable
                title="Llamadas de voz"
                name="voice_calls"
                rows={voice}
                columns={[
                  col("provider", "Proveedor"),
                  col("call_sid", "Call SID"),
                  numCol("duration_s", "Dur. (s)"),
                  col("has_transcript", "Transcripción"),
                  col("entities", "Entidades (IA)"),
                  dateCol("occurred_at", "Fecha"),
                ]}
              />
              <DataTable
                title="Interacciones recientes"
                name="interacciones"
                rows={inter}
                columns={[
                  col("channel", "Canal"),
                  col("kind", "Tipo"),
                  col("direction", "Dirección"),
                  dateCol("occurred_at", "Fecha"),
                ]}
              />
            </Grid2>

            <DataTable
              title="Cola de deduplicación (revisión manual)"
              subtitle="Pares marcados needs_merge sin resolver (p. ej. homónimos)"
              name="merge_candidates"
              rows={merge}
              columns={[
                col("contact_id_a", "Contacto A"),
                col("contact_id_b", "Contacto B"),
                col("reason", "Motivo"),
                dateCol("created_at", "Detectado"),
              ]}
            />
          </div>
        );
      }}
    </SectionShell>
  );
}
