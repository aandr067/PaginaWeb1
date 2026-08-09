# MOTION — sistema de movimiento de APF Tech

Guía de referencia del movimiento del sitio. Todo lo que se anima aquí sale de
estos tokens; si algo necesita un valor fuera de la escala, es señal de que hay
que revisar el diseño antes que el CSS.

---

## 1. Principio rector

**Solo se anima lo que el compositor puede resolver: `transform` y `opacity`.**

Cualquier otra propiedad obliga al navegador a rehacer trabajo en el hilo
principal en cada fotograma:

| Propiedad | Qué dispara | Coste |
|---|---|---|
| `transform`, `opacity` | Composite | El navegador lo delega a la GPU |
| `color`, `box-shadow`, `background`, `border-color` | Paint | Repinta la capa entera |
| `width`, `height`, `padding`, `margin`, `top`, `gap` | Layout | Recalcula la geometría y repinta |
| `backdrop-filter` | Composite + recomposición del desenfoque | El más caro de todos |

Se aceptan transiciones de `color`, `border-color` y `box-shadow` en elementos
**pequeños y aislados** (un botón, un chip, una tarjeta), donde el área a
repintar es mínima. No se aceptan nunca en animaciones infinitas ni sobre
superficies grandes.

---

## 2. Duraciones

Cuatro tokens, definidos en `css/styles.css`:

| Token | Valor | Para qué |
|---|---|---|
| `--dur-micro` | 150 ms | Controles pequeños: botón, chip, enlace, icono |
| `--dur-ui` | 240 ms | Cambios de estado corrientes |
| `--dur-card` | 320 ms | Superficies grandes: tarjetas, planes, drawer, barra de navegación |
| `--dur-enter` | 420 ms | Entradas al viewport |

Antes de la Fase 4 convivían ocho duraciones distintas (`.12s`, `.2s`, `.25s`,
`.3s`, `.35s`, `.4s`, `.7s`, `.8s`) repartidas sin criterio entre 60
declaraciones de `transition`. Todas están migradas a la escala.

**Regla:** cuanto más grande es lo que se mueve, más lenta va. Un botón a 420 ms
se siente lento; una tarjeta a 150 ms se siente nerviosa.

---

## 3. Curvas

| Token | Valor | Para qué |
|---|---|---|
| `--ease` | `cubic-bezier(.16, 1, .3, 1)` | Salida estándar. Arranca rápido y frena largo: es la curva por defecto |
| `--ease-out` | `cubic-bezier(.22, 1, .36, 1)` | Entradas al viewport, algo más suave al final |
| `--ease-inout` | `cubic-bezier(.4, 0, .6, 1)` | Ciclos simétricos que suben y bajan (el destello del selector de idioma) |

`linear` se reserva para movimiento continuo sin principio ni final perceptible:
la marquesina de integraciones y la barra de progreso del carrusel.

---

## 4. Animaciones vivas del sitio

| Nombre | Dónde | Propiedades | Notas |
|---|---|---|---|
| `robotFloat` | Imagen del héroe | `transform` | 6 s, infinita. Compositor puro |
| `marquee` | Franja de integraciones | `transform` | 38 s, lineal. Pausable con el botón, con `:hover` y con `:focus-within` |
| `ring-pulse` | Punto del *eyebrow* del héroe | `transform`, `opacity` | Antes animaba `box-shadow` de forma indefinida sobre el fold |
| `lang-beacon` | Botón de idioma, primera visita | `opacity` | Antes animaba `box-shadow` + `border-color` + `color` a la vez |
| Coverflow del carrusel | 5 carruseles móviles | `transform`, `opacity` vía JS | Escritura por `requestAnimationFrame`, lectura de geometría cacheada |

---

## 5. Entradas al scroll

Las entradas usan `IntersectionObserver` (`js/main.js`), nunca un listener de
scroll. El observador deja de observar cada elemento en cuanto entra, así que el
coste es de una sola vez.

```js
var io = new IntersectionObserver(function (entries) { … io.unobserve(en.target); },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
```

Los dos listeners de scroll que quedan (estado de la barra de navegación y
paralaje del héroe) van con `{ passive: true }` y, el segundo, con guarda de
`requestAnimationFrame`.

---

## 6. Movimiento reducido

`@media (prefers-reduced-motion: reduce)` aplica una **red de seguridad global**:

```css
*, *::before, *::after {
  animation-duration: 1ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 1ms !important;
  scroll-behavior: auto !important;
}
```

Cualquier animación que se añada en el futuro queda cubierta sin tener que
acordarse de listarla. Se usa una duración inapreciable en vez de
`animation: none` porque `none` salta al fotograma inicial y rompería los
estados que dependen de `both`.

Encima de esa red hay excepciones explícitas: los `.reveal` se muestran ya
visibles, la marquesina se convierte en una rejilla estática con sus duplicados
ocultos, el botón de pausa desaparece (no hay nada que pausar) y las tarjetas del
carrusel se ven al 100 % sin transformación.

---

## 7. Transiciones de página

El sitio son 17 documentos estáticos independientes, así que la navegación es
multipágina. `@view-transition { navigation: auto; }` hace que los navegadores
compatibles fundan una página con la siguiente. Los que no la soportan ignoran la
regla y navegan como siempre: degradación limpia, cero JavaScript, cero peso.

Con movimiento reducido, los pseudo-elementos de la transición se desactivan.

---

## 8. Al añadir movimiento nuevo

1. ¿Se puede expresar con `transform` u `opacity`? Si no, replantea el efecto.
2. Elige duración por tamaño del elemento, no por gusto.
3. Usa `--ease` salvo que sea una entrada o un ciclo simétrico.
4. Si es infinita, tiene que estar bajo el fold o ser compositor puro.
5. Si dura más de 5 s y arranca sola, necesita un control de pausa (WCAG 2.2.2).
6. `will-change` solo mientras dura la interacción, y se retira después.
