import { StatefulComponent } from "valdi_core/src/Component";
import { Style } from "valdi_core/src/Style";
import { ElementFrame } from "valdi_tsx/src/Geometry";
import { Layout, View } from "valdi_tsx/src/NativeTemplateElements";
import { toStyle } from "./types";

declare const window: unknown;
declare const document: unknown;

export interface LazyGridProps<T = unknown> {
  items?: readonly T[];
  renderItem?: (item: T, index: number) => void;
  keyForItem?: (item: T, index: number) => string;
  minimumItemWidth: number;
  itemHeight: number;
  columnSpacing?: number;
  rowSpacing?: number;
  overscanRows?: number;
  /** Disable viewport windowing to keep every item in the accessibility tree. */
  viewportWindowing?: boolean;
  style?: Style<View | Layout> | Partial<View & Layout>;
  accessibilityLabel?: string;
  testTag?: string;
}

export interface LazyGridLayout {
  columns: number;
  itemWidth: number;
  rowStride: number;
  totalHeight: number;
  firstIndex: number;
  endIndex: number;
}

export interface LazyGridMaterializationWindow {
  firstIndex: number;
  endIndex: number;
}

interface LazyGridState {
  width: number;
  viewportY: number;
  viewportHeight: number;
}

function finiteNonNegative(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value >= 0 ? value : fallback;
}

/**
 * Resolves the item window independently from geometry. Web currently falls
 * back to the full collection because pinned Valdi's IntersectionObserver
 * bridge does not continuously report scroll offsets for tall elements.
 */
export function lazyGridMaterializationWindow(
  layout: LazyGridLayout,
  itemCount: number,
  viewportWindowing = true,
  webRuntime = false,
): LazyGridMaterializationWindow {
  const count = Math.max(0, Math.floor(finiteNonNegative(itemCount, 0)));
  if (!viewportWindowing || webRuntime) {
    return { firstIndex: 0, endIndex: count };
  }
  const firstIndex = Math.min(count, Math.max(0, Math.floor(finiteNonNegative(layout.firstIndex, 0))));
  const endIndex = Math.min(count, Math.max(firstIndex, Math.floor(finiteNonNegative(layout.endIndex, firstIndex))));
  return { firstIndex, endIndex };
}

