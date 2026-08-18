import { compliance } from '@/content/site';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Franja de baja altura. Texto pequeño, alineado a la retícula, sin sellos ni
 * insignias: un sello de confianza que no emite nadie es decoración.
 */
export function Compliance() {
  return (
    <section aria-labelledby="cumplimiento-titulo" className="py-16 sm:py-20">
      <div className="shell">
        <Reveal>
          <h2 id="cumplimiento-titulo" className="u-label text-ink-3">
            {compliance.eyebrow}
          </h2>
          <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-7 border-t border-hairline pt-8 sm:grid-cols-2 lg:grid-cols-5">
            {compliance.items.map((item) => (
              <div key={item.label}>
                <dt className="u-label text-ink-3">{item.label}</dt>
                <dd className="mt-2 text-util text-ink-2">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
