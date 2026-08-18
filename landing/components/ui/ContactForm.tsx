'use client';

import { useId, useRef, useState } from 'react';
import { contact } from '@/content/site';

const { form } = contact;

/** Buzones personales: no permiten verificar con quién se está hablando. */
const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'hotmail.es',
  'outlook.com',
  'outlook.es',
  'live.com',
  'msn.com',
  'yahoo.com',
  'yahoo.es',
  'icloud.com',
  'me.com',
  'protonmail.com',
  'proton.me',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

type FieldName = 'name' | 'email' | 'company' | 'clubs' | 'interest' | 'message';
type Errors = Partial<Record<FieldName, string>>;
type Status = 'idle' | 'sending' | 'success' | 'error';

type Values = {
  name: string;
  email: string;
  company: string;
  clubs: string;
  interest: string[];
  message: string;
};

const EMPTY: Values = { name: '', email: '', company: '', clubs: '', interest: [], message: '' };

function validate(values: Values): Errors {
  const errors: Errors = {};

  if (values.name.trim().length < 3 || !values.name.trim().includes(' ')) {
    errors.name = form.errors.name;
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = form.errors.emailEmpty;
  } else if (!EMAIL_RE.test(email)) {
    errors.email = form.errors.emailFormat;
  } else if (PERSONAL_EMAIL_DOMAINS.has(email.split('@')[1]!.toLowerCase())) {
    errors.email = form.errors.emailPersonal;
  }

  if (!values.company.trim()) errors.company = form.errors.company;
  if (!values.clubs) errors.clubs = form.errors.clubs;
  if (values.interest.length === 0) errors.interest = form.errors.interest;
  if (values.message.trim().length < 20) errors.message = form.errors.message;

  return errors;
}

