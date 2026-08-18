import { measurement } from '@/content/site';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Sustituye al bloque de caso anonimizado.
 *
 * Decisión de contenido, no de maqueta: no hay resultados de cliente
 * autorizados que publicar, y el brief prohíbe expresamente las cifras sin
 * dato detrás. En vez de dejar el hueco o inventarlo, se publica el MÉTODO —
 * la definición exacta de cada métrica, la línea base y de quién es el dato.
 * Para un director de operaciones es más accionable que un porcentaje ajeno,
 * y cada línea es comprobable contra su propio piloto.
 */
export function Measurement() {
  return (
    <section id="medicion" className="scroll-mt-24 py-24 sm:py-32">
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="u-label text-ink-3">{measurement.eyebrow}</p>
            <h2 className="mt-5 text-d3 sm:text-d2">{measurement.title}</h2>
            <p className="mt-6 max-w-[46ch] text-lead text-ink-2">{measurement.intro}</p>

            <dl className="mt-10 space-y-6 border-t border-hairline pt-8">
              <div>
                <dt className="u-label text-ink-3">{measurement.baseline.label}</dt>
                <dd className="mt-2 text-util text-ink-2">{measurement.baseline.body}</dd>
              </div>
              <div>
                <dt className="u-label text-ink-3">{measurement.ownership.label}</dt>
                <dd className="mt-2 text-util text-ink-2">{measurement.ownership.body}</dd>
              </div>
            </dl>
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7">
            <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {measurement.metrics.map((metric, index) => (
                <Reveal as="li" key={metric.label} delay={(index % 2) * 80} className="h-full">
                  <div className="card flex h-full flex-col p-6">
                    {/* El hueco donde iría el resultado lo ocupa la unidad de
                        medida, y es la unidad REAL de cada métrica: dos son
                        porcentajes, una son segundos y otra son euros. Poner un
                        «%» en las cuatro sería señalizar mal el dato. */}
                    <span className="text-d3 text-steel" aria-label={`Se mide en ${metric.unitName}`}>
                      {metric.unit}
                    </span>
                    <h3 className="mt-4 text-d4 leading-tight">{metric.label}</h3>
                    <p className="mt-3 text-util text-ink-2">{metric.definition}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
