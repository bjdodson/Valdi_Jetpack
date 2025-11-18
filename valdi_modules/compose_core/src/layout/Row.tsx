import { Component } from "valdi_core/src/Component";
import { Layout, View } from "valdi_tsx/src/NativeTemplateElements";
import { FlexAlignItems, FlexContainerProps, FlexJustifyContent, FlexWrap, toStyle } from "./types";

export interface RowProps extends FlexContainerProps {
  horizontalArrangement?: FlexJustifyContent;
  verticalAlignment?: FlexAlignItems;
  wrap?: FlexWrap;
}

export class Row extends Component<RowProps> {
  onRender(): void {
    const {
      horizontalArrangement = "flex-start",
      verticalAlignment = "center",
      wrap = "no-wrap",
      style,
      testTag,
      accessibilityLabel,
    } = this.viewModel ?? {};
    const resolvedStyle = toStyle<Layout | View>(style as any);

    <view
      flexDirection="row"
      justifyContent={horizontalArrangement}
      alignItems={verticalAlignment}
      flexWrap={wrap}
      style={resolvedStyle}
      accessibilityId={testTag}
      accessibilityLabel={accessibilityLabel}
    >
      <slot />
    </view>;
  }
}
