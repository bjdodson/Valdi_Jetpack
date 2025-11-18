import { Component } from "valdi_core/src/Component";
import { CSSValue, Layout, View } from "valdi_tsx/src/NativeTemplateElements";
import { FlexContainerProps, toStyle } from "./types";

export interface SpacerProps extends FlexContainerProps {
  width?: CSSValue;
  height?: CSSValue;
  minWidth?: CSSValue;
  minHeight?: CSSValue;
  maxWidth?: CSSValue;
  maxHeight?: CSSValue;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: CSSValue;
}

/**
 * Compose-style spacer. Occupies space in layouts without rendering children.
 */
export class Spacer extends Component<SpacerProps> {
  onRender(): void {
    const {
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      flexGrow,
      flexShrink,
      flexBasis,
      style,
      testTag,
      accessibilityLabel,
    } = this.viewModel ?? {};
    const resolvedStyle = toStyle<Layout | View>(style as any);

    <view
      width={width}
      height={height}
      minWidth={minWidth}
      minHeight={minHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      flexGrow={flexGrow}
      flexShrink={flexShrink}
      flexBasis={flexBasis}
      style={resolvedStyle}
      accessibilityId={testTag}
      accessibilityLabel={accessibilityLabel}
    />;
  }
}