export function ContactForm() {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');

  const fieldId = (name: string) => `${uid}-${name}`;
  const errorId = (name: string) => `${uid}-${name}-error`;

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    // El error se retira en cuanto el campo deja de estar mal, no al enviar.
    setErrors((current) => (current[key as FieldName] ? { ...current, [key]: undefined } : current));
  };

  const toggleInterest = (option: string) => {
    setValues((current) => ({
      ...current,
      interest: current.interest.includes(option)
        ? current.interest.filter((item) => item !== option)
        : [...current.interest, option],
    }));
    setErrors((current) => (current.interest ? { ...current, interest: undefined } : current));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;

    const found = validate(values);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // Lleva el foco al primer campo con error para que se pueda corregir sin
      // buscarlo, también con teclado o lector de pantalla.
      const first = Object.keys(found)[0]!;
      const node = formRef.current?.querySelector<HTMLElement>(`[name="${first}"], #${CSS.escape(fieldId(first))}`);
      node?.focus();
      return;
    }

    setStatus('sending');

    try {
      const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT || '/api/contacto';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: values.name.trim(),
          email: values.email.trim(),
          empresa: values.company.trim(),
          clubes: values.clubs,
          servicios: values.interest,
          mensaje: values.message.trim(),
          origen: 'landing-gimnasios',
        }),
      });

      // Comprobar `response.ok` no basta: un servidor estático devuelve 200 con
      // HTML ante cualquier POST y el lead se perdería en silencio. El endpoint
      // real confirma con { ok: true }, y eso es lo único que aceptamos.
      const data: unknown = await response.json().catch(() => null);
      const ok =
        response.ok && typeof data === 'object' && data !== null && (data as { ok?: unknown }).ok === true;

      if (!ok) throw new Error('Respuesta no confirmada por el endpoint');

      setStatus('success');
      setValues(EMPTY);
    } catch {
      setStatus('error');
    }
  }

  const invalid = (name: FieldName) => Boolean(errors[name]);
  const describedBy = (name: FieldName) => (errors[name] ? errorId(name) : undefined);

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="card p-7 sm:p-10">
      {/* SOBRE TI */}
      <fieldset className="border-0 p-0">
        <legend className="u-label text-ink-3">{form.groups.about}</legend>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={fieldId('name')} className="u-label text-ink-2">
              {form.labels.name}
            </label>
            <input
              id={fieldId('name')}
              name="name"
              type="text"
              autoComplete="name"
              className="field mt-2.5"
              value={values.name}
              onChange={(event) => set('name', event.target.value)}
              aria-invalid={invalid('name')}
              aria-describedby={describedBy('name')}
            />
            {errors.name && (
              <span id={errorId('name')} className="field-error">
                {errors.name}
              </span>
            )}
          </div>

          <div>
            <label htmlFor={fieldId('email')} className="u-label text-ink-2">
              {form.labels.email}
            </label>
            <input
              id={fieldId('email')}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className="field mt-2.5"
              value={values.email}
              onChange={(event) => set('email', event.target.value)}
              aria-invalid={invalid('email')}
              aria-describedby={describedBy('email')}
            />
            {errors.email && (
              <span id={errorId('email')} className="field-error">
                {errors.email}
              </span>
            )}
          </div>
        </div>
      </fieldset>

      {/* TU EMPRESA */}
      <fieldset className="mt-10 border-0 p-0">
        <legend className="u-label text-ink-3">{form.groups.company}</legend>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={fieldId('company')} className="u-label text-ink-2">
              {form.labels.company}
            </label>
            <input
              id={fieldId('company')}
              name="company"
              type="text"
              autoComplete="organization"
              className="field mt-2.5"
              value={values.company}
              onChange={(event) => set('company', event.target.value)}
              aria-invalid={invalid('company')}
              aria-describedby={describedBy('company')}
            />
            {errors.company && (
              <span id={errorId('company')} className="field-error">
                {errors.company}
              </span>
            )}
          </div>

          <div>
            <label htmlFor={fieldId('clubs')} className="u-label text-ink-2">
              {form.labels.clubs}
            </label>
            <select
              id={fieldId('clubs')}
              name="clubs"
              className="field mt-2.5"
              value={values.clubs}
              onChange={(event) => set('clubs', event.target.value)}
              aria-invalid={invalid('clubs')}
              aria-describedby={describedBy('clubs')}
            >
              <option value="">Selecciona un tramo</option>
              {form.clubOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.clubs && (
              <span id={errorId('clubs')} className="field-error">
                {errors.clubs}
              </span>
            )}
          </div>
        </div>
      </fieldset>

      {/* DETALLES DEL PROYECTO */}
      <fieldset className="mt-10 border-0 p-0">
        <legend className="u-label text-ink-3">{form.groups.project}</legend>

        <div className="mt-6">
          <fieldset className="border-0 p-0" aria-describedby={describedBy('interest')}>
            <legend className="u-label text-ink-2">{form.labels.interest}</legend>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {form.interestOptions.map((option) => (
                <label key={option} className="chip">
                  <input
                    type="checkbox"
                    name="interest"
                    value={option}
                    checked={values.interest.includes(option)}
                    onChange={() => toggleInterest(option)}
                    className="sr-only"
                  />
                  <span aria-hidden="true" className="chip-box" />
                  {option}
                </label>
              ))}
            </div>
            {errors.interest && (
              <span id={errorId('interest')} className="field-error">
                {errors.interest}
              </span>
            )}
          </fieldset>
        </div>

        <div className="mt-6">
          <label htmlFor={fieldId('message')} className="u-label text-ink-2">
            {form.labels.message}
          </label>
          <textarea
            id={fieldId('message')}
            name="message"
            rows={5}
            className="field mt-2.5"
            placeholder={form.messagePlaceholder}
            value={values.message}
            onChange={(event) => set('message', event.target.value)}
            aria-invalid={invalid('message')}
            aria-describedby={describedBy('message')}
          />
          {errors.message && (
            <span id={errorId('message')} className="field-error">
              {errors.message}
            </span>
          )}
        </div>
      </fieldset>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-7">
        {/* Región viva única: anuncia tanto el resultado del envío como el
            resumen de validación, sin duplicar avisos. */}
        <p role="status" aria-live="polite" className="text-util text-ink-2">
          {status === 'success' && form.states.success}
          {status === 'error' && <span className="text-danger">{form.states.error}</span>}
          {status !== 'success' && status !== 'error' && Object.keys(errors).length > 0 && (
            <span className="text-danger">{form.errors.summary}</span>
          )}
        </p>

        <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? form.states.sending : form.submit}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </form>
  );
}
