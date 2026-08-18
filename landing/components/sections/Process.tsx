import { process } from '@/content/site';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Línea de tiempo: horizontal en escritorio, vertical en móvil.
 *
 * Aquí la numeración sí es información — es una secuencia real y las fases no
 * se pueden reordenar.
 *
 * Cada fase declara tres cosas: cuánto dura, qué te entrega y CUÁNTAS HORAS DE
 * TU EQUIPO cuesta. Ese último dato es el que un director necesita para decidir
 * y el que prácticamente nadie publica.
 */
export function Process() {
  return (
    <section id="proceso" className="scroll-mt-24 py-24 sm:py-32">
      <div className="shell">
        <Reveal className="max-w-[52ch]">
          <p className="u-label text-ink-3">{process.eyebrow}</p>
          <h2 className="mt-5 text-d3 sm:text-d2">{process.title}</h2>
          <p className="mt-5 text-lead text-ink-2">{process.intro}</p>
        </Reveal>

        {/* La línea de tiempo es literalmente una línea. En escritorio va aquí,
            continua de lado a lado: cuatro bordes superiores separados por el
            gutter se leerían como cuatro columnas, no como una secuencia. En
            móvil desaparece y cada fase recupera su propio filete. */}
        <div className="mt-14 hidden border-t border-hairline lg:block" aria-hidden="true" />

        <ol className="mt-14 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:mt-0 lg:grid-cols-4">
          {process.phases.map((phase, index) => (
            <Reveal as="li" key={phase.number} delay={index * 70}>
              <div className="border-t border-hairline pt-6 lg:border-t-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="u-label tabular text-brand-ink">{phase.number}</span>
                  <span className="u-label tabular text-ink-3">{phase.duration}</span>
                </div>

                <h3 className="mt-5 text-d4">{phase.title}</h3>
                <p className="mt-3 text-ink-2">{phase.body}</p>

                <dl className="mt-6 space-y-4">
                  <div>
                    <dt className="u-label text-ink-3">Entregable</dt>
                    <dd className="mt-1.5 text-util text-ink-2">{phase.deliverable}</dd>
                  </div>
                  <div>
                    <dt className="u-label text-ink-3">Tu equipo</dt>
                    <dd className="mt-1.5 text-util text-ink-2">{phase.cost}</dd>
                  </div>
                </dl>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
