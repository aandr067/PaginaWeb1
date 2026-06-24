import { obj, rows, useSection } from "@/lib/api";
import { fmtInt, fmtNum, fmtPct } from "@/lib/format";
import { ChartCard, DataTable, Grid2, SectionShell, StatTile } from "@/components/panels";
import { BarMini, DonutMini, PALETTE } from "@/components/charts";
import { col, dateCol, moneyCol } from "./cols";

export function ProfilingSection() {
  const q = useSection("/profiling");
  return (
    <SectionShell
      title="Perfilado"
      subtitle="Ciclo de vida, segmentos, asistencia (clases, rachas, clase/franja favorita), reservas y etiquetas."
      query={q}
    >
      {(data) => {
        const att = obj(data, "attendance_summary");
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Asistencia media" value={fmtPct(att.avg_attendance_pct)} />
              <StatTile label="Clases asistidas" value={fmtInt(att.total_classes)} />
              <StatTile label="Racha media (días)" value={fmtNum(att.avg_streak)} />
              <StatTile label="Socios con asistencia" value={fmtInt(att.members_tracked)} />
            </div>

            <Grid2>
              <ChartCard title="Distribución por estado" csv={{ name: "estado", rows: rows(data, "lifecycle_status") }}>
                <DonutMini data={rows(data, "lifecycle_status")} name="status" value="n" />
              </ChartCard>
              <ChartCard title="Segmentos (membresías abiertas)" csv={{ name: "segmentos", rows: rows(data, "segments") }}>
                <BarMini data={rows(data, "segments")} x="segmento" y="contactos" color={PALETTE[1]} />
              </ChartCard>
              <ChartCard title="Reservas por tipo de clase" csv={{ name: "reservas_clase", rows: rows(data, "bookings_by_class") }}>
                <BarMini data={rows(data, "bookings_by_class")} x="class_type" y="n" color={PALETTE[2]} />
              </ChartCard>
              <ChartCard title="Reservas por estado" csv={{ name: "reservas_estado", rows: rows(data, "bookings_by_status") }}>
                <DonutMini data={rows(data, "bookings_by_status")} name="status" value="n" />
              </ChartCard>
              <ChartCard title="Clase favorita" csv={{ name: "clase_favorita", rows: rows(data, "favorite_class_types") }}>
                <BarMini data={rows(data, "favorite_class_types")} x="class_type" y="n" color={PALETTE[5]} />
              </ChartCard>
              <ChartCard title="Franja favorita" csv={{ name: "franja_favorita", rows: rows(data, "favorite_slots") }}>
                <BarMini data={rows(data, "favorite_slots")} x="slot" y="n" color={PALETTE[7]} />
              </ChartCard>
            </Grid2>

            <ChartCard title="Etiquetas de comportamiento" csv={{ name: "tags", rows: rows(data, "tags") }}>
              <BarMini data={rows(data, "tags")} x="tag" y="n" color={PALETTE[3]} />
            </ChartCard>

            <DataTable
              title="Contactos (perfil)"
              name="perfil_contactos"
              rows={rows(data, "detail")}
              columns={[
                col("full_name", "Contacto"),
                col("status", "Estado"),
                col("lifecycle_stage", "Etapa"),
                moneyCol("lifetime_value", "LTV"),
                dateCol("joined_at", "Alta socio"),
                dateCol("last_seen_at", "Última actividad"),
              ]}
            />

            <DataTable
              title="Reservas recientes"
              name="reservas"
              rows={rows(data, "bookings_recent")}
              columns={[
                col("class_type", "Clase"),
                col("instructor", "Instructor"),
                col("status", "Estado"),
                dateCol("scheduled_at", "Fecha/hora"),
                col("contact_id", "Contacto"),
              ]}
            />
          </div>
        );
      }}
    </SectionShell>
  );
}
