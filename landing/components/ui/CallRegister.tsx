'use client';

import { useEffect, useRef, useState } from 'react';
import { callRegister, type CallRow } from '@/content/site';

/**
 * ELEMENTO FIRMA — el registro de llamadas.
 *
 * No es una transcripción decorativa: reproduce el formato de log de centralita
 * (CDR) que un director de operaciones ya sabe leer. Las horas caen entre las
 * 21:00 y las 22:30, la franja en la que el mostrador está vacío — ahí está la
 * tesis de la página, sin necesidad de explicarla.
 *
 * Las filas cerradas por el agente llevan filete de acento; las derivadas a una
 * persona van apagadas y sin filete. La leyenda deja claro, de forma visible,
 * que es un ejemplo de formato y no una métrica de cliente.
 */

const ROW_INTERVAL_MS = 1100;

export function CallRegister({ rows = callRegister.rows }: { rows?: readonly CallRow[] }) {
  const [visible, setVisible] = useState(rows.length);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(rows.length);
      return;
    }

    setVisible(0);
    timer.current = setInterval(() => {
      setVisible((current) => {
        if (current >= rows.length) {
          if (timer.current) clearInterval(timer.current);
          return current;
        }
        return current + 1;
      });
    }, ROW_INTERVAL_MS);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [rows.length]);

  return (
    <div className="card overflow-hidden">
      {/* Apilado en móvil: a 360 px las dos etiquetas en versalitas con
          tracking amplio no caben en una fila sin partirse en tres líneas cada
          una. `whitespace-nowrap` las mantiene enteras en ambos casos. */}
      <div className="flex flex-col gap-1 border-b border-hairline px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 sm:px-6">
        <p className="u-label whitespace-nowrap text-ink-2">{callRegister.label}</p>
        <p className="u-label whitespace-nowrap text-ink-3">{callRegister.caption}</p>
      </div>

      {/* El log completo está siempre en el DOM: la animación solo controla la
          opacidad, así que un lector de pantalla lee las ocho filas de una vez
          en lugar de recibir ocho actualizaciones sucesivas. */}
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Ejemplo del formato de registro de llamadas que recibe el cliente. Datos ilustrativos, no
          corresponden a ningún club real.
        </caption>
        <thead>
          <tr>
            {callRegister.columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="u-label px-5 pt-4 pb-2 font-medium text-ink-3 sm:px-6"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const byAgent = row.handled === 'agent';
            return (
              <tr
                key={`${row.time}-${row.club}`}
                aria-hidden={index >= visible ? 'true' : undefined}
                className="align-top transition-opacity duration-500"
                style={{ opacity: index < visible ? 1 : 0 }}
              >
                <td className="relative py-2.5 pr-3 pl-5 text-util text-ink-3 sm:pl-6">
                  {/* Filete de acento: marca de gestión cerrada sin persona. */}
                  <span
                    aria-hidden="true"
                    className="absolute top-2.5 bottom-2.5 left-0 w-[2px] sm:left-1"
                    style={{ background: byAgent ? 'var(--color-brand-ink)' : 'transparent' }}
                  />
                  <time>{row.time}</time>
                </td>
                <td className="py-2.5 pr-3 text-util text-ink-1">{row.club}</td>
                <td className="py-2.5 pr-3 text-util text-ink-2">{row.reason}</td>
                <td
                  className={`py-2.5 pr-5 text-util sm:pr-6 ${byAgent ? 'text-ink-2' : 'text-ink-3'}`}
                >
                  {row.outcome}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="border-t border-hairline px-5 py-3 text-util text-ink-3 sm:px-6">
        <span aria-hidden="true" className="mr-2 inline-block h-[2px] w-3 align-middle bg-brand-ink" />
        Cerrada por el agente · sin filete: derivada a una persona
      </p>
    </div>
  );
}
