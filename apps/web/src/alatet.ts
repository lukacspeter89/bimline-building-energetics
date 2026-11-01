// Alaprajz-alátét: PDF-oldal vagy kép háttérként a rajz alatt, léptékkel, forgatással és a tervi helyiségfeliratokkal.
// A PDF-et a böngésző rendereli (pdf.js), a worker a csomagba ágyazva, így offline is működik.
import * as pdfjs from 'pdfjs-dist';
import workerForras from 'pdfjs-dist/build/pdf.worker.min.mjs';

let workerBeallitva = false;
function worker(): void {
  if (workerBeallitva) return;
  pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([workerForras as unknown as string], { type: 'text/javascript' }));
  workerBeallitva = true;
}

export * from './alatetGeo.js';
import { cimkekSzovegbol, type Alatet } from './alatetGeo.js';

export interface PdfDok {
  oldalak: number;
  oldal: (n: number) => Promise<Omit<Alatet, 'x0' | 'y0' | 'fi' | 'atlatszo'>>;
}

/** PDF megnyitása; az oldal képpé renderelve (legfeljebb ~4000 px), a feliratokkal együtt. */
export async function pdfMegnyit(adat: ArrayBuffer): Promise<PdfDok> {
  worker();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(adat) }).promise;
  return {
    oldalak: doc.numPages,
    oldal: async (n) => {
      const page = await doc.getPage(n);
      const alap = page.getViewport({ scale: 1 });
      const scale = Math.min(2, 4000 / Math.max(alap.width, alap.height));
      const vp = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(vp.width);
      canvas.height = Math.ceil(vp.height);
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const tartalom = await page.getTextContent();
      const elemek = tartalom.items
        .filter((x): x is typeof x & { str: string; transform: number[] } => 'str' in x && !!x.str.trim())
        .map((x) => {
          const [px, py] = vp.convertToViewportPoint(x.transform[4]!, x.transform[5]!) as [number, number];
          return { str: x.str, x: px, y: py };
        });
      // 1 pt = 0,0254/72 m a papíron; 1:50-es léptéknél a valóságban 50-szerese.
      const s50 = ((0.0254 / 72) * 50) / scale;
      return { kep: canvas.toDataURL('image/jpeg', 0.85), w: canvas.width, h: canvas.height, s: s50, s50, cimkek: cimkekSzovegbol(elemek, 1 / s50) };
    },
  };
}

/** Kép (PNG, JPG) alátétként; lépték kalibrálással. */
export function kepMegnyit(fajl: File): Promise<Omit<Alatet, 'x0' | 'y0' | 'fi' | 'atlatszo'>> {
  return new Promise((ok, hiba) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => ok({ kep: String(r.result), w: img.naturalWidth, h: img.naturalHeight, s: 0.01, cimkek: [] });
      img.onerror = () => hiba(new Error('A kép nem olvasható.'));
      img.src = String(r.result);
    };
    r.onerror = () => hiba(r.error);
    r.readAsDataURL(fajl);
  });
}
