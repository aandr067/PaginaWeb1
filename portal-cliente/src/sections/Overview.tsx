import {
  AlertTriangle,
  HeartPulse,
  Mail,
  Megaphone,
  ShieldOff,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { obj, rows, useSection } from "@/lib/api";
import { fmtInt } from "@/lib/format";
import { ChartCard, Grid2, KpiCard, KpiGrid, SectionShell } from "@/components/panels";
import { BarMini, LineMini, PALETTE } from "@/components/charts";

const STAGE: Record<string, string> = {
  "1_lead": "Lead",
  "2_trial": "Trial",
  "3_active": "Activo / VIP",
  "4_at_risk": "En riesgo",
  "5_churned": "Baja / React.",
};

export function OverviewSection() {
  const q = useSection("/overview");
  return (
    <SectionShell
      title="Resumen ejecutivo"
      subtitle="Visión global del gimnasio seleccionado: ciclo de vida, actividad y mensajería."
      query={q}
    >
      {(data) => {
        const k = obj(data, "kpis");
        const funnel = rows(data, "funnel").map((r) => ({
          stage: STAGE[String(r.stage)] ?? String(r.stage),
          n: r.n,
        }));
        return (
          <div className="space-y-4">
            <KpiGrid>
              <KpiCard label="Contactos" value={fmtInt(k.contactos_total)} icon={<Users className="h-4 w-4" />} tone="brand" />
              <KpiCard label="Leads" value={fmtInt(k.leads)} icon={<UserPlus className="h-4 w-4" />} />
              <KpiCard label="Trials" value={fmtInt(k.trial)} />
              <KpiCard label="Socios activos" value={fmtInt(k.active)} icon={<UserCheck className="h-4 w-4" />} tone="success" />
              <KpiCard label="En riesgo" value={fmtInt(k.at_risk)} icon={<HeartPulse className="h-4 w-4" />} tone="warning" />
              <KpiCard label="Bajas" value={fmtInt(k.churned)} tone="danger" />
              <KpiCard label="VIP" value={fmtInt(k.vip)} tone="info" />
              <KpiCard label="Pend. fusión" value={fmtInt(k.needs_merge)} />
              <KpiCard label="Alertas" value={fmtInt(k.alertas)} icon={<AlertTriangle className="h-4 w-4" />} tone="warning" />
              <KpiCard label="Campañas activas" value={fmtInt(k.campanas_activas)} icon={<Megaphone className="h-4 w-4" />} tone="info" />
              <KpiCard label="Mensajes enviados" value={fmtInt(k.mensajes_enviados)} icon={<Mail className="h-4 w-4" />} />
              <KpiCard label="Supresiones" value={fmtInt(k.supresiones)} icon={<ShieldOff className="h-4 w-4" />} tone="danger" />
              <KpiCard label="Consent. email" value={fmtInt(k.consent_email)} tone="success" />
              <KpiCard label="Consent. WhatsApp" value={fmtInt(k.consent_whatsapp)} tone="success" />
            </KpiGrid>

            <Grid2>
              <ChartCard
                title="Embudo de ciclo de vida"
                subtitle="Contactos por etapa (estado actual)"
                csv={{ name: "embudo", rows: funnel }}
              >
                <BarMini data={funnel} x="stage" y="n" />
              </ChartCard>
              <ChartCard
                title="Nuevos leads en el tiempo"
                subtitle="Altas de contacto por día (rango seleccionado)"
                csv={{ name: "leads_por_dia", rows: rows(data, "leads_timeseries") }}
              >
                <LineMini data={rows(data, "leads_timeseries")} x="dia" y="n" />
              </ChartCard>
            </Grid2>

            <ChartCard
              title="Mensajes enviados en el tiempo"
              subtitle="Envíos por día en todos los canales (rango seleccionado)"
              csv={{ name: "mensajes_por_dia", rows: rows(data, "messages_timeseries") }}
            >
              <LineMini data={rows(data, "messages_timeseries")} x="dia" y="n" color={PALETTE[1]} />
            </ChartCard>
          </div>
        );
      }}
    </SectionShell>
  );
}
