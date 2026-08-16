import { Component } from "valdi_core/src/Component";
import { Style } from "valdi_core/src/Style";
import { CSSValue, Layout, ScrollView, View } from "valdi_tsx/src/NativeTemplateElements";
import { toStyle } from "./types";

export type ContentPadding =
  | CSSValue
  | {
      start?: CSSValue;
      end?: CSSValue;
      top?: CSSValue;
      bottom?: CSSValue;
    };

export interface LazyListProps<T = unknown> {
  items?: readonly T[];
  renderItem?: (item: T, index: number) => void;
  itemSpacing?: CSSValue;
  contentPadding?: ContentPadding;
  showsScrollIndicators?: boolean;
  style?: Style<ScrollView | View | Layout> | Partial<ScrollView & View & Layout>;
  accessibilityLabel?: string;
  testTag?: string;
}

type NormalizedPadding = Partial<Record<"paddingTop" | "paddingBottom" | "paddingLeft" | "paddingRight", CSSValue>>;

function normalizePadding(padding: ContentPadding | undefined): NormalizedPadding {
  if (padding === undefined) {
    return {};
  }

  if (typeof padding !== "object") {
    return {
      paddingTop: padding,
      paddingBottom: padding,
      paddingLeft: padding,
      paddingRight: padding,
    };
  }

  return {
    paddingLeft: padding.start,
    paddingRight: padding.end,
    paddingTop: padding.top,
    paddingBottom: padding.bottom,
  };
}

abstract class LazyListBase<T> extends Component<LazyListProps<T>> {
  protected abstract isHorizontal(): boolean;

  protected getContentPadding(): NormalizedPadding {
    return normalizePadding(this.viewModel?.contentPadding);
  }

  protected renderItems(): void {
    const { items, renderItem, itemSpacing } = this.viewModel ?? {};
    if (!items?.length || !renderItem) {
      return;
    }

    const spacingProp = this.isHorizontal() ? "marginRight" : "marginBottom";
    items.forEach((item, index) => {
      const spacing = index === items.length - 1 ? undefined : itemSpacing;
      <layout lazy={true} {...{ [spacingProp]: spacing }}>
        {renderItem(item, index)}
      </layout>;
    });
  }

  onRender(): void {
    const {
      style,
      accessibilityLabel,
      testTag,
      showsScrollIndicators = false,
    } = this.viewModel ?? {};
    const padding = this.getContentPadding();
    const resolvedStyle = toStyle<ScrollView | View | Layout>(style as any);

    <scroll
      horizontal={this.isHorizontal()}
      showsHorizontalScrollIndicator={this.isHorizontal() ? showsScrollIndicators : false}
      showsVerticalScrollIndicator={!this.isHorizontal() ? showsScrollIndicators : false}
      accessibilityLabel={accessibilityLabel}
      accessibilityId={testTag}
      style={resolvedStyle}
      {...padding}
    >
      {this.renderItems()}
      <slot />
    </scroll>;
  }
}

/**
 * Scrollable row that defers item composition until needed.
 */
export class LazyRow<T = unknown> extends LazyListBase<T> {
  protected isHorizontal(): boolean {
    return true;
  }
}

/**
 * Scrollable column that defers item composition until needed.
 */
export class LazyColumn<T = unknown> extends LazyListBase<T> {
  protected isHorizontal(): boolean {
    return false;
  }
}
