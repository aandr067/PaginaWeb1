import { hero } from '@/content/site';
import { CallRegister } from '@/components/ui/CallRegister';

/**
 * Hero. Retícula de 12 columnas: la tesis ocupa 6, el registro de llamadas 5.
 *
 * No hay banda de cifras bajo el titular. Se retiró a propósito: no existe
 * ninguna métrica operativa verificable que publicar, y un contador sin dato
 * detrás es exactamente lo que esta página no puede permitirse. En su lugar,
 * una hairline con el índice de alcance — enumera, no afirma.
 */
export function Hero() {
  return (
    <section id="top" className="relative pt-[calc(var(--nav-h)+72px)] pb-16 sm:pb-20">
      <div className="shell">
        <div className="grid grid-cols-1 items-start gap-x-8 gap-y-14 lg:grid-cols-12">
          <div className="stagger lg:col-span-6">
            <p className="u-label text-ink-3" style={{ '--i': 0 } as React.CSSProperties}>
              {hero.eyebrow}
            </p>

            <h1
              className="mt-6 text-[clamp(2.5rem,7.2vw,4.5rem)] leading-[1.03]"
              style={{ '--i': 1 } as React.CSSProperties}
            >
              {hero.headline[0]}
              <br />
              <span className="text-ink-2">{hero.headline[1]}</span>
            </h1>

            <p
              className="mt-7 max-w-[46ch] text-lead text-ink-2"
              style={{ '--i': 2 } as React.CSSProperties}
            >
              {hero.subhead}
            </p>

            <div
              className="mt-9 flex flex-wrap items-center gap-3"
              style={{ '--i': 3 } as React.CSSProperties}
            >
              <a href={hero.primaryCta.href} className="btn btn-primary">
                {hero.primaryCta.label}
              </a>
              <a href={hero.secondaryCta.href} className="btn btn-ghost">
                {hero.secondaryCta.label}
                <span aria-hidden="true">›</span>
              </a>
            </div>
          </div>

          {/* Contenedor `stagger` propio: el registro entra el último de la
              secuencia, en el paso 4 (240 ms). */}
          <div className="stagger lg:col-span-6 lg:col-start-7">
            <div style={{ '--i': 4 } as React.CSSProperties}>
              <CallRegister />
            </div>
          </div>
        </div>
      </div>

      <div className="shell mt-16 sm:mt-20">
        <ul className="flex flex-wrap gap-x-8 gap-y-3 border-t border-hairline pt-5">
          {hero.scope.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="u-label text-ink-3 transition-colors duration-150 hover:text-ink-1"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
