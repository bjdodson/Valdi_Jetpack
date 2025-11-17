import { Component } from "valdi_core/src/Component";
import { FlexAlignItems, FlexContainerProps, FlexJustifyContent, FlexWrap } from "./types";

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

    <view
      flexDirection="column"
      justifyContent={verticalArrangement}
      alignItems={horizontalAlignment}
      flexWrap={wrap}
      style={style}
      accessibilityId={testTag}
      accessibilityLabel={accessibilityLabel}
    >
      <slot />
    </view>;
  }
}
