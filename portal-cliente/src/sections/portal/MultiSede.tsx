import { useSites } from "@/lib/api";
import { fmtInt, fmtMoney, fmtPct } from "@/lib/format";
import { ChartCard, DataTable, Grid2, SectionShell } from "@/components/panels";
import { BarMini } from "@/components/charts";

export function MultiSedeSection() {
  const q = useSites();
  return (
    <SectionShell
      title="Multi-sede"
      subtitle="Comparativa entre los gimnasios de tu cadena (agregado del periodo)."
      query={q}
    >
      {(data) => (
        <div className="space-y-4">
          <Grid2>
            <ChartCard
              title="Ranking de nuevos socios"
              subtitle="Por sede (rango seleccionado)"
              csv={{ name: "ranking_socios", rows: data.rankings.socios ?? [] }}
            >
              <BarMini data={data.rankings.socios ?? []} x="name" y="value" />
            </ChartCard>
            <ChartCard
              title="Ranking de leads nuevos"
              subtitle="Por sede (rango seleccionado)"
              csv={{ name: "ranking_leads", rows: data.rankings.leads_nuevos ?? [] }}
            >
              <BarMini data={data.rankings.leads_nuevos ?? []} x="name" y="value" />
            </ChartCard>
          </Grid2>

          <DataTable
            title="Detalle por sede"
            name="sedes"
            rows={data.comparison}
            subtitle={`${data.totals.gimnasios ?? data.comparison.length} sedes · ${fmtInt(
              data.totals.socios,
            )} socios en la cadena`}
            columns={[
              { key: "name", label: "Sede" },
              { key: "leads_nuevos", label: "Leads nuevos", align: "right", fmt: (v) => fmtInt(v) },
              { key: "socios", label: "Socios", align: "right", fmt: (v) => fmtInt(v) },
              { key: "mensajes", label: "Mensajes", align: "right", fmt: (v) => fmtInt(v) },
              { key: "conversiones", label: "Conversiones", align: "right", fmt: (v) => fmtInt(v) },
              { key: "revenue", label: "Ingreso", align: "right", fmt: (v) => fmtMoney(Number(v ?? 0)) },
              {
                key: "retencion_pct",
                label: "Retención",
                align: "right",
                fmt: (v) => (v == null ? "—" : fmtPct(Number(v))),
              },
            ]}
          />
        </div>
      )}
    </SectionShell>
  );
}
