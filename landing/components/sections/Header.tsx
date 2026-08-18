'use client';

import { useEffect, useState } from 'react';
import { nav, site } from '@/content/site';

/**
 * Barra fija. Transparente arriba; al desplazarse pasa a superficie sólida con
 * desenfoque y aparece la hairline inferior. El estado se calcula con un
 * listener pasivo y un umbral único, sin recalcular estilos en cada píxel.
 */
export function Header() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-200"
      style={{
        height: 'var(--nav-h)',
        backgroundColor: solid ? 'rgba(7,9,14,0.82)' : 'transparent',
        backdropFilter: solid ? 'blur(14px) saturate(140%)' : 'none',
        WebkitBackdropFilter: solid ? 'blur(14px) saturate(140%)' : 'none',
        borderBottom: `1px solid ${solid ? 'var(--color-hairline)' : 'transparent'}`,
      }}
    >
      <div className="shell flex h-full items-center justify-between gap-6">
        <a href="#top" className="u-label text-ink-1" aria-label={`${site.brand} — inicio`}>
          {site.brand}
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-util text-ink-2 transition-colors duration-150 hover:text-ink-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a href={nav.cta.href} className="btn btn-ghost text-util">
          {nav.cta.label}
        </a>
      </div>
    </header>
  );
}
