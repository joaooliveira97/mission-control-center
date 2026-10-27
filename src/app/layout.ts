import { Layout } from './streams.store';

export interface Cell {
  column: string;
  row: string;
}

export interface GridPlan {
  columns: string;
  rows: string;
  /** Placement for each stream, in display order. */
  cells: Cell[];
}

const VIDEO_RATIO = 16 / 9;
const AUTO: Cell = { column: 'auto', row: 'auto' };

const tracks = (count: number) => `repeat(${count}, minmax(0, 1fr))`;

/**
 * Picks the column count that gives each 16:9 video the most visible area.
 * Ties go to more columns, which leaves wider, shorter tiles.
 */
export function bestColumns(count: number, width: number, height: number): number {
  let best = 1;
  let bestArea = 0;
  for (let columns = 1; columns <= count; columns++) {
    const rows = Math.ceil(count / columns);
    const cellWidth = width / columns;
    const cellHeight = height / rows;
    const videoWidth = Math.min(cellWidth, cellHeight * VIDEO_RATIO);
    const area = videoWidth * (videoWidth / VIDEO_RATIO);
    if (area >= bestArea * 0.999) {
      best = columns;
      bestArea = area;
    }
  }
  return best;
}

export function planLayout(layout: Layout, count: number, width: number, height: number): GridPlan {
  if (layout === 'focus' && count >= 2) {
    const others = count - 1;
    const sideColumns = others > 4 ? 2 : 1;
    const rows = Math.ceil(others / sideColumns);
    return {
      columns: `minmax(0, 3fr) ${tracks(sideColumns)}`,
      rows: tracks(rows),
      cells: [{ column: '1', row: `1 / span ${rows}` }, ...Array(others).fill(AUTO)],
    };
  }

  if (layout === 'stage' && count >= 3) {
    // Two big streams on top, the rest share the bottom row (the original "2 + 3" grid).
    const bottom = count - 2;
    const top: Cell = { column: `span ${bottom}`, row: '1' };
    return {
      columns: tracks(bottom * 2),
      rows: 'minmax(0, 55fr) minmax(0, 45fr)',
      cells: [top, top, ...Array(bottom).fill({ column: 'span 2', row: '2' })],
    };
  }

  const columns = bestColumns(count, width, height);
  return {
    columns: tracks(columns),
    rows: tracks(Math.max(1, Math.ceil(count / columns))),
    cells: Array(count).fill(AUTO),
  };
}
