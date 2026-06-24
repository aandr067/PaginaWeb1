import { rows, useSection } from "@/lib/api";
import { ChartCard, DataTable, Grid2, SectionShell } from "@/components/panels";
import { BarMini, DonutMini, PALETTE } from "@/components/charts";
import { col, dateCol, numCol } from "./cols";

export function OperationsSection() {
  const q = useSection("/operations");
  return (
    <SectionShell
      title="Operación"
      subtitle="Ejecuciones de los flujos (audit_log), rendimiento por flujo y kill-switch por (flujo, gimnasio)."
      query={q}
    >
      {(data) => (
        <div className="space-y-4">
          <Grid2>
            <ChartCard
              title="Ejecuciones por estado"
              subtitle="ok / warn / error / skipped"
              csv={{ name: "audit_estado", rows: rows(data, "by_status") }}
            >
              <DonutMini data={rows(data, "by_status")} name="status" value="n" />
            </ChartCard>
            <ChartCard title="Ejecuciones por flujo" csv={{ name: "audit_flujo", rows: rows(data, "by_flow") }}>
              <BarMini data={rows(data, "by_flow")} x="flow_name" y="n" color={PALETTE[0]} />
            </ChartCard>
          </Grid2>

          <DataTable
            title="Rendimiento por flujo"
            subtitle="nº de ejecuciones, duración media y errores"
            name="rendimiento_flujos"
            rows={rows(data, "by_flow")}
            columns={[
              col("flow_name", "Flujo"),
              numCol("n", "Ejecuciones"),
              numCol("avg_ms", "Dur. media (ms)"),
              numCol("errores", "Errores"),
            ]}
          />

          <DataTable
            title="Control de flujos (kill-switch)"
            subtitle="enabled / dry_run efectivo por (flujo, gimnasio)"
            name="flow_settings"
            rows={rows(data, "flow_settings")}
            columns={[
              col("flow_name", "Flujo"),
              col("location_code", "Gimnasio"),
              col("enabled", "Activo"),
              col("dry_run", "Dry-run"),
            ]}
          />

          <DataTable
            title="Ejecuciones recientes (audit_log)"
            name="audit_log"
            rows={rows(data, "recent")}
            columns={[
              col("flow_name", "Flujo"),
              col("status", "Estado"),
              numCol("duration_ms", "Dur. (ms)"),
              col("message", "Mensaje"),
              dateCol("created_at", "Fecha"),
            ]}
          />
        </div>
      )}
    </SectionShell>
  );
}
