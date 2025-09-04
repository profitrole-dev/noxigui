import { Grid } from '../Grid.js';

export function drawDebugHtml(g: Grid, xs: number[], ys: number[]) {
  const doc = typeof document !== 'undefined' ? document : undefined;
  if (!doc) return;

  let overlay = g.debugHtml;
  if (!g.debug) {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    return;
  }

  if (!overlay) {
    overlay = doc.createElement('div');
    overlay.className = 'noxi-grid-html-overlay';
    overlay.style.position = 'absolute';
    overlay.style.pointerEvents = 'none';
    g.debugHtml = overlay;
    doc.body.appendChild(overlay);
  }

  overlay.style.left = `${g.final.x}px`;
  overlay.style.top = `${g.final.y}px`;
  overlay.style.width = `${g.final.width}px`;
  overlay.style.height = `${g.final.height}px`;
  overlay.innerHTML = '';
  overlay.style.border = '1px solid rgba(0,255,255,0.7)';

  const label = doc.createElement('div');
  label.className = 'noxi-grid-html-overlay-label';
  label.textContent = g.constructor.name;
  label.style.position = 'absolute';
  label.style.left = '0';
  label.style.top = '-16px';
  label.style.background = 'rgba(0,255,255,0.7)';
  label.style.color = '#000';
  label.style.fontSize = '12px';
  label.style.padding = '2px 4px';
  overlay.appendChild(label);

  for (const x of xs.slice(1, -1)) {
    const line = doc.createElement('div');
    line.className = 'noxi-grid-html-overlay-col';
    line.style.position = 'absolute';
    line.style.top = '0';
    line.style.left = `${x}px`;
    line.style.height = '100%';
    line.style.borderLeft = '1px solid rgba(0,255,255,0.45)';
    overlay.appendChild(line);

    const marker = doc.createElement('div');
    marker.className = 'noxi-grid-html-overlay-col-marker';
    marker.style.position = 'absolute';
    marker.style.left = `${x - 4}px`;
    marker.style.top = '-8px';
    marker.style.width = '0';
    marker.style.height = '0';
    marker.style.borderLeft = '4px solid transparent';
    marker.style.borderRight = '4px solid transparent';
    marker.style.borderBottom = '8px solid rgba(0,255,255,0.7)';
    overlay.appendChild(marker);
  }

  for (const y of ys.slice(1, -1)) {
    const line = doc.createElement('div');
    line.className = 'noxi-grid-html-overlay-row';
    line.style.position = 'absolute';
    line.style.left = '0';
    line.style.top = `${y}px`;
    line.style.width = '100%';
    line.style.borderTop = '1px solid rgba(0,255,255,0.45)';
    overlay.appendChild(line);

    const marker = doc.createElement('div');
    marker.className = 'noxi-grid-html-overlay-row-marker';
    marker.style.position = 'absolute';
    marker.style.top = `${y - 4}px`;
    marker.style.left = '-8px';
    marker.style.width = '0';
    marker.style.height = '0';
    marker.style.borderTop = '4px solid transparent';
    marker.style.borderBottom = '4px solid transparent';
    marker.style.borderRight = '8px solid rgba(0,255,255,0.7)';
    overlay.appendChild(marker);
  }
}
