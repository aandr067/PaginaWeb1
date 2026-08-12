#!/usr/bin/env node
/**
 * Presupuesto de rendimiento — APF Tech
 *
 * Mide el peso real que se sirve (Brotli para texto, tal cual para binarios) y
 * falla con codigo 1 si algo se pasa del limite. Se ejecuta en el build de
 * Netlify, asi que un despliegue que engorde el sitio por encima de lo acordado
 * no llega a publicarse.
 *
 * Uso:  node scripts/perf-budget.mjs [--json]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JSON_OUT = process.argv.includes('--json');

const br = (buf) =>
  zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length;

const KB = (n) => n / 1024;
const read = (rel) => fs.readFileSync(path.join(ROOT, rel));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

/* ------------------------------------------------------------------ *
 * Limites. Fijados con un margen aproximado del 25 % sobre el valor
 * medido tras la Fase 5, para que absorban crecimiento normal pero
 * salte la alarma ante una regresion de verdad.
 *
 * 2026-08-11: el consentimiento de cookies (obligatorio por el art. 22.2
 * LSSI-CE, no es opcional) suma 1,5 KB de CSS y 4,6 KB de JS en todas las
 * paginas. Los tres limites afectados se recalculan sobre la nueva linea
 * base manteniendo el mismo margen del 25 %; el resto no se toca.
 * ------------------------------------------------------------------ */
const BUDGET = {
  'CSS (brotli)': 17,
  'JS de la portada (brotli)': 21,
  'JS de una subpagina (brotli)': 15,
  'HTML de la portada (brotli)': 12,
  'HTML de una subpagina (brotli)': 8,
  'Fuentes (total)': 100,
  'Heroe AVIF (variante mayor)': 52,
  'Heroe WebP (respaldo mayor)': 80,
  'Peso total de la portada': 210,
};

const checks = [];
const add = (name, kb, detail) =>
  checks.push({ name, kb: +kb.toFixed(1), budget: BUDGET[name], detail, ok: kb <= BUDGET[name] });

/* CSS */
add('CSS (brotli)', KB(br(read('css/styles.css'))), 'css/styles.css');

/* JS */
const jsCore = br(read('js/core.js'));
const jsHome = exists('js/home.js') ? br(read('js/home.js')) : 0;
const jsI18n = br(read('js/i18n.js'));
const jsCookies = exists('js/cookies.js') ? br(read('js/cookies.js')) : 0;
add('JS de la portada (brotli)', KB(jsCore + jsHome + jsI18n + jsCookies), 'core + home + i18n + cookies');
add('JS de una subpagina (brotli)', KB(jsCore + jsI18n + jsCookies), 'core + i18n + cookies');

/* HTML */
add('HTML de la portada (brotli)', KB(br(read('index.html'))), 'index.html');
const subs = fs.readdirSync(path.join(ROOT, 'soluciones')).filter((f) => f.endsWith('.html'));
const worstSub = subs
  .map((f) => ({ f, n: br(read('soluciones/' + f)) }))
  .sort((a, b) => b.n - a.n)[0];
add('HTML de una subpagina (brotli)', KB(worstSub.n), 'la mayor: ' + worstSub.f);

/* Fuentes */
const fonts = fs.readdirSync(path.join(ROOT, 'fonts')).filter((f) => f.endsWith('.woff2'));
const fontBytes = fonts.reduce((a, f) => a + fs.statSync(path.join(ROOT, 'fonts', f)).size, 0);
add('Fuentes (total)', KB(fontBytes), fonts.length + ' ficheros');

/* Imagen del heroe. AVIF es lo que recibe la practica totalidad de visitantes;
   WebP solo lo sirve <picture> a quien no soporte AVIF, y por eso tiene su
   propio limite, mas holgado. */
const heroBy = (ext) =>
  fs
    .readdirSync(path.join(ROOT, 'img'))
    .filter((f) => new RegExp('^robot-\\d+\\.' + ext + '$').test(f))
    .map((f) => ({ f, n: fs.statSync(path.join(ROOT, 'img', f)).size }))
    .sort((a, b) => b.n - a.n)[0];
const heroAvif = heroBy('avif');
const heroWebp = heroBy('webp');
add('Heroe AVIF (variante mayor)', KB(heroAvif.n), heroAvif.f);
add('Heroe WebP (respaldo mayor)', KB(heroWebp.n), heroWebp.f);

/* Peso total de la portada: lo que descarga un visitante nuevo */
const homeTotal =
  br(read('index.html')) +
  br(read('css/styles.css')) +
  jsCore + jsHome + jsI18n + jsCookies +
  fontBytes +
  fs.statSync(path.join(ROOT, 'img/robot-736.avif')).size +
  fs.statSync(path.join(ROOT, 'img/logo-apf.avif')).size;
add('Peso total de la portada', KB(homeTotal), 'html+css+js+fuentes+imagenes');

const failed = checks.filter((c) => !c.ok);

if (JSON_OUT) {
  console.log(JSON.stringify({ checks, failed: failed.length }, null, 2));
} else {
  console.log('\nPresupuesto de rendimiento — APF Tech\n');
  const w = Math.max(...checks.map((c) => c.name.length));
  for (const c of checks) {
    const bar = c.ok ? 'OK  ' : 'FALLA';
    console.log(
      `  ${bar} ${c.name.padEnd(w)}  ${String(c.kb).padStart(6)} KB / ${String(c.budget).padStart(3)} KB   ${c.detail}`
    );
  }
  console.log('');
}

if (failed.length) {
  console.error(
    `Presupuesto superado en ${failed.length} comprobacion(es): ${failed.map((f) => f.name).join(', ')}`
  );
  process.exit(1);
}
console.log('Presupuesto respetado.');
