import { services } from '@/content/site';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Cuatro servicios en retícula 2×2.
 *
 * El identificador (S/01…) es tipográfico, no un icono: la marca visual de la
 * tarjeta es la propia tipografía de utilidad, consistente en las cuatro.
 *
 * La última línea de cada tarjeta es un LÍMITE, no una capacidad. Declarar lo
 * que el sistema no hace es lo que separa esta página de la de cualquier otra
 * consultora, y es el dato que más rápido genera confianza en un interlocutor
 * al que ya le han vendido de más.
 */
export function Services() {
  return (
    <section id="servicios" className="scroll-mt-24 py-24 sm:py-32">
      <div className="shell">
        <Reveal className="max-w-[52ch]">
          <p className="u-label text-ink-3">{services.eyebrow}</p>
          <h2 className="mt-5 text-d3 sm:text-d2">{services.title}</h2>
          <p className="mt-5 text-lead text-ink-2">{services.intro}</p>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {services.items.map((service, index) => (
            <Reveal as="li" key={service.id} delay={(index % 2) * 80} className="h-full">
              <article className="card flex h-full flex-col p-7 sm:p-9">
                <div className="flex items-baseline gap-4">
                  <span className="u-label tabular text-brand-ink">{service.id}</span>
                  <span className="u-label text-ink-3">{service.kicker}</span>
                </div>

                <h3 className="mt-6 text-d4">{service.title}</h3>

                <div className="mt-4 space-y-2 text-ink-2">
                  {service.body.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>

                <ul className="mt-7 space-y-3 border-t border-hairline pt-6">
                  {service.capabilities.map((capability) => (
                    <li key={capability} className="flex gap-3 text-util text-ink-2">
                      <span aria-hidden="true" className="mt-2 h-px w-3 flex-none bg-steel" />
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 flex gap-3 text-util text-ink-3">
                  <span className="u-label flex-none text-steel">Límite</span>
                  <span>{service.limit}</span>
                </p>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
