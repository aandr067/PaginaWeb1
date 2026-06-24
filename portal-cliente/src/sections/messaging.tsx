import type { Row } from "@/lib/api";
import { rows } from "@/lib/api";
import { ChartCard, DataTable, Grid2 } from "@/components/panels";
import { BarMini, DonutMini, LineMini, PALETTE } from "@/components/charts";
import { col, dateCol } from "./cols";

/** Paneles comunes a email / whatsapp / instagram (mensajería). */
export function MessagingPanels({ data, color = PALETTE[0] }: { data: Row; color?: string }) {
  return (
    <>
      <Grid2>
        <ChartCard
          title="Mensajes por estado"
          subtitle="queued → sent → delivered → opened → clicked → replied"
          csv={{ name: "mensajes_estado", rows: rows(data, "by_status") }}
        >
          <BarMini data={rows(data, "by_status")} x="status" y="n" color={color} />
        </ChartCard>
        <ChartCard title="Envíos por día" csv={{ name: "envios_por_dia", rows: rows(data, "timeseries") }}>
          <LineMini data={rows(data, "timeseries")} x="dia" y="n" color={color} />
        </ChartCard>
        <ChartCard title="Por plantilla" csv={{ name: "por_plantilla", rows: rows(data, "by_template") }}>
          <BarMini data={rows(data, "by_template")} x="template_key" y="n" color={PALETTE[5]} />
        </ChartCard>
        <ChartCard
          title="Eventos de mensaje"
          subtitle="aperturas, clics, rebotes, quejas (webhooks del ESP/Meta)"
          csv={{ name: "eventos", rows: rows(data, "events_by_type") }}
        >
          <BarMini data={rows(data, "events_by_type")} x="event_type" y="n" color={PALETTE[2]} />
        </ChartCard>
      </Grid2>

      <DataTable
        title="Mensajes recientes"
        name="mensajes"
        rows={rows(data, "detail")}
        columns={[
          col("status", "Estado"),
          col("template_key", "Plantilla"),
          col("sequence_key", "Secuencia"),
          col("campaign_id", "Campaña"),
          dateCol("sent_at", "Enviado"),
          dateCol("created_at", "Creado"),
        ]}
      />
    </>
  );
}

/** Estado de los enrolamientos en secuencias (drips P6) — email/whatsapp. */
export function EnrollmentsPanels({ enrollments }: { enrollments: Row }) {
  return (
    <Grid2>
      <ChartCard title="Secuencias por estado" csv={{ name: "secuencias_estado", rows: rows(enrollments, "by_status") }}>
        <DonutMini data={rows(enrollments, "by_status")} name="status" value="n" />
      </ChartCard>
      <DataTable
        title="Secuencias activas"
        name="secuencias"
        rows={rows(enrollments, "by_sequence")}
        columns={[
          col("sequence_key", "Secuencia"),
          col("status", "Estado"),
          col("n", "Inscritos"),
        ]}
      />
    </Grid2>
  );
}