function lazyGridRuntimeIsWeb(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/** Pure, deterministic geometry and visible-window calculation. */
export function lazyGridLayout(
  itemCount: number,
  containerWidth: number,
  minimumItemWidth: number,
  itemHeight: number,
  columnSpacing = 0,
  rowSpacing = 0,
  viewportY = 0,
  viewportHeight = 0,
  overscanRows = 1,
): LazyGridLayout {
  const count = Math.max(0, Math.floor(finiteNonNegative(itemCount, 0)));
  const minimumWidth = Math.max(1, finiteNonNegative(minimumItemWidth, 1));
  const resolvedItemHeight = Math.max(1, finiteNonNegative(itemHeight, 1));
  const horizontalGap = finiteNonNegative(columnSpacing, 0);
  const verticalGap = finiteNonNegative(rowSpacing, 0);
  const width = Math.max(minimumWidth, finiteNonNegative(containerWidth, minimumWidth));
  const columns = Math.max(1, Math.floor((width + horizontalGap) / (minimumWidth + horizontalGap)));
  const itemWidth = (width - horizontalGap * (columns - 1)) / columns;
  const rowStride = resolvedItemHeight + verticalGap;
  const rowCount = Math.ceil(count / columns);
  const totalHeight = rowCount > 0
    ? rowCount * resolvedItemHeight + (rowCount - 1) * verticalGap
    : 0;
  const overscan = Math.max(0, Math.floor(finiteNonNegative(overscanRows, 1)));
  const resolvedViewportY = Math.max(0, finiteNonNegative(viewportY, 0));
  const resolvedViewportHeight = finiteNonNegative(viewportHeight, 0);
  const firstVisibleRow = Math.min(rowCount, Math.floor(resolvedViewportY / rowStride));
  const visibleRowEnd = resolvedViewportHeight > 0
    ? Math.min(rowCount, Math.ceil((resolvedViewportY + resolvedViewportHeight) / rowStride))
    : Math.min(rowCount, 1);
  const firstRow = Math.max(0, firstVisibleRow - overscan);
  const endRow = Math.min(rowCount, visibleRowEnd + overscan);

  return {
    columns,
    itemWidth,
    rowStride,
    totalHeight,
    firstIndex: Math.min(count, firstRow * columns),
    endIndex: Math.min(count, endRow * columns),
  };
}

/**
 * Fixed-height responsive grid that keeps only the visible, overscanned item
 * window in the Valdi tree. It relies on the parent scroll viewport rather than
 * introducing a nested scrolling surface.
 */
export class LazyGrid<T = unknown> extends StatefulComponent<LazyGridProps<T>, LazyGridState> {
  state: LazyGridState = { width: 0, viewportY: 0, viewportHeight: 0 };

  onRender(): void {
    const {
      items = [],
      renderItem,
      keyForItem,
      minimumItemWidth,
      itemHeight,
      columnSpacing = 0,
      rowSpacing = 0,
      overscanRows = 1,
      viewportWindowing = true,
      style,
      accessibilityLabel,
      testTag,
    } = this.viewModel;
    const horizontalGap = finiteNonNegative(columnSpacing, 0);
    const verticalGap = finiteNonNegative(rowSpacing, 0);
    const resolvedItemHeight = Math.max(1, finiteNonNegative(itemHeight, 1));
    const layout = lazyGridLayout(
      items.length,
      this.state.width,
      minimumItemWidth,
      resolvedItemHeight,
      horizontalGap,
      verticalGap,
      this.state.viewportY,
      this.state.viewportHeight,
      overscanRows,
    );
    const materialization = lazyGridMaterializationWindow(
      layout,
      items.length,
      viewportWindowing,
      lazyGridRuntimeIsWeb(),
    );
    const resolvedStyle = toStyle<Layout | View>(style as any);

    <view
      width="100%"
      style={resolvedStyle}
      accessibilityId={testTag}
      accessibilityLabel={accessibilityLabel}
      accessibilityNavigation="group"
    >
      <view
        width="100%"
        height={layout.totalHeight}
        onLayout={this.handleLayout}
        onViewportChanged={this.handleViewportChanged}
      >
        {renderItem ? items.slice(materialization.firstIndex, materialization.endIndex).forEach((item, offset) => {
          const index = materialization.firstIndex + offset;
          const row = Math.floor(index / layout.columns);
          const column = index % layout.columns;
          <layout
            key={keyForItem?.(item, index) ?? String(index)}
            position="absolute"
            left={column * (layout.itemWidth + horizontalGap)}
            top={row * layout.rowStride}
            width={layout.itemWidth}
            height={resolvedItemHeight}
            estimatedWidth={layout.itemWidth}
            estimatedHeight={resolvedItemHeight}
            lazy={true}
          >
            {renderItem(item, index)}
          </layout>;
        }) : undefined}
      </view>
    </view>;
  }

  private handleLayout = (frame: ElementFrame): void => {
    if (Math.abs(this.state.width - frame.width) >= 0.5) {
      this.setState({ width: frame.width });
    }
  };

  private handleViewportChanged = (viewport: ElementFrame, frame: ElementFrame): void => {
    const widthChanged = Math.abs(this.state.width - frame.width) >= 0.5;
    const yChanged = Math.abs(this.state.viewportY - viewport.y) >= 0.5;
    const heightChanged = Math.abs(this.state.viewportHeight - viewport.height) >= 0.5;
    if (widthChanged || yChanged || heightChanged) {
      this.setState({
        width: frame.width,
        viewportY: viewport.y,
        viewportHeight: viewport.height,
      });
    }
  };
}
