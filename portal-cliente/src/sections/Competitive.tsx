import { rows, useSection } from "@/lib/api";
import { fmtInt } from "@/lib/format";
import { ChartCard, DataTable, Grid2, SectionShell, StatTile } from "@/components/panels";
import { GroupedBar, PALETTE } from "@/components/charts";
import { col, dateCol } from "./cols";

export function CompetitiveSection() {
  const q = useSection("/competitive");
  return (
    <SectionShell
      title="Inteligencia competitiva"
      subtitle="Seguimiento de competidores de tu zona: actividad, cambios de precio/promoción y reputación. Panel de solo lectura."
      query={q}
    >
      {(data) => {
        const competitors = rows(data, "competitors");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Competidores" value={fmtInt(competitors.length)} />
              <StatTile label="Snapshots" value={fmtInt(rows(data, "snapshots_recent").length)} />
              <StatTile label="Reviews" value={fmtInt(rows(data, "reviews_recent").length)} />
              <StatTile
                label="Rating medio"
                value={
                  competitors.length
                    ? (
                        competitors.reduce((a, r) => a + Number(r.avg_rating ?? 0), 0) /
                        competitors.length
                      ).toFixed(2)
                    : "—"
                }
              />
            </div>

            <ChartCard title="Actividad por competidor" csv={{ name: "competidores", rows: competitors }}>
              <GroupedBar
                data={competitors}
                x="name"
                series={[
                  { key: "snapshots", name: "Snapshots", color: PALETTE[0] },
                  { key: "reviews", name: "Reviews", color: PALETTE[2] },
                ]}
              />
            </ChartCard>

            <DataTable
              title="Competidores"
              name="competidores"
              rows={competitors}
              columns={[
                col("name", "Nombre"),
                col("snapshots", "Snapshots"),
                col("reviews", "Reviews"),
                col("avg_rating", "Rating medio"),
              ]}
            />

            <Grid2>
              <DataTable
                title="Cambios recientes"
                subtitle="métricas + cambios detectados (promos, precios, seguidores…)"
                name="snapshots"
                rows={rows(data, "snapshots_recent")}
                columns={[
                  col("competidor", "Competidor"),
                  col("metrics", "Métricas"),
                  col("changes_detected", "Cambios"),
                  dateCol("captured_at", "Detectado"),
                ]}
              />
              <DataTable
                title="Reputación reciente"
                subtitle="puntuación, texto y pain points (extracción IA)"
                name="reviews"
                rows={rows(data, "reviews_recent")}
                columns={[
                  col("competidor", "Competidor"),
                  col("rating", "Rating"),
                  col("text", "Texto"),
                  col("pain_points", "Pain points"),
                  dateCol("captured_at", "Detectado"),
                ]}
              />
            </Grid2>
          </div>
        );
      }}
    </SectionShell>
  );
}
