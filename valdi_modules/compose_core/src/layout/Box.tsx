import { Component } from "valdi_core/src/Component";
import { Layout, View } from "valdi_tsx/src/NativeTemplateElements";
import { FlexAlignItems, FlexContainerProps, FlexJustifyContent, toStyle } from "./types";

export interface BoxProps extends FlexContainerProps {
  /**
   * Compose's `contentAlignment` maps to both axes. We allow callers to
   * override individual axes via horizontal/vertical props when needed.
   */
  contentAlignment?: FlexAlignItems | FlexJustifyContent;
  horizontalAlignment?: FlexAlignItems;
  verticalAlignment?: FlexJustifyContent;
}

export class Box extends Component<BoxProps> {
  onRender(): void {
    const {
      contentAlignment,
      horizontalAlignment,
      verticalAlignment,
      style,
      testTag,
      accessibilityLabel,
      onTap,
    } = this.viewModel ?? {};

    const alignItems = horizontalAlignment ?? (contentAlignment as FlexAlignItems) ?? "stretch";
    const justifyContent = verticalAlignment ?? (contentAlignment as FlexJustifyContent) ?? "flex-start";
    const resolvedStyle = toStyle<Layout | View>(style as any);

    <view
      flexDirection="column"
      alignItems={alignItems}
      justifyContent={justifyContent}
      style={resolvedStyle}
      accessibilityId={testTag}
      accessibilityLabel={accessibilityLabel}
      onTap={onTap}
    >
      <slot />
    </view>;
  }
}
