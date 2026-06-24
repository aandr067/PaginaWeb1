import { Euro, HeartPulse, Megaphone, TrendingUp, UserCheck, UserPlus, Users } from "lucide-react";
import { useResults } from "@/lib/api";
import { fmtInt, fmtMoney } from "@/lib/format";
import { ChartCard, Grid2, KpiCard, KpiGrid, SectionShell } from "@/components/panels";
import { LineMini, PALETTE } from "@/components/charts";

export function ResultadosSection() {
  const q = useResults();
  return (
    <SectionShell
      title="Resultados"
      subtitle="Lo que generamos para tu cadena en el periodo. Cambia de sede o rango arriba."
      query={q}
    >
      {(data) => {
        const k = data.kpis;
        return (
          <div className="space-y-4">
            <KpiGrid>
              <KpiCard label="Leads captados" value={fmtInt(k.leads_nuevos)} icon={<UserPlus className="h-4 w-4" />} tone="brand" hint="nuevos en el periodo" />
              <KpiCard label="Leads abiertos" value={fmtInt(k.leads)} icon={<Users className="h-4 w-4" />} />
              <KpiCard label="Socios activos" value={fmtInt(k.socios_activos)} icon={<UserCheck className="h-4 w-4" />} tone="success" />
              <KpiCard label="En riesgo" value={fmtInt(k.en_riesgo)} icon={<HeartPulse className="h-4 w-4" />} tone="warning" />
              <KpiCard label="Bajas" value={fmtInt(k.bajas)} tone="danger" />
              <KpiCard label="VIP" value={fmtInt(k.vip)} tone="info" />
              <KpiCard label="Conversiones" value={fmtInt(k.conversiones)} icon={<TrendingUp className="h-4 w-4" />} tone="success" hint="atribuidas a campañas" />
              <KpiCard label="Ingreso atribuido" value={fmtMoney(k.ingreso_atribuido)} icon={<Euro className="h-4 w-4" />} />
              <KpiCard label="Mensajes enviados" value={fmtInt(k.mensajes_enviados)} icon={<Megaphone className="h-4 w-4" />} />
              {/* Métricas aún sin fuente: se muestran como pendientes, no se inventan. */}
              {data.pending.map((p) => (
                <KpiCard key={p.key} label={p.label} value="—" hint={`Pendiente · ${p.phase}`} />
              ))}
            </KpiGrid>

            <Grid2>
              <ChartCard
                title="Leads en el tiempo"
                subtitle="Altas por día (rango seleccionado)"
                csv={{ name: "leads_por_dia", rows: data.leads_timeseries }}
              >
                <LineMini data={data.leads_timeseries} x="dia" y="n" />
              </ChartCard>
              <ChartCard
                title="Mensajes en el tiempo"
                subtitle="Envíos por día en todos los canales"
                csv={{ name: "mensajes_por_dia", rows: data.messages_timeseries }}
              >
                <LineMini data={data.messages_timeseries} x="dia" y="n" color={PALETTE[1]} />
              </ChartCard>
            </Grid2>
          </div>
        );
      }}
    </SectionShell>
  );
}
