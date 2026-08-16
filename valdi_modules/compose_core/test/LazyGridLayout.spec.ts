import "jasmine/src/jasmine";

import { lazyGridLayout, lazyGridMaterializationWindow } from "../src/layout/LazyGrid";

describe("lazyGridLayout", () => {
  it("calculates responsive geometry and an overscanned viewport window", () => {
    const layout = lazyGridLayout(51, 812, 250, 204, 12, 12, 420, 600, 1);

    expect(layout.columns).toBe(3);
    expect(layout.itemWidth).toBeCloseTo(262.6667, 3);
    expect(layout.rowStride).toBe(216);
    expect(layout.totalHeight).toBe(3660);
    expect(layout.firstIndex).toBe(0);
    expect(layout.endIndex).toBe(18);
  });

  it("uses an end-exclusive window at exact row boundaries", () => {
    const layout = lazyGridLayout(20, 430, 200, 100, 10, 10, 110, 100, 0);

    expect(layout.columns).toBe(2);
    expect(layout.firstIndex).toBe(2);
    expect(layout.endIndex).toBe(4);
  });

  it("clamps the window to a partial final row", () => {
    const layout = lazyGridLayout(5, 430, 200, 100, 10, 10, 220, 100, 0);

    expect(layout.totalHeight).toBe(320);
    expect(layout.firstIndex).toBe(4);
    expect(layout.endIndex).toBe(5);
  });

  it("keeps deep-scroll materialization bounded", () => {
    const layout = lazyGridLayout(1000, 520, 250, 200, 12, 10, 10000, 500, 2);

    expect(layout.columns).toBe(2);
    expect(layout.firstIndex).toBeLessThan(layout.endIndex);
    expect(layout.endIndex - layout.firstIndex).toBeLessThanOrEqual(16);
  });

  it("preserves empty geometry", () => {
    const layout = lazyGridLayout(0, 640, 200, 80, 8, 10, 300, 200, 1);

    expect(layout.totalHeight).toBe(0);
    expect(layout.firstIndex).toBe(0);
    expect(layout.endIndex).toBe(0);
  });

  it("sanitizes invalid numeric inputs deterministically", () => {
    const layout = lazyGridLayout(
      Number.NaN,
      Number.NEGATIVE_INFINITY,
      0,
      0,
      -1,
      Number.NaN,
      -4,
      Number.NaN,
      -2,
    );

    expect(layout).toEqual({
      columns: 1,
      itemWidth: 1,
      rowStride: 1,
      totalHeight: 0,
      firstIndex: 0,
      endIndex: 0,
    });
  });

  it("falls back to the complete collection when windowing is disabled", () => {
    const layout = lazyGridLayout(100, 520, 250, 200, 12, 10, 10000, 500, 2);

    expect(lazyGridMaterializationWindow(layout, 100, false, false)).toEqual({
      firstIndex: 0,
      endIndex: 100,
    });
  });

  it("uses a correctness-first complete collection on web", () => {
    const layout = lazyGridLayout(100, 520, 250, 200, 12, 10, 10000, 500, 2);

    expect(lazyGridMaterializationWindow(layout, 100, true, true)).toEqual({
      firstIndex: 0,
      endIndex: 100,
    });
    expect(lazyGridMaterializationWindow(layout, 100, true, false)).toEqual({
      firstIndex: layout.firstIndex,
      endIndex: layout.endIndex,
    });
  });
});
