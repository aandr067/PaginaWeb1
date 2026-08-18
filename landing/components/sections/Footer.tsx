import { footer } from '@/content/site';

/**
 * Tres columnas: identidad legal, navegación y legal.
 *
 * Sin CIF: no hay ninguno publicado en el sitio actual y no se inventa un
 * identificador fiscal. Sin «Política de IA»: esa página todavía no existe, y
 * enlazar a un 404 desde el pie es peor que no enlazarla.
 */
export function Footer() {
  return (
    <footer className="border-t border-hairline py-14">
      <div className="shell">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <h2 className="u-label text-ink-3">{footer.legal.label}</h2>
            <ul className="mt-5 space-y-1.5 text-util text-ink-2">
              {footer.legal.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="u-label text-ink-3">{footer.nav.label}</h2>
            <ul className="mt-5 space-y-1.5">
              {footer.nav.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-util text-ink-2 transition-colors duration-150 hover:text-ink-1"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="u-label text-ink-3">{footer.policies.label}</h2>
            <ul className="mt-5 space-y-1.5">
              {footer.policies.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-util text-ink-2 transition-colors duration-150 hover:text-ink-1"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-hairline pt-7 text-util text-ink-3">{footer.copyright}</p>
      </div>
    </footer>
  );
}
