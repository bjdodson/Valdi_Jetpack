import { Component } from "valdi_core/src/Component";
import { Style } from "valdi_core/src/Style";
import {
  Label,
  LabelTextAlign,
  LabelTextDecoration,
  LabelValue,
  Layout,
  View,
} from "valdi_tsx/src/NativeTemplateElements";
import { TouchEvent } from "valdi_tsx/src/GestureEvents";
import { toStyle } from "../layout/types";

export interface TextProps {
  text: LabelValue;
  color?: string;
  font?: string;
  textAlign?: LabelTextAlign;
  maxLines?: number;
  /** Absolute line height in layout points, matching Compose-style callers. */
  lineHeight?: number;
  letterSpacing?: number;
  textDecoration?: LabelTextDecoration;
  accessibilityLabel?: string;
  testTag?: string;
  style?: Style<Label | View | Layout> | Partial<Label & View & Layout>;
  onTap?: (event: TouchEvent) => void;
}

/** Convert the public point-based line height to Valdi's font-size multiplier. */
export function textLineHeightRatio(lineHeight?: number, font?: string): number | undefined {
  if (lineHeight === undefined) {
    return undefined;
  }
  const fontSize = font ? Number(font.trim().split(/\s+/)[1]) : 12;
  return lineHeight / (Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 12);
}

/**
 * Compose-style text wrapper around Valdi's <label/> element.
 */
export class Text extends Component<TextProps> {
  onRender(): void {
    const {
      text,
      color,
      font,
      textAlign,
      maxLines,
      lineHeight,
      letterSpacing,
      textDecoration,
      accessibilityLabel,
      testTag,
      style,
      onTap,
    } = this.viewModel ?? {};
    const resolvedStyle = toStyle<Label | View | Layout>(style as any);
    const resolvedLineHeight = textLineHeightRatio(lineHeight, font);

    <label
      value={text}
      color={color}
      font={font}
      textAlign={textAlign}
      numberOfLines={maxLines ?? 0}
      lineHeight={resolvedLineHeight}
      letterSpacing={letterSpacing}
      textDecoration={textDecoration}
      accessibilityLabel={accessibilityLabel}
      accessibilityId={testTag}
      onTap={onTap}
      style={resolvedStyle}
    />;
  }
}
