'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Revelado al hacer scroll. Un IntersectionObserver por bloque, que se
 * desconecta en cuanto entra: sin librería de animación y sin listener de
 * scroll permanente.
 *
 * Si el usuario pide movimiento reducido, el contenido se marca como visible
 * desde el primer render y nunca llega a animarse.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'article';
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // El tipo de `ref` depende del tag; con la unión que aceptamos es seguro.
      ref={ref as never}
      data-in={shown ? 'true' : 'false'}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
