import { Component } from "valdi_core/src/Component";
import { FlexAlignItems, FlexContainerProps, FlexJustifyContent, FlexWrap } from "./types";

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

    <view
      flexDirection="row"
      justifyContent={horizontalArrangement}
      alignItems={verticalAlignment}
      flexWrap={wrap}
      style={style}
      accessibilityId={testTag}
      accessibilityLabel={accessibilityLabel}
    >
      <slot />
    </view>;
  }
}
