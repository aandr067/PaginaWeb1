import localFont from 'next/font/local';

/**
 * Las dos familias ya están autoalojadas en el sitio actual (/fonts). Se
 * reutilizan los mismos ficheros variables: cero peticiones a terceros, cero
 * cambio de identidad respecto a apftech.es.
 *
 * Inter Tight para titulares — cierra las aperturas y aguanta el tracking
 * negativo a 72 px. Inter para cuerpo — mayor altura de x, que es justo lo
 * que Inter Tight sacrifica y lo que hace falta a 16–18 px.
 */

export const interTight = localFont({
  src: './fonts/inter-tight-var-latin.woff2',
  variable: '--font-inter-tight',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
});

export const inter = localFont({
  src: './fonts/inter-var-latin.woff2',
  variable: '--font-inter',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
});
