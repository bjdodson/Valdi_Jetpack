import { Component } from "valdi_core/src/Component";
import { Layout, View } from "valdi_tsx/src/NativeTemplateElements";
import { FlexAlignItems, FlexContainerProps, FlexJustifyContent, FlexWrap, toStyle } from "./types";

export interface ColumnProps extends FlexContainerProps {
  verticalArrangement?: FlexJustifyContent;
  horizontalAlignment?: FlexAlignItems;
  wrap?: FlexWrap;
}

export class Column extends Component<ColumnProps> {
  onRender(): void {
    const {
      verticalArrangement = "flex-start",
      horizontalAlignment = "stretch",
      wrap = "no-wrap",
      style,
      testTag,
      accessibilityLabel,
    } = this.viewModel ?? {};
    const resolvedStyle = toStyle<Layout | View>(style as any);

    <view
      flexDirection="column"
      justifyContent={verticalArrangement}
      alignItems={horizontalAlignment}
      flexWrap={wrap}
      style={resolvedStyle}
      accessibilityId={testTag}
      accessibilityLabel={accessibilityLabel}
    >
      <slot />
    </view>;
  }
}
