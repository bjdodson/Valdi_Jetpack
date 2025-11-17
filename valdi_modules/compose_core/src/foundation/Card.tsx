import { Component } from "valdi_core/src/Component";
import { Style } from "valdi_core/src/Style";
import { CSSValue, Layout, View } from "valdi_tsx/src/NativeTemplateElements";
import { TouchEvent } from "valdi_tsx/src/GestureEvents";

export interface CardProps {
  backgroundColor?: string;
  borderRadius?: CSSValue;
  elevation?: number;
  borderColor?: string;
  borderWidth?: CSSValue;
  padding?: CSSValue;
  margin?: CSSValue;
  slowClipping?: boolean;
  accessibilityLabel?: string;
  testTag?: string;
  style?: Style<View | Layout>;
  onTap?: (event: TouchEvent) => void;
  onTouch?: (event: TouchEvent) => void;
}

const DEFAULT_CARD_RADIUS: CSSValue = 8;

function elevationToShadow(elevation?: number): string | undefined {
  if (elevation === undefined) {
    return undefined;
  }
  const blur = Math.max(2, elevation * 2);
  const offset = Math.max(1, Math.floor(elevation / 2));
  return `0 ${offset} ${blur} rgba(0, 0, 0, 0.2)`;
}

/**
 * Simple Card surface with optional elevation and rounding.
 */
export class Card extends Component<CardProps> {
  onRender(): void {
    const {
      backgroundColor = "white",
      borderRadius = DEFAULT_CARD_RADIUS,
      elevation,
      borderColor,
      borderWidth,
      padding,
      margin,
      slowClipping,
      accessibilityLabel,
      testTag,
      style,
      onTap,
      onTouch,
    } = this.viewModel ?? {};

    const boxShadow = elevationToShadow(elevation);

    <view
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
      boxShadow={boxShadow}
      borderColor={borderColor}
      borderWidth={borderWidth ?? (borderColor ? 1 : undefined)}
      padding={padding}
      margin={margin}
      slowClipping={slowClipping}
      accessibilityLabel={accessibilityLabel}
      accessibilityId={testTag}
      style={style}
      onTap={onTap}
      onTouch={onTouch}
    >
      <slot />
    </view>;
  }
}
