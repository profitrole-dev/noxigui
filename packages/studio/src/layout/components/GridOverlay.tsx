import React from "react";
import type { Grid } from "@noxigui/runtime";

let key = 0;

function ring(x: number, y: number, w: number, h: number, l: number, t: number, r: number, b: number, color: string) {
  const res: React.ReactNode[] = [];
  if (t > 0) res.push(<div key={key++} style={{ position: "absolute", left: x, top: y, width: w, height: t, background: color }} />);
  if (b > 0) res.push(<div key={key++} style={{ position: "absolute", left: x, top: y + h - b, width: w, height: b, background: color }} />);
  const midH = h - t - b;
  if (midH > 0) {
    if (l > 0) res.push(<div key={key++} style={{ position: "absolute", left: x, top: y + t, width: l, height: midH, background: color }} />);
    if (r > 0) res.push(<div key={key++} style={{ position: "absolute", left: x + w - r, top: y + t, width: r, height: midH, background: color }} />);
  }
  return res;
}

export default function GridOverlay({ grid, offsetX, offsetY }: { grid: Grid; offsetX: number; offsetY: number }) {
  const w0 = grid.final.width;
  const h0 = grid.final.height;
  const xs = [0];
  for (const c of grid.cols) xs.push(xs[xs.length - 1] + c.actual);
  const ys = [0];
  for (const r of grid.rows) ys.push(ys[ys.length - 1] + r.actual);

  const nodes: React.ReactNode[] = [];

  const STROKE = "rgba(0,255,255,0.7)";
  const GRID_LINE = "rgba(0,255,255,0.45)";
  const GAP_FILL = "rgba(255,0,255,0.10)";
  const MARGIN_FILL = "rgba(255,153,0,0.22)";
  const PADDING_FILL = "rgba(102,204,255,0.18)";

  // outer border with margin
  nodes.push(
    <div
      key={key++}
      style={{
        position: "absolute",
        left: offsetX - grid.margin.l,
        top: offsetY - grid.margin.t,
        width: w0 + grid.margin.l + grid.margin.r,
        height: h0 + grid.margin.t + grid.margin.b,
        boxSizing: "border-box",
        border: `2px solid ${STROKE}`,
      }}
    />,
  );

  // column gaps
  for (let c = 0; c < grid.cols.length - 1; c++) {
    const gx = offsetX + xs[c + 1] + c * grid.colGap;
    nodes.push(
      <div
        key={key++}
        style={{ position: "absolute", left: gx, top: offsetY, width: grid.colGap, height: h0, background: GAP_FILL }}
      />,
    );
  }
  // row gaps
  for (let r = 0; r < grid.rows.length - 1; r++) {
    const gy = offsetY + ys[r + 1] + r * grid.rowGap;
    nodes.push(
      <div
        key={key++}
        style={{ position: "absolute", left: offsetX, top: gy, width: w0, height: grid.rowGap, background: GAP_FILL }}
      />,
    );
  }

  // column lines
  for (let c = 0; c <= grid.cols.length; c++) {
    const bx = c < grid.cols.length ? offsetX + xs[c] + c * grid.colGap : offsetX + xs[c] + (c - 1) * grid.colGap;
    nodes.push(
      <div
        key={key++}
        style={{ position: "absolute", left: bx, top: offsetY, height: h0, borderLeft: `2px solid ${GRID_LINE}` }}
      />,
    );
  }
  // row lines
  for (let r = 0; r <= grid.rows.length; r++) {
    const by = r < grid.rows.length ? offsetY + ys[r] + r * grid.rowGap : offsetY + ys[r] + (r - 1) * grid.rowGap;
    nodes.push(
      <div
        key={key++}
        style={{ position: "absolute", left: offsetX, top: by, width: w0, borderTop: `2px solid ${GRID_LINE}` }}
      />,
    );
  }

  // children margins/padding
  for (const ch of grid.children) {
    const m = ch.margin;
    const slotX = offsetX + ch.final.x - m.l;
    const slotY = offsetY + ch.final.y - m.t;
    const slotW = ch.final.width + m.l + m.r;
    const slotH = ch.final.height + m.t + m.b;
    if (m.l || m.t || m.r || m.b)
      nodes.push(...ring(slotX, slotY, slotW, slotH, m.l, m.t, m.r, m.b, MARGIN_FILL));

    const pad = (ch as any).padding;
    if (pad) {
      nodes.push(
        ...ring(
          offsetX + ch.final.x,
          offsetY + ch.final.y,
          ch.final.width,
          ch.final.height,
          pad.l,
          pad.t,
          pad.r,
          pad.b,
          PADDING_FILL,
        ),
      );
    }
  }

  return <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>{nodes}</div>;
}
