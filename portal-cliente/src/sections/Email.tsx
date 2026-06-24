import { obj, useSection } from "@/lib/api";
import { SectionShell } from "@/components/panels";
import { PALETTE } from "@/components/charts";
import { EnrollmentsPanels, MessagingPanels } from "./messaging";

export function EmailSection() {
  const q = useSection("/email");
  return (
    <SectionShell
      title="Email"
      subtitle="Embudo de entrega, eventos (aperturas/clics/rebotes) y estado de las secuencias drip."
      query={q}
    >
      {(data) => (
        <div className="space-y-4">
          <MessagingPanels data={data} color={PALETTE[4]} />
          <EnrollmentsPanels enrollments={obj(data, "enrollments")} />
        </div>
      )}
    </SectionShell>
  );
}
