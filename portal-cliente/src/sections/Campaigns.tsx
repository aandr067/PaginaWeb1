import { obj, rows, useSection } from "@/lib/api";
import { fmtInt, fmtMoney } from "@/lib/format";
import { ChartCard, DataTable, Grid2, SectionShell, StatTile } from "@/components/panels";
import { BarMini, DonutMini, GroupedBar, PALETTE } from "@/components/charts";
import { col, dateCol, moneyCol, numCol } from "./cols";

export function CampaignsSection() {
  const q = useSection("/campaigns");
  return (
    <SectionShell
      title="Campañas"
      subtitle="Ciclo de vida (borrador→aprobada→ejecutada), resultados y atribución (ventana de 14 días)."
      query={q}
    >
      {(data) => {
        const t = obj(data, "totals");
        const results = rows(data, "results");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Enviados" value={fmtInt(t.sent)} />
              <StatTile label="Entregados" value={fmtInt(t.delivered)} />
              <StatTile label="Aperturas" value={fmtInt(t.opened)} />
              <StatTile label="Clics" value={fmtInt(t.clicked)} />
              <StatTile label="Conversiones" value={fmtInt(t.conversions)} />
              <StatTile label="Revenue atribuido" value={fmtMoney(t.revenue)} />
            </div>

            <Grid2>
              <ChartCard title="Por estado" csv={{ name: "campanas_estado", rows: rows(data, "by_status") }}>
                <DonutMini data={rows(data, "by_status")} name="status" value="n" />
              </ChartCard>
              <ChartCard title="Por tipo" csv={{ name: "campanas_tipo", rows: rows(data, "by_type") }}>
                <BarMini data={rows(data, "by_type")} x="type" y="n" color={PALETTE[5]} />
              </ChartCard>
            </Grid2>

            <ChartCard title="Por canal" csv={{ name: "campanas_canal", rows: rows(data, "by_channel") }}>
              <BarMini data={rows(data, "by_channel")} x="channel" y="n" color={PALETTE[1]} />
            </ChartCard>

            <ChartCard
              title="Resultados por campaña"
              subtitle="enviados / aperturas / conversiones"
              csv={{ name: "campanas_resultados", rows: results }}
            >
              <GroupedBar
                data={results}
                x="name"
                series={[
                  { key: "sent", name: "Enviados", color: PALETTE[0] },
                  { key: "opened", name: "Aperturas", color: PALETTE[1] },
                  { key: "conversions", name: "Conversiones", color: PALETTE[3] },
                ]}
              />
            </ChartCard>

            <DataTable
              title="Campañas (detalle)"
              name="campanas"
              rows={results}
              columns={[
                col("name", "Campaña"),
                col("type", "Tipo"),
                col("status", "Estado"),
                numCol("sent", "Env."),
                numCol("delivered", "Entreg."),
                numCol("opened", "Aperturas"),
                numCol("clicked", "Clics"),
                numCol("conversions", "Conv."),
                moneyCol("revenue_attributed", "Revenue"),
                col("approved_by", "Aprobada por"),
                dateCol("created_at", "Creada"),
              ]}
            />
          </div>
        );
      }}
    </SectionShell>
  );
}
