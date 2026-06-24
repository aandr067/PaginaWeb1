import { obj, rows, useSection } from "@/lib/api";
import { fmtInt, fmtMoney, fmtPct } from "@/lib/format";
import type { Column } from "@/components/panels";
import { ChartCard, DataTable, Grid2, SectionShell, StatTile } from "@/components/panels";
import { BarMini, PALETTE } from "@/components/charts";
import { col, moneyCol, numCol } from "./cols";

const pctCol = (key: string, label: string): Column => ({
  key,
  label,
  align: "right",
  fmt: (v) => fmtPct(v),
});

export function GlobalSection() {
  const q = useSection("/global");
  return (
    <SectionShell
      title="Vista global · Todos los gimnasios"
      subtitle="Agregado de toda la cadena: totales, rankings y comparativa por gimnasio (nunca un gimnasio aislado)."
      query={q}
    >
      {(data) => {
        const t = obj(data, "totals");
        const rk = obj(data, "rankings");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              <StatTile label="Gimnasios" value={fmtInt(t.gimnasios)} />
              <StatTile label="Contactos" value={fmtInt(t.contactos)} />
              <StatTile label="Socios" value={fmtInt(t.socios)} />
              <StatTile label="Leads nuevos" value={fmtInt(t.leads_nuevos)} />
              <StatTile label="En riesgo" value={fmtInt(t.at_risk)} />
              <StatTile label="Bajas" value={fmtInt(t.churned)} />
              <StatTile label="Mensajes" value={fmtInt(t.mensajes)} />
              <StatTile label="Revenue" value={fmtMoney(t.revenue)} />
            </div>

            <Grid2>
              <ChartCard title="Ranking · Socios activos" csv={{ name: "ranking_socios", rows: rows(rk, "socios") }}>
                <BarMini data={rows(rk, "socios")} x="name" y="value" color={PALETTE[7]} />
              </ChartCard>
              <ChartCard title="Ranking · Leads nuevos" csv={{ name: "ranking_leads", rows: rows(rk, "leads_nuevos") }}>
                <BarMini data={rows(rk, "leads_nuevos")} x="name" y="value" color={PALETTE[0]} />
              </ChartCard>
              <ChartCard title="Ranking · Revenue atribuido" csv={{ name: "ranking_revenue", rows: rows(rk, "revenue") }}>
                <BarMini data={rows(rk, "revenue")} x="name" y="value" color={PALETTE[1]} />
              </ChartCard>
              <ChartCard title="Ranking · Bajas" csv={{ name: "ranking_bajas", rows: rows(rk, "churned") }}>
                <BarMini data={rows(rk, "churned")} x="name" y="value" color={PALETTE[3]} />
              </ChartCard>
            </Grid2>

            <DataTable
              title="Comparativa por gimnasio"
              subtitle="Una fila por gimnasio (la única vista que cruza locales, siempre comparada/agregada)"
              name="comparativa_gimnasios"
              rows={rows(data, "comparison")}
              columns={[
                col("name", "Gimnasio"),
                col("code", "Código"),
                numCol("contactos", "Contactos"),
                numCol("leads_nuevos", "Leads nuevos"),
                numCol("socios", "Socios"),
                numCol("at_risk", "En riesgo"),
                numCol("churned", "Bajas"),
                numCol("vip", "VIP"),
                numCol("mensajes", "Mensajes"),
                numCol("campanas", "Campañas"),
                numCol("conversiones", "Conv."),
                moneyCol("revenue", "Revenue"),
                pctCol("retencion_pct", "Retención"),
              ]}
            />
          </div>
        );
      }}
    </SectionShell>
  );
}
