import { contact } from '@/content/site';
import { ContactForm } from '@/components/ui/ContactForm';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Tres bloques apilados: formulario, tarjeta de acento pleno y tarjeta de datos.
 *
 * La tarjeta de acento usa #2563EB — no #3B82F6 — porque con texto blanco da
 * 5,17:1 y el azul claro se quedaría en 3,68:1. Es el ÚNICO sitio de la página
 * donde el acento actúa como fondo.
 *
 * En la tarjeta de datos no hay teléfono: no existe un número publicado que
 * podamos dar por bueno, y un teléfono inventado en una página que promete
 * atender llamadas sería la peor contradicción posible.
 */
export function Contact() {
  return (
    <section id="contacto" className="scroll-mt-24 py-24 sm:py-32">
      <div className="shell">
        <Reveal className="max-w-[52ch]">
          <p className="u-label text-ink-3">{contact.eyebrow}</p>
          <h2 className="mt-5 text-d3 sm:text-d2">{contact.title}</h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <ContactForm />
          </Reveal>

          <Reveal delay={80} className="flex flex-col gap-5 lg:col-span-5">
            {/* Tarjeta de acento pleno */}
            <div
              className="flex flex-1 flex-col justify-between rounded-card p-7 sm:p-9"
              style={{ backgroundColor: 'var(--color-brand-fill)' }}
            >
              <div>
                {/* .92 y no menos: sobre #2563EB, cualquier blanco por debajo
                    de ~.90 cae del 4,5:1. La jerarquía la da el tamaño. */}
                <p className="u-label" style={{ color: 'rgba(255,255,255,0.92)' }}>
                  {contact.meeting.eyebrow}
                </p>
                <h3 className="mt-6 text-d3 text-white">{contact.meeting.title}</h3>
                <p className="mt-4 max-w-[32ch]" style={{ color: 'rgba(255,255,255,0.92)' }}>
                  {contact.meeting.body}
                </p>
              </div>
              <a href={contact.meeting.cta.href} className="btn btn-on-accent mt-9 self-start">
                {contact.meeting.cta.label}
                <span aria-hidden="true">↗</span>
              </a>
            </div>

            {/* Tarjeta de datos */}
            <address className="card p-7 not-italic sm:p-9">
              <dl className="space-y-6">
                {contact.details.map((detail) => (
                  <div key={detail.label}>
                    <dt className="u-label text-ink-3">{detail.label}</dt>
                    <dd className="mt-2 font-semibold text-ink-1">
                      {'href' in detail && detail.href ? (
                        <a href={detail.href} className="underline-offset-4 hover:underline">
                          {detail.value}
                        </a>
                      ) : (
                        detail.value
                      )}
                    </dd>
                    {'note' in detail && detail.note ? (
                      <dd className="mt-1 text-util text-ink-3">{detail.note}</dd>
                    ) : null}
                  </div>
                ))}
              </dl>
            </address>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
