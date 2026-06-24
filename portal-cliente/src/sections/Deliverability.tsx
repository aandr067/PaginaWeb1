import { obj, rows, useSection } from "@/lib/api";
import { fmtInt, fmtPct } from "@/lib/format";
import { ChartCard, DataTable, Grid2, SectionShell, StatTile } from "@/components/panels";
import { BarMini, DonutMini, PALETTE } from "@/components/charts";
import { col, dateCol } from "./cols";

function pct(part: unknown, total: unknown): string {
  const p = Number(part);
  const t = Number(total);
  return t > 0 ? fmtPct((p / t) * 100) : "—";
}

export function DeliverabilitySection() {
  const q = useSection("/deliverability");
  return (
    <SectionShell
      title="Entregabilidad / Consentimiento"
      subtitle="Lista de supresión global (P7), ledger de consentimiento (P10) y salud de webhooks."
      query={q}
    >
      {(data) => {
        const cr = obj(data, "consent_rates");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Contactos" value={fmtInt(cr.total_contacts)} />
              <StatTile label="Consent. email" value={pct(cr.email_granted, cr.total_contacts)} />
              <StatTile label="Consent. WhatsApp" value={pct(cr.whatsapp_granted, cr.total_contacts)} />
              <StatTile label="Supresiones" value={fmtInt(rows(data, "suppression_by_reason").reduce((a, r) => a + Number(r.n ?? 0), 0))} />
            </div>

            <Grid2>
              <ChartCard
                title="Supresión por motivo"
                subtitle="unsubscribe / hard_bounce / complaint / manual / global"
                csv={{ name: "supresion_motivo", rows: rows(data, "suppression_by_reason") }}
              >
                <DonutMini data={rows(data, "suppression_by_reason")} name="reason" value="n" />
              </ChartCard>
              <ChartCard title="Supresión por canal" csv={{ name: "supresion_canal", rows: rows(data, "suppression_by_channel") }}>
                <BarMini data={rows(data, "suppression_by_channel")} x="channel" y="n" color={PALETTE[3]} />
              </ChartCard>
            </Grid2>

            <ChartCard
              title="Webhooks por proveedor"
              subtitle="Eventos idempotentes registrados (métrica global de plataforma)"
              csv={{ name: "webhooks", rows: rows(data, "webhooks_by_provider") }}
            >
              <BarMini data={rows(data, "webhooks_by_provider")} x="provider" y="n" color={PALETTE[4]} />
            </ChartCard>

            <Grid2>
              <DataTable
                title="Supresiones recientes"
                name="supresiones"
                rows={rows(data, "suppression_recent")}
                columns={[
                  col("channel", "Canal"),
                  col("identity_type", "Tipo id."),
                  col("reason", "Motivo"),
                  col("source", "Origen"),
                  dateCol("created_at", "Fecha"),
                ]}
              />
              <DataTable
                title="Eventos de consentimiento (ledger)"
                name="consent_events"
                rows={rows(data, "consent_events_recent")}
                columns={[
                  col("channel", "Canal"),
                  col("granted", "Concedido"),
                  col("source", "Origen"),
                  dateCol("occurred_at", "Fecha"),
                ]}
              />
            </Grid2>
          </div>
        );
      }}
    </SectionShell>
  );
}
