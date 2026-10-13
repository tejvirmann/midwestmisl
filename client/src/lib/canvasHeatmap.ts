/**
 * Minimal canvas heatmap overlay. Replaces google.maps.visualization.HeatmapLayer,
 * which Google removed from the Maps JS API as of v3.65.
 */

const GRADIENT: [number, string][] = [
  [0.0, "rgba(0,0,255,0)"],
  [0.2, "rgba(0,200,255,0.6)"],
  [0.4, "rgba(0,255,100,0.75)"],
  [0.6, "rgba(255,255,0,0.85)"],
  [0.8, "rgba(255,140,0,0.9)"],
  [1.0, "rgba(255,0,0,1)"],
];

function buildPalette(): Uint8ClampedArray {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 1;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  GRADIENT.forEach(([stop, color]) => g.addColorStop(stop, color));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 1);
  return ctx.getImageData(0, 0, 256, 1).data;
}

export interface CanvasHeatmap {
  setData(points: google.maps.LatLngLiteral[]): void;
  setMap(map: google.maps.Map | null): void;
}

export function createCanvasHeatmap(options: {
  radius?: number;
  opacity?: number;
  intensity?: number;
}): CanvasHeatmap {
  const radius = options.radius ?? 25;
  const opacity = options.opacity ?? 0.6;
  // Alpha added per point; higher = hotter sooner.
  const intensity = options.intensity ?? 0.15;
  let points: google.maps.LatLngLiteral[] = [];
  let palette: Uint8ClampedArray | null = null;

  class Overlay extends google.maps.OverlayView {
    canvas: HTMLCanvasElement | null = null;

    onAdd() {
      this.canvas = document.createElement("canvas");
      this.canvas.style.position = "absolute";
      this.canvas.style.pointerEvents = "none";
      this.canvas.style.opacity = String(opacity);
      this.getPanes()?.overlayLayer.appendChild(this.canvas);
    }

    onRemove() {
      this.canvas?.remove();
      this.canvas = null;
    }

    draw() {
      const projection = this.getProjection();
      const map = this.getMap() as google.maps.Map | null;
      const bounds = map?.getBounds();
      if (!this.canvas || !projection || !bounds) return;

      const sw = projection.fromLatLngToDivPixel(bounds.getSouthWest());
      const ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());
      if (!sw || !ne) return;

      // Pad so points just outside the viewport still bleed in.
      const pad = radius * 2;
      const left = Math.min(sw.x, ne.x) - pad;
      const top = Math.min(sw.y, ne.y) - pad;
      const width = Math.ceil(Math.abs(ne.x - sw.x) + pad * 2);
      const height = Math.ceil(Math.abs(ne.y - sw.y) + pad * 2);

      const canvas = this.canvas;
      canvas.style.left = `${left}px`;
      canvas.style.top = `${top}px`;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      ctx.clearRect(0, 0, width, height);

      // Pass 1: accumulate density in the alpha channel.
      for (const p of points) {
        const px = projection.fromLatLngToDivPixel(new google.maps.LatLng(p));
        if (!px) continue;
        const x = px.x - left;
        const y = px.y - top;
        if (x < -radius || y < -radius || x > width + radius || y > height + radius) continue;
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, `rgba(0,0,0,${intensity})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }

      // Pass 2: map accumulated alpha to the color palette.
      palette ??= buildPalette();
      const img = ctx.getImageData(0, 0, width, height);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const a = d[i + 3];
        if (!a) continue;
        d[i] = palette[a * 4];
        d[i + 1] = palette[a * 4 + 1];
        d[i + 2] = palette[a * 4 + 2];
        d[i + 3] = palette[a * 4 + 3];
      }
      ctx.putImageData(img, 0, 0);
    }
  }

  const overlay = new Overlay();

  return {
    setData(next) {
      points = next;
      overlay.draw();
    },
    setMap(map) {
      overlay.setMap(map);
    },
  };
}
