import { obj, rows, useSection } from "@/lib/api";
import { ChartCard, DataTable, Grid2, SectionShell } from "@/components/panels";
import { DonutMini, PALETTE } from "@/components/charts";
import { EnrollmentsPanels, MessagingPanels } from "./messaging";
import { col, dateCol } from "./cols";

export function WhatsappSection() {
  const q = useSection("/whatsapp");
  return (
    <SectionShell
      title="WhatsApp"
      subtitle="Mensajería, estado de aprobación de plantillas (Meta), salud/quality del número y secuencias."
      query={q}
    >
      {(data) => (
        <div className="space-y-4">
          <MessagingPanels data={data} color={PALETTE[1]} />

          <Grid2>
            <ChartCard
              title="Plantillas por estado (Meta)"
              subtitle="Catálogo global: pending / approved / rejected / paused / disabled"
              csv={{ name: "wa_plantillas_estado", rows: rows(data, "templates_by_status") }}
            >
              <DonutMini data={rows(data, "templates_by_status")} name="meta_status" value="n" />
            </ChartCard>
            <DataTable
              title="Salud del número (quality rating)"
              name="wa_number_health"
              rows={rows(data, "number_health")}
              columns={[
                col("phone_id", "Phone ID"),
                col("quality_rating", "Quality"),
                col("messaging_status", "Estado"),
                dateCol("checked_at", "Revisado"),
              ]}
            />
          </Grid2>

          <DataTable
            title="Catálogo de plantillas WhatsApp"
            subtitle="Global (no por gimnasio): clave, versión, locale, categoría y estado Meta"
            name="wa_templates"
            rows={rows(data, "templates")}
            columns={[
              col("key", "Clave"),
              col("version", "Versión"),
              col("locale", "Locale"),
              col("category", "Categoría"),
              col("meta_status", "Estado Meta"),
              dateCol("approved_at", "Aprobada"),
            ]}
          />

          <EnrollmentsPanels enrollments={obj(data, "enrollments")} />
        </div>
      )}
    </SectionShell>
  );
}
