// Palet magma (gelap ke terang) untuk heatmap: berurutan secara kecerahan, jadi tetap terbaca bagi buta warna merah-hijau
type Rgb = readonly [number, number, number];

const STOPS: readonly (readonly [number, Rgb])[] = [
  [0, [0, 0, 4]],
  [0.13, [28, 16, 68]],
  [0.25, [79, 18, 123]],
  [0.38, [129, 37, 129]],
  [0.5, [181, 54, 122]],
  [0.63, [229, 80, 100]],
  [0.75, [251, 135, 97]],
  [0.88, [254, 194, 135]],
  [1, [252, 253, 191]],
];

function magmaRgb(t: number): Rgb {
  const value = Math.min(Math.max(t, 0), 1);
  for (let index = 1; index < STOPS.length; index += 1) {
    const [toAt, toColor] = STOPS[index]!;
    const [fromAt, fromColor] = STOPS[index - 1]!;
    if (value <= toAt) {
      const ratio = (value - fromAt) / (toAt - fromAt);
      return [
        fromColor[0] + (toColor[0] - fromColor[0]) * ratio,
        fromColor[1] + (toColor[1] - fromColor[1]) * ratio,
        fromColor[2] + (toColor[2] - fromColor[2]) * ratio,
      ];
    }
  }
  return STOPS[STOPS.length - 1]![1];
}

function magmaCss(t: number): string {
  const [r, g, b] = magmaRgb(t);
  return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
}

// Gradasi untuk legenda, dari rendah ke tinggi
const MAGMA_GRADIENT = `linear-gradient(to right, ${STOPS.map(([at, [r, g, b]]) => `rgb(${r} ${g} ${b}) ${at * 100}%`).join(", ")})`;

// Teks di atas warna ini sebaiknya gelap atau terang
function isLightMagma(t: number): boolean {
  const [r, g, b] = magmaRgb(t);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140;
}

export { MAGMA_GRADIENT, isLightMagma, magmaCss, magmaRgb };
