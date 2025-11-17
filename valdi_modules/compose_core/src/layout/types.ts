import { Style } from "valdi_core/src/Style";
import { Layout, LayoutAlignItemsProperty, LayoutFlexWrapProperty, LayoutJustifyContentProperty, View } from "valdi_tsx/src/NativeTemplateElements";

export type FlexJustifyContent = LayoutJustifyContentProperty;
export type FlexAlignItems = LayoutAlignItemsProperty;
export type FlexWrap = LayoutFlexWrapProperty;

export interface FlexContainerProps {
  /**
   * Pass-through Valdi style block. Compose `Modifier` instances will
   * eventually translate into these styles.
   */
  style?: Style<Layout | View>;
  /**
   * Use a Compose `testTag`-like identifier that maps to accessibilityId.
   */
  testTag?: string;
  /**
   * Optional accessibility label exposed to screen readers.
   */
  accessibilityLabel?: string;
}

export interface FlexResolvedProps {
  justifyContent: FlexJustifyContent;
  alignItems: FlexAlignItems;
  wrap: FlexWrap;
}
