import { bestColumns, planLayout } from './layout';

describe('bestColumns', () => {
  it('uses a single tile for a single stream', () => {
    expect(bestColumns(1, 1920, 1080)).toBe(1);
  });

  it('puts two streams side by side on a wide screen', () => {
    expect(bestColumns(2, 1920, 1080)).toBe(2);
  });

  it('stacks two streams on a portrait screen', () => {
    expect(bestColumns(2, 400, 900)).toBe(1);
  });

  it('uses a 2x2 grid for four streams on a 16:9 screen', () => {
    expect(bestColumns(4, 1920, 1080)).toBe(2);
  });

  it('uses three columns for six streams on a 16:9 screen', () => {
    expect(bestColumns(6, 1920, 1080)).toBe(3);
  });
});

describe('planLayout', () => {
  it('gives the main stream the full first column in focus layout', () => {
    const plan = planLayout('focus', 4, 1920, 1080);
    expect(plan.cells[0]).toEqual({ column: '1', row: '1 / span 3' });
    expect(plan.cells).toHaveLength(4);
  });

  it('reproduces the original 2 + 3 grid in stage layout', () => {
    const plan = planLayout('stage', 5, 1920, 1080);
    expect(plan.columns).toBe('repeat(6, minmax(0, 1fr))');
    expect(plan.cells.map((c) => c.column)).toEqual([
      'span 3',
      'span 3',
      'span 2',
      'span 2',
      'span 2',
    ]);
  });

  it('falls back to the grid when there are too few streams', () => {
    expect(planLayout('stage', 2, 1920, 1080)).toEqual(planLayout('grid', 2, 1920, 1080));
    expect(planLayout('focus', 1, 1920, 1080)).toEqual(planLayout('grid', 1, 1920, 1080));
  });
});
